import type { Express, Request } from "express";
import type { Server } from "http";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";
import { authStorage } from "./replit_integrations/auth/storage";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

// Helper to check admin status
// We need to fetch the user from DB to check the 'isAdmin' flag
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
  // Set up authentication
  await setupAuth(app);
  registerAuthRoutes(app);

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
    
    // Admin sees all, User sees theirs
    const orders = await storage.getOrders(user?.isAdmin ? undefined : userId);
    res.json(orders);
  });

  app.post(api.orders.create.path, async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const input = api.orders.create.input.parse(req.body);
    
    // Calculate total on server side
    let total = 0;
    for (const item of input.items) {
      const product = await storage.getProduct(item.productId);
      if (!product) throw new Error("Product not found");
      total += product.price * item.quantity;
      if (item.specialRequests) {
         // Add $2 upcharge for special requests as an example
         total += 200 * item.quantity; 
      }
    }

    const userId = (req.user as any).claims.sub;
    const order = await storage.createOrder(userId, input.items, total);
    res.status(201).json(order);
  });

  // Stripe
  app.post(api.payment.createIntent.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send();
    // Mock stripe intent creation if no key
    if (!process.env.STRIPE_SECRET_KEY) {
       console.log("Mocking Stripe Payment Intent");
       return res.json({ clientSecret: "mock_client_secret_" + Date.now() });
    }
    
    // Real Stripe implementation would go here
    // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    // const paymentIntent = await stripe.paymentIntents.create({...});
    // res.json({ clientSecret: paymentIntent.client_secret });
    
    res.json({ clientSecret: "mock_client_secret_demo" });
  });

  // Seed Data
  if ((await storage.getProducts()).length === 0) {
    console.log("Seeding database...");
    
    // Seed products only. Admin must be promoted manually after login.
    await storage.createProduct({
      name: "Grandma's Chicken Noodle",
      description: "Classic comfort food with homemade noodles.",
      price: 800,
      category: "soup",
      imageUrl: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&q=80&w=800",
      inventoryCount: 20,
    });
    
    await storage.createProduct({
      name: "Spicy Tomato Basil",
      description: "Rich tomato soup with a kick of fresh basil and chili.",
      price: 750,
      category: "soup",
      imageUrl: "https://images.unsplash.com/photo-1596450523032-4740a6b729bc?auto=format&fit=crop&q=80&w=800",
      inventoryCount: 15,
    });

    await storage.createProduct({
      name: "Soulful Mug",
      description: "Keep your soup warm in style.",
      price: 1200,
      category: "merch",
      imageUrl: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&q=80&w=800",
      inventoryCount: 50,
    });
  }

  return httpServer;
}
