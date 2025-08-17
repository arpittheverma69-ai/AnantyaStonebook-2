import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { geminiService } from "./gemini-service";
import { astrologicalAIService } from "./astrological-ai";
import { taskAutomationService } from "./task-automation";
// Remove custom auth service and middleware; Supabase client-only auth
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
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://luaoeowqcvnbjcpascnk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1YW9lb3dxY3ZuYmpjcGFzY25rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzOTgxMTEsImV4cCI6MjA2OTk3NDExMX0.Gf8dsa6oxudXZ8AB2mpz_FVTFx2y8wyD6TF7dyAWBG8';
const supabase = createClient(supabaseUrl, supabaseKey);

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

  // No custom auth endpoints: use Supabase client-side auth only

  // Dashboard metrics endpoint
  app.get("/api/dashboard/metrics", async (req, res) => {
    try {
      const inventory = await storage.getInventory();
      const sales = await storage.getSales();
      const clients = await storage.getClients();
      const suppliers = await storage.getSuppliers();
      const certifications = await storage.getCertifications();
      const consultations = await storage.getConsultations();
      const tasks = await storage.getTasks();
      
      // Calculate monthly sales (current month)
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthlySales = await storage.getSalesByDateRange(startOfMonth, now);
      const monthlyRevenue = monthlySales.reduce((sum, sale) => sum + parseFloat(sale.totalAmount), 0);
      
      // Calculate inventory value and stats
      const inventoryValue = inventory.reduce((sum, item) => sum + parseFloat(item.sellingPrice), 0);
      const availableStones = inventory.filter(item => item.isAvailable).length;
      const soldStones = inventory.filter(item => !item.isAvailable).length;
      const lowStockItems = inventory.filter(item => parseFloat(item.quantity) < 5).length;
      
      // Calculate client metrics
      const totalClients = clients.length;
      const activeClients = clients.filter(client => client.isRecurring).length;
      const trustworthyClients = clients.filter(client => client.isTrustworthy).length;
      
      // Calculate supplier metrics
      const totalSuppliers = suppliers.length;
      const domesticSuppliers = suppliers.filter(supplier => supplier.type === 'Domestic').length;
      const internationalSuppliers = suppliers.filter(supplier => supplier.type === 'International').length;
      const highQualitySuppliers = suppliers.filter(supplier => (supplier.qualityRating || 0) >= 4).length;
      
      // Calculate sales metrics
      const totalSales = sales.length;
      const totalRevenue = sales.reduce((sum, sale) => sum + parseFloat(sale.totalAmount), 0);
      const avgSaleValue = totalSales > 0 ? totalRevenue / totalSales : 0;
      const pendingPayments = sales.filter(sale => sale.paymentStatus === 'Pending').length;
      
      // Get pending certifications
      const pendingCerts = await storage.getPendingCertifications();
      
      // Get today's tasks and consultations
      const today = new Date();
      const todayTasks = await storage.getTasksByDueDate(today);
      const todayConsultations = consultations.filter(consultation => {
        const consultationDate = new Date(consultation.date);
        return consultationDate.toDateString() === today.toDateString();
      });
      
      // Calculate task metrics
      const pendingTasks = await storage.getPendingTasks();
      const highPriorityTasks = tasks.filter(task => task.priority === "High").length;
      const overdueTasks = tasks.filter(task => {
        const dueDate = new Date(task.dueDate);
        return dueDate < today && task.status !== "Completed";
      }).length;
      
      res.json({
        // Sales metrics
        monthlySales: monthlyRevenue,
        totalRevenue,
        totalSales,
        avgSaleValue,
        pendingPayments,
        
        // Inventory metrics
        inventoryValue,
        totalStones: inventory.length,
        availableStones,
        soldStones,
        lowStockItems,
        
        // Client metrics
        totalClients,
        activeClients,
        trustworthyClients,
        
        // Supplier metrics
        totalSuppliers,
        domesticSuppliers,
        internationalSuppliers,
        highQualitySuppliers,
        
        // Certification metrics
        pendingCerts: pendingCerts.length,
        totalCertifications: certifications.length,
        
        // Consultation metrics
        todayConsultations: todayConsultations.length,
        totalConsultations: consultations.length,
        
        // Task metrics
        followups: todayTasks.length,
        highPriority: highPriorityTasks,
        pendingTasks: pendingTasks.length,
        overdueTasks,
        
        // Additional metrics
        topPerformingSuppliers: suppliers
          .filter(s => (s.qualityRating || 0) >= 4)
          .sort((a, b) => (b.qualityRating || 0) - (a.qualityRating || 0))
          .slice(0, 5),
        
        recentSales: sales
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5)
          .map(sale => ({
            id: sale.id,
            clientName: sale.clientName || 'Unknown Client',
            gemName: sale.gemName || 'Unknown Gem',
            totalAmount: sale.totalAmount,
            saleDate: sale.createdAt,
            status: sale.status || 'Completed'
          })),
        
        lowStockItems: inventory
          .filter(item => parseFloat(item.weight) < 1) // Items less than 1 carat
          .slice(0, 5),
      });
    } catch (error) {
      console.error("Dashboard metrics error:", error);
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
      console.log('Received certification data:', req.body);
      
      // Validate required fields
      if (!req.body.lab) {
        return res.status(400).json({ message: "Lab is required" });
      }
      
      // Manual validation and transformation - NO SCHEMA VALIDATION
      const data = {
        lab: req.body.lab,
        stone_id: req.body.stoneId || null,
        date_sent: req.body.dateSent ? new Date(req.body.dateSent) : null,
        status: req.body.status || 'Pending',
        notes: req.body.notes || null,
        certificate_file: req.file ? req.file.path : null
      };
      
      console.log('Processed certification data:', data);
      
      // Direct database call to bypass schema validation
      const { data: cert, error } = await supabase
        .from('certifications')
        .insert(data)
        .select()
        .single();
      
      if (error) {
        console.error('Database error:', error);
        return res.status(400).json({ message: "Database error", error: error.message });
      }
      
      res.status(201).json(cert);
    } catch (error) {
      console.error('Certification creation error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
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
      console.log("Received task data:", req.body);
      const data = insertTaskSchema.parse(req.body);
      console.log("Parsed task data:", data);
      const task = await storage.createTask(data);
      res.status(201).json(task);
    } catch (error) {
      console.error("Task creation error:", error);
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

  // AI Analysis routes
  app.post("/api/ai/analyze", async (req, res) => {
    try {
      const { query, context } = req.body;
      
      if (!query) {
        return res.status(400).json({ message: "Query is required" });
      }

      // Fetch all business data
      const [sales, inventory, clients, suppliers, certifications, consultations, tasks] = await Promise.all([
        storage.getSales(),
        storage.getInventory(),
        storage.getClients(),
        storage.getSuppliers(),
        storage.getCertifications(),
        storage.getConsultations(),
        storage.getTasks()
      ]);

      const businessData = {
        sales,
        inventory,
        clients,
        suppliers,
        certifications,
        consultations,
        tasks
      };

      const analysis = await geminiService.analyzeBusinessData({
        query,
        businessData,
        context
      });

      res.json(analysis);
    } catch (error) {
      console.error("AI Analysis error:", error);
      res.status(500).json({ message: "Failed to analyze data with AI" });
    }
  });

  app.get("/api/ai/insights", async (req, res) => {
    try {
      // Fetch all business data
      const [sales, inventory, clients, suppliers, certifications, consultations, tasks] = await Promise.all([
        storage.getSales(),
        storage.getInventory(),
        storage.getClients(),
        storage.getSuppliers(),
        storage.getCertifications(),
        storage.getConsultations(),
        storage.getTasks()
      ]);

      const businessData = {
        sales,
        inventory,
        clients,
        suppliers,
        certifications,
        consultations,
        tasks
      };

      const insights = await geminiService.generateBusinessInsights(businessData);
      res.json({ insights });
    } catch (error) {
      console.error("AI Insights error:", error);
      res.status(500).json({ message: "Failed to generate insights" });
    }
  });

  app.post("/api/ai/recommendations", async (req, res) => {
    try {
      const { focusArea } = req.body;
      
      if (!focusArea) {
        return res.status(400).json({ message: "Focus area is required" });
      }

      // Fetch all business data
      const [sales, inventory, clients, suppliers, certifications, consultations, tasks] = await Promise.all([
        storage.getSales(),
        storage.getInventory(),
        storage.getClients(),
        storage.getSuppliers(),
        storage.getCertifications(),
        storage.getConsultations(),
        storage.getTasks()
      ]);

      const businessData = {
        sales,
        inventory,
        clients,
        suppliers,
        certifications,
        consultations,
        tasks
      };

      const recommendations = await geminiService.generateRecommendations(businessData, focusArea);
      res.json({ recommendations });
    } catch (error) {
      console.error("AI Recommendations error:", error);
      res.status(500).json({ message: "Failed to generate recommendations" });
    }
  });

  // Astrological AI routes
  app.post("/api/astrological/analyze", async (req, res) => {
    try {
      const { zodiacSign, birthDate, birthTime, birthPlace, specificConcerns } = req.body;
      
      if (!zodiacSign) {
        return res.status(400).json({ message: "Zodiac sign is required" });
      }

      const profile = {
        zodiacSign,
        birthDate,
        birthTime,
        birthPlace,
        specificConcerns
      };

      const analysis = await astrologicalAIService.analyzeAstrologicalCompatibility(profile);
      res.json(analysis);
    } catch (error) {
      console.error("Astrological Analysis error:", error);
      res.status(500).json({ message: "Failed to analyze astrological compatibility" });
    }
  });

  app.post("/api/astrological/quick-recommendation", async (req, res) => {
    try {
      const { zodiacSign, concern } = req.body;
      
      if (!zodiacSign || !concern) {
        return res.status(400).json({ message: "Zodiac sign and concern are required" });
      }

      const recommendation = await astrologicalAIService.getQuickRecommendation(zodiacSign, concern);
      res.json({ recommendation });
    } catch (error) {
      console.error("Quick Recommendation error:", error);
      res.status(500).json({ message: "Failed to get quick recommendation" });
    }
  });

  // Task Automation routes
  app.get("/api/tasks/smart-suggestions", async (req, res) => {
    try {
      const smartTasks = await taskAutomationService.generateSmartTasks();
      res.json({ suggestions: smartTasks });
    } catch (error) {
      console.error("Smart task suggestions error:", error);
      res.status(500).json({ message: "Failed to generate smart task suggestions" });
    }
  });

  app.get("/api/tasks/templates", async (req, res) => {
    try {
      const templates = await taskAutomationService.getTaskTemplates();
      res.json({ templates });
    } catch (error) {
      console.error("Task templates error:", error);
      res.status(500).json({ message: "Failed to get task templates" });
    }
  });

  app.post("/api/tasks/from-template", async (req, res) => {
    try {
      const { templateId, customizations } = req.body;
      
      if (!templateId) {
        return res.status(400).json({ message: "Template ID is required" });
      }

      const taskData = await taskAutomationService.createTaskFromTemplate(templateId, customizations);
      
      // Create the actual task in the database
      const newTask = await storage.createTask(taskData);
      res.json({ task: newTask });
    } catch (error) {
      console.error("Create task from template error:", error);
      res.status(500).json({ message: "Failed to create task from template" });
    }
  });

  app.get("/api/tasks/automation-rules", async (req, res) => {
    try {
      const rules = await taskAutomationService.getAutomationRules();
      res.json({ rules });
    } catch (error) {
      console.error("Automation rules error:", error);
      res.status(500).json({ message: "Failed to get automation rules" });
    }
  });

  app.post("/api/tasks/run-automation", async (req, res) => {
    try {
      const triggeredTasks = await taskAutomationService.runAutomationChecks();
      res.json({ triggeredTasks });
    } catch (error) {
      console.error("Run automation error:", error);
      res.status(500).json({ message: "Failed to run automation checks" });
    }
  });

  app.get("/api/tasks/insights", async (req, res) => {
    try {
      const insights = await taskAutomationService.getTaskInsights();
      res.json({ insights });
    } catch (error) {
      console.error("Task insights error:", error);
      res.status(500).json({ message: "Failed to get task insights" });
    }
  });

  // Profile management endpoints
  app.get("/api/profile/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      
      // Get user from Supabase auth using the authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const token = authHeader.split(' ')[1];
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      
      if (authError || !user || user.id !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      // Get profile data from users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      // Combine user data with metadata
      const profileData = {
        id: user.id,
        email: user.email,
        fullName: user.user_metadata?.full_name || userData?.full_name || "",
        role: user.user_metadata?.role || userData?.role || "Member",
        phone: user.user_metadata?.phone || userData?.phone || "",
        address: user.user_metadata?.address || userData?.address || "",
        city: user.user_metadata?.city || userData?.city || "",
        state: user.user_metadata?.state || userData?.state || "",
        businessName: user.user_metadata?.business_name || userData?.business_name || "",
        specialization: user.user_metadata?.specialization || userData?.specialization || "",
        experience: user.user_metadata?.experience || userData?.experience || "",
        bio: user.user_metadata?.bio || userData?.bio || "",
        avatar: user.user_metadata?.avatar || userData?.avatar || "",
        preferences: user.user_metadata?.preferences || userData?.preferences || {
          theme: "light",
          notifications: true,
          language: "en"
        }
      };

      res.json(profileData);
    } catch (error) {
      console.error('Profile fetch error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/profile", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const token = authHeader.split(' ')[1];
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      
      if (authError || !user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const profileData = req.body;
      
      // Store in users table first - handle missing columns gracefully
      try {
        const updateData: any = {
          id: user.id,
          username: profileData.fullName || user.email,
          updated_at: new Date().toISOString()
        };

        // Only include fields that exist in the current schema
        if (profileData.fullName) updateData.full_name = profileData.fullName;
        if (profileData.role) updateData.role = profileData.role;
        if (profileData.phone) updateData.phone = profileData.phone;
        if (profileData.address) updateData.address = profileData.address;
        if (profileData.city) updateData.city = profileData.city;
        if (profileData.state) updateData.state = profileData.state;
        if (profileData.businessName) updateData.business_name = profileData.businessName;
        if (profileData.specialization) updateData.specialization = profileData.specialization;
        if (profileData.experience) updateData.experience = profileData.experience;
        if (profileData.bio) updateData.bio = profileData.bio;
        if (profileData.avatar) updateData.avatar = profileData.avatar;
        if (profileData.preferences) updateData.preferences = JSON.stringify(profileData.preferences);

        const { error: dbError } = await supabase
          .from('users')
          .upsert(updateData, {
            onConflict: 'id'
          });

        if (dbError) {
          console.error('Database update error:', dbError);
          // Try a simpler update approach
          const { error: simpleError } = await supabase
            .from('users')
            .upsert({
              id: user.id,
              username: profileData.fullName || user.email,
              full_name: profileData.fullName,
              role: profileData.role,
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'id'
            });

          if (simpleError) {
            console.error('Simple database update error:', simpleError);
            return res.status(500).json({ message: "Failed to update profile in database" });
          }
        }
      } catch (dbError) {
        console.error('Database error:', dbError);
        // Continue even if database update fails
      }

      // Try to update auth metadata for essential fields only
      try {
        const { error: updateError } = await supabase.auth.updateUser({
          data: {
            full_name: profileData.fullName,
            role: profileData.role
          }
        });

        if (updateError) {
          console.error('Auth update error:', updateError);
          // Don't fail the request if auth update fails
        }
      } catch (authError) {
        console.error('Auth update error:', authError);
        // Continue even if auth update fails
      }

      res.json({ message: "Profile updated successfully" });
    } catch (error) {
      console.error('Profile update error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/profile", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const token = authHeader.split(' ')[1];
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      
      if (authError || !user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const profileData = req.body;
      
      // Store in users table first - handle missing columns gracefully
      try {
        const updateData: any = {
          updated_at: new Date().toISOString()
        };

        // Only include fields that exist in the current schema
        if (profileData.fullName) updateData.full_name = profileData.fullName;
        if (profileData.role) updateData.role = profileData.role;
        if (profileData.phone) updateData.phone = profileData.phone;
        if (profileData.address) updateData.address = profileData.address;
        if (profileData.city) updateData.city = profileData.city;
        if (profileData.state) updateData.state = profileData.state;
        if (profileData.businessName) updateData.business_name = profileData.businessName;
        if (profileData.specialization) updateData.specialization = profileData.specialization;
        if (profileData.experience) updateData.experience = profileData.experience;
        if (profileData.bio) updateData.bio = profileData.bio;
        if (profileData.avatar) updateData.avatar = profileData.avatar;
        if (profileData.preferences) updateData.preferences = JSON.stringify(profileData.preferences);

        const { error: dbError } = await supabase
          .from('users')
          .update(updateData)
          .eq('id', user.id);

        if (dbError) {
          console.error('Database update error:', dbError);
          // Try a simpler update approach
          const { error: simpleError } = await supabase
            .from('users')
            .update({
              username: profileData.fullName || user.email,
              full_name: profileData.fullName,
              role: profileData.role,
              updated_at: new Date().toISOString()
            })
            .eq('id', user.id);

          if (simpleError) {
            console.error('Simple database update error:', simpleError);
            return res.status(500).json({ message: "Failed to update profile in database" });
          }
        }
      } catch (dbError) {
        console.error('Database error:', dbError);
        // Continue even if database update fails
      }

      // Try to update auth metadata for essential fields only
      try {
        const { error: updateError } = await supabase.auth.updateUser({
          data: {
            full_name: profileData.fullName,
            role: profileData.role
          }
        });

        if (updateError) {
          console.error('Auth update error:', updateError);
          // Don't fail the request if auth update fails
        }
      } catch (authError) {
        console.error('Auth update error:', authError);
        // Continue even if auth update fails
      }

      res.json({ message: "Profile updated successfully" });
    } catch (error) {
      console.error('Profile update error:', error);
      res.status(500).json({ message: "Internal server error" });
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

  // Remove phone auth flows

  const httpServer = createServer(app);
  return httpServer;
}
