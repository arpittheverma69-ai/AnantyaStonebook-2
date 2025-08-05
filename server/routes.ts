import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertInventorySchema,
  insertClientSchema,
  insertSupplierSchema,
  insertSaleSchema,
  insertCertificationSchema,
  insertConsultationSchema,
  insertTaskSchema,
} from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  dest: uploadDir,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow common document and image formats
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Dashboard metrics endpoint
  app.get("/api/dashboard/metrics", async (req, res) => {
    try {
      const inventory = await storage.getInventory();
      const sales = await storage.getSales();
      const certifications = await storage.getCertifications();
      const tasks = await storage.getTasks();
      
      // Calculate monthly sales (current month)
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthlySales = await storage.getSalesByDateRange(startOfMonth, now);
      const monthlyRevenue = monthlySales.reduce((sum, sale) => sum + parseFloat(sale.totalAmount), 0);
      
      // Calculate inventory value
      const inventoryValue = inventory.reduce((sum, item) => sum + parseFloat(item.sellingPrice), 0);
      
      // Get pending certifications
      const pendingCerts = await storage.getPendingCertifications();
      
      // Get today's tasks
      const today = new Date();
      const todayTasks = await storage.getTasksByDueDate(today);
      
      res.json({
        monthlySales: monthlyRevenue,
        inventoryValue,
        totalStones: inventory.length,
        pendingCerts: pendingCerts.length,
        followups: todayTasks.length,
        highPriority: todayTasks.filter(t => t.priority === "High").length,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard metrics" });
    }
  });

  // Inventory routes
  app.get("/api/inventory", async (req, res) => {
    try {
      const inventory = await storage.getInventory();
      res.json(inventory);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch inventory" });
    }
  });

  app.get("/api/inventory/:id", async (req, res) => {
    try {
      const item = await storage.getInventoryItem(req.params.id);
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }
      res.json(item);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch item" });
    }
  });

  app.post("/api/inventory", upload.single("certificateFile"), async (req, res) => {
    try {
      const data = insertInventorySchema.parse(req.body);
      if (req.file) {
        data.certificateFile = req.file.path;
      }
      const item = await storage.createInventoryItem(data);
      res.status(201).json(item);
    } catch (error) {
      res.status(400).json({ message: "Invalid data", error: error.message });
    }
  });

  app.patch("/api/inventory/:id", upload.single("certificateFile"), async (req, res) => {
    try {
      const data = { ...req.body };
      if (req.file) {
        data.certificateFile = req.file.path;
      }
      const item = await storage.updateInventoryItem(req.params.id, data);
      res.json(item);
    } catch (error) {
      res.status(400).json({ message: "Failed to update item", error: error.message });
    }
  });

  app.delete("/api/inventory/:id", async (req, res) => {
    try {
      await storage.deleteInventoryItem(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete item" });
    }
  });

  app.get("/api/inventory/search/:query", async (req, res) => {
    try {
      const results = await storage.searchInventory(req.params.query);
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: "Search failed" });
    }
  });

  // Clients routes
  app.get("/api/clients", async (req, res) => {
    try {
      const clients = await storage.getClients();
      res.json(clients);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  });

  app.get("/api/clients/:id", async (req, res) => {
    try {
      const client = await storage.getClient(req.params.id);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.json(client);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch client" });
    }
  });

  app.post("/api/clients", async (req, res) => {
    try {
      const data = insertClientSchema.parse(req.body);
      const client = await storage.createClient(data);
      res.status(201).json(client);
    } catch (error) {
      res.status(400).json({ message: "Invalid data", error: error.message });
    }
  });

  app.patch("/api/clients/:id", async (req, res) => {
    try {
      const client = await storage.updateClient(req.params.id, req.body);
      res.json(client);
    } catch (error) {
      res.status(400).json({ message: "Failed to update client", error: error.message });
    }
  });

  app.delete("/api/clients/:id", async (req, res) => {
    try {
      await storage.deleteClient(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete client" });
    }
  });

  app.get("/api/clients/search/:query", async (req, res) => {
    try {
      const results = await storage.searchClients(req.params.query);
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: "Search failed" });
    }
  });

  // Suppliers routes
  app.get("/api/suppliers", async (req, res) => {
    try {
      const suppliers = await storage.getSuppliers();
      res.json(suppliers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch suppliers" });
    }
  });

  app.get("/api/suppliers/:id", async (req, res) => {
    try {
      const supplier = await storage.getSupplier(req.params.id);
      if (!supplier) {
        return res.status(404).json({ message: "Supplier not found" });
      }
      res.json(supplier);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch supplier" });
    }
  });

  app.post("/api/suppliers", async (req, res) => {
    try {
      const data = insertSupplierSchema.parse(req.body);
      const supplier = await storage.createSupplier(data);
      res.status(201).json(supplier);
    } catch (error) {
      res.status(400).json({ message: "Invalid data", error: error.message });
    }
  });

  app.patch("/api/suppliers/:id", async (req, res) => {
    try {
      const supplier = await storage.updateSupplier(req.params.id, req.body);
      res.json(supplier);
    } catch (error) {
      res.status(400).json({ message: "Failed to update supplier", error: error.message });
    }
  });

  app.delete("/api/suppliers/:id", async (req, res) => {
    try {
      await storage.deleteSupplier(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete supplier" });
    }
  });

  // Sales routes
  app.get("/api/sales", async (req, res) => {
    try {
      const sales = await storage.getSales();
      res.json(sales);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sales" });
    }
  });

  app.post("/api/sales", upload.single("invoiceFile"), async (req, res) => {
    try {
      const data = insertSaleSchema.parse(req.body);
      if (req.file) {
        data.invoiceFile = req.file.path;
      }
      const sale = await storage.createSale(data);
      res.status(201).json(sale);
    } catch (error) {
      res.status(400).json({ message: "Invalid data", error: error.message });
    }
  });

  // Certifications routes
  app.get("/api/certifications", async (req, res) => {
    try {
      const certifications = await storage.getCertifications();
      res.json(certifications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch certifications" });
    }
  });

  app.post("/api/certifications", upload.single("certificateFile"), async (req, res) => {
    try {
      const data = insertCertificationSchema.parse(req.body);
      if (req.file) {
        data.certificateFile = req.file.path;
      }
      const cert = await storage.createCertification(data);
      res.status(201).json(cert);
    } catch (error) {
      res.status(400).json({ message: "Invalid data", error: error.message });
    }
  });

  app.patch("/api/certifications/:id", upload.single("certificateFile"), async (req, res) => {
    try {
      const data = { ...req.body };
      if (req.file) {
        data.certificateFile = req.file.path;
      }
      const cert = await storage.updateCertification(req.params.id, data);
      res.json(cert);
    } catch (error) {
      res.status(400).json({ message: "Failed to update certification", error: error.message });
    }
  });

  // Consultations routes
  app.get("/api/consultations", async (req, res) => {
    try {
      const consultations = await storage.getConsultations();
      res.json(consultations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch consultations" });
    }
  });

  app.post("/api/consultations", async (req, res) => {
    try {
      const data = insertConsultationSchema.parse(req.body);
      const consultation = await storage.createConsultation(data);
      res.status(201).json(consultation);
    } catch (error) {
      res.status(400).json({ message: "Invalid data", error: error.message });
    }
  });

  // Tasks routes
  app.get("/api/tasks", async (req, res) => {
    try {
      const tasks = await storage.getTasks();
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.post("/api/tasks", async (req, res) => {
    try {
      const data = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(data);
      res.status(201).json(task);
    } catch (error) {
      res.status(400).json({ message: "Invalid data", error: error.message });
    }
  });

  app.patch("/api/tasks/:id", async (req, res) => {
    try {
      const task = await storage.updateTask(req.params.id, req.body);
      res.json(task);
    } catch (error) {
      res.status(400).json({ message: "Failed to update task", error: error.message });
    }
  });

  // File serving route
  app.get("/api/files/:filename", (req, res) => {
    const filename = req.params.filename;
    const filepath = path.join(uploadDir, filename);
    
    if (fs.existsSync(filepath)) {
      res.sendFile(filepath);
    } else {
      res.status(404).json({ message: "File not found" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
