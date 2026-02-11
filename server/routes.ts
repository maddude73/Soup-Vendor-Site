import type { Express, Request } from "express";
import type { Server } from "http";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";
import { authStorage } from "./replit_integrations/auth/storage";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { getUncachableStripeClient, getStripePublishableKey } from "./stripeClient";

const isAdmin = async (req: Request, res: any, next: any) => {
  if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
  
  const userId = (req.user as any).claims.sub;
  const user = await authStorage.getUser(userId);
  
  if (!user || !user.isAdmin) {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
};

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await setupAuth(app);
  registerAuthRoutes(app);

  // Stripe publishable key endpoint for frontend
  app.get("/api/stripe/publishable-key", async (req, res) => {
    try {
      const key = await getStripePublishableKey();
      res.json({ publishableKey: key });
    } catch (error) {
      console.error("Error getting Stripe publishable key:", error);
      res.status(500).json({ message: "Stripe not configured" });
    }
  });

  // Products
  app.get(api.products.list.path, async (req, res) => {
    const products = await storage.getProducts();
    res.json(products);
  });

  app.get(api.products.get.path, async (req, res) => {
    const product = await storage.getProduct(Number(req.params.id));
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  });

  app.post(api.products.create.path, isAdmin, async (req, res) => {
    const input = api.products.create.input.parse(req.body);
    const product = await storage.createProduct(input);
    res.status(201).json(product);
  });

  app.put(api.products.update.path, isAdmin, async (req, res) => {
    const input = api.products.update.input.parse(req.body);
    const product = await storage.updateProduct(Number(req.params.id), input);
    res.json(product);
  });

  app.delete(api.products.delete.path, isAdmin, async (req, res) => {
    await storage.deleteProduct(Number(req.params.id));
    res.status(204).send();
  });

  // Orders
  app.get(api.orders.list.path, async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const userId = (req.user as any).claims.sub;
    const user = await authStorage.getUser(userId);
    
    const orders = await storage.getOrders(user?.isAdmin ? undefined : userId);
    res.json(orders);
  });

  app.post(api.orders.create.path, async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const input = api.orders.create.input.parse(req.body);
      
      let total = 0;
      for (const item of input.items) {
        const product = await storage.getProduct(item.productId);
        if (!product) return res.status(400).json({ message: `Product ${item.productId} not found` });
        if (product.inventoryCount < item.quantity) {
          return res.status(400).json({ message: `${product.name} is sold out or insufficient stock` });
        }
        total += product.price * item.quantity;
        if (item.specialRequests) {
          total += 200 * item.quantity;
        }
      }

      const userId = (req.user as any).claims.sub;
      const order = await storage.createOrder(userId, input.items, total, input.customerInfo);
      res.status(201).json(order);
    } catch (err: any) {
      console.error("Order creation error:", err);
      res.status(400).json({ message: err.message || "Failed to create order" });
    }
  });

  app.post(api.payment.createIntent.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    try {
      const { orderId } = req.body;
      if (!orderId) return res.status(400).json({ message: "Order ID required" });

      const userId = (req.user as any).claims.sub;
      const orders = await storage.getOrders(userId);
      const order = orders.find(o => o.id === orderId);
      if (!order) return res.status(404).json({ message: "Order not found" });
      if (order.status === "paid") return res.status(400).json({ message: "Order already paid" });

      const totalWithTax = Math.round(order.totalAmount * 1.08);

      const stripe = await getUncachableStripeClient();
      const paymentIntent = await stripe.paymentIntents.create({
        amount: totalWithTax,
        currency: 'usd',
        metadata: { orderId: String(orderId) },
        automatic_payment_methods: { enabled: true },
      });

      await storage.updateOrderStatus(orderId, "pending", paymentIntent.id);

      res.json({ clientSecret: paymentIntent.client_secret, amount: totalWithTax });
    } catch (error: any) {
      console.error("Stripe payment intent error:", error);
      res.status(500).json({ message: "Failed to create payment intent" });
    }
  });

  app.post("/api/orders/:id/confirm-payment", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    try {
      const orderId = Number(req.params.id);
      const userId = (req.user as any).claims.sub;
      const { paymentIntentId } = req.body;

      const orders = await storage.getOrders(userId);
      const order = orders.find(o => o.id === orderId);
      if (!order) return res.status(404).json({ message: "Order not found" });
      if (order.stripePaymentIntentId !== paymentIntentId) {
        return res.status(400).json({ message: "Payment intent mismatch" });
      }

      const stripe = await getUncachableStripeClient();
      const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
      if (intent.status !== "succeeded") {
        return res.status(400).json({ message: "Payment not completed" });
      }

      const updated = await storage.updateOrderStatus(orderId, "paid", paymentIntentId);
      res.json(updated);
    } catch (error: any) {
      console.error("Order payment confirmation error:", error);
      res.status(500).json({ message: "Failed to confirm payment" });
    }
  });

  // Admin: Update order status (fulfill)
  app.put("/api/orders/:id/status", isAdmin, async (req, res) => {
    try {
      const orderId = Number(req.params.id);
      const { status } = req.body;
      if (!["pending", "paid", "fulfilled"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      const order = await storage.updateOrderStatus(orderId, status);
      res.json(order);
    } catch (error: any) {
      console.error("Order status update error:", error);
      res.status(500).json({ message: "Failed to update order status" });
    }
  });

  // Seed Data
  if ((await storage.getProducts()).length === 0) {
    console.log("Seeding database...");
    
    await storage.createProduct({
      name: "Grandma's Chicken Noodle",
      description: "Classic comfort food with homemade noodles, tender chicken, and garden vegetables simmered to perfection.",
      price: 800,
      category: "soup",
      imageUrl: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&q=80&w=800",
      inventoryCount: 20,
    });
    
    await storage.createProduct({
      name: "Spicy Tomato Basil",
      description: "Rich tomato soup with a kick of fresh basil and chili flakes. Pairs perfectly with crusty bread.",
      price: 750,
      category: "soup",
      imageUrl: "https://images.unsplash.com/photo-1596450523032-4740a6b729bc?auto=format&fit=crop&q=80&w=800",
      inventoryCount: 15,
    });

    await storage.createProduct({
      name: "Creamy Butternut Squash",
      description: "Velvety smooth butternut squash soup with a hint of nutmeg and brown sugar.",
      price: 850,
      category: "soup",
      imageUrl: "https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?auto=format&fit=crop&q=80&w=800",
      inventoryCount: 12,
    });

    await storage.createProduct({
      name: "Loaded Potato Soup",
      description: "Hearty potato soup loaded with bacon, cheddar, sour cream, and fresh chives.",
      price: 900,
      category: "soup",
      imageUrl: "https://images.unsplash.com/photo-1588566565463-180a5b2090d2?auto=format&fit=crop&q=80&w=800",
      inventoryCount: 10,
    });

    await storage.createProduct({
      name: "Soulful Mug",
      description: "Keep your soup warm in style with our signature ceramic mug.",
      price: 1200,
      category: "merch",
      imageUrl: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&q=80&w=800",
      inventoryCount: 50,
    });

    await storage.createProduct({
      name: "Donation",
      description: "Support our mission to bring nourishing soups to the community. Every dollar helps keep our kitchen warm and our hearts full.",
      price: 500,
      category: "donation",
      imageUrl: "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?auto=format&fit=crop&q=80&w=800",
      inventoryCount: 9999,
    });
  }

  return httpServer;
}
