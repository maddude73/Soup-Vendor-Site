import { db } from "./db";
import { 
  products, orders, orderItems, 
  type Product, type InsertProduct,
  type Order, type CartItem
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Products
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: number): Promise<void>;

  // Orders
  createOrder(userId: string, items: CartItem[], totalAmount: number): Promise<Order>;
  getOrders(userId?: string): Promise<(Order & { items: any[] })[]>;
  updateOrderStatus(orderId: number, status: string, stripePaymentIntentId?: string): Promise<Order>;
}

export class DatabaseStorage implements IStorage {
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products).orderBy(desc(products.id));
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product> {
    const [updated] = await db.update(products).set(product).where(eq(products.id, id)).returning();
    return updated;
  }

  async deleteProduct(id: number): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  async createOrder(userId: string, items: CartItem[], totalAmount: number): Promise<Order> {
    // Transactional order creation
    return await db.transaction(async (tx) => {
      const [order] = await tx.insert(orders).values({
        userId,
        totalAmount,
        status: "pending",
      }).returning();

      for (const item of items) {
        // Get current price to lock it in
        const [product] = await tx.select().from(products).where(eq(products.id, item.productId));
        if (!product) throw new Error(`Product ${item.productId} not found`);

        await tx.insert(orderItems).values({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          priceAtPurchase: product.price,
          specialRequests: item.specialRequests,
        });
        
        // Update inventory
        await tx.update(products)
          .set({ inventoryCount: product.inventoryCount - item.quantity })
          .where(eq(products.id, item.productId));
      }

      return order;
    });
  }

  async updateOrderStatus(orderId: number, status: string, stripePaymentIntentId?: string): Promise<Order> {
    const updateData: any = { status };
    if (stripePaymentIntentId) updateData.stripePaymentIntentId = stripePaymentIntentId;
    const [updated] = await db.update(orders).set(updateData).where(eq(orders.id, orderId)).returning();
    return updated;
  }

  async getOrders(userId?: string): Promise<(Order & { items: any[] })[]> {
    let query = db.select().from(orders).orderBy(desc(orders.createdAt));
    if (userId) {
      query = query.where(eq(orders.userId, userId)) as any;
    }
    
    const ordersList = await query;
    const result = [];
    
    for (const order of ordersList) {
      const items = await db.select({
        id: orderItems.id,
        quantity: orderItems.quantity,
        priceAtPurchase: orderItems.priceAtPurchase,
        specialRequests: orderItems.specialRequests,
        product: products
      })
      .from(orderItems)
      .leftJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, order.id));
      
      result.push({ ...order, items });
    }
    
    return result;
  }
}

export const storage = new DatabaseStorage();
