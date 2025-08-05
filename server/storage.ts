import { randomUUID } from "crypto";
import {
  type User,
  type InsertUser,
  type Inventory,
  type InsertInventory,
  type Client,
  type InsertClient,
  type Supplier,
  type InsertSupplier,
  type Sale,
  type InsertSale,
  type Certification,
  type InsertCertification,
  type Consultation,
  type InsertConsultation,
  type Task,
  type InsertTask,
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Inventory
  getInventory(): Promise<Inventory[]>;
  getInventoryItem(id: string): Promise<Inventory | undefined>;
  createInventoryItem(item: InsertInventory): Promise<Inventory>;
  updateInventoryItem(id: string, item: Partial<InsertInventory>): Promise<Inventory>;
  deleteInventoryItem(id: string): Promise<void>;
  searchInventory(query: string): Promise<Inventory[]>;

  // Clients
  getClients(): Promise<Client[]>;
  getClient(id: string): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: string, client: Partial<InsertClient>): Promise<Client>;
  deleteClient(id: string): Promise<void>;
  searchClients(query: string): Promise<Client[]>;

  // Suppliers
  getSuppliers(): Promise<Supplier[]>;
  getSupplier(id: string): Promise<Supplier | undefined>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;
  updateSupplier(id: string, supplier: Partial<InsertSupplier>): Promise<Supplier>;
  deleteSupplier(id: string): Promise<void>;
  searchSuppliers(query: string): Promise<Supplier[]>;

  // Sales
  getSales(): Promise<Sale[]>;
  getSale(id: string): Promise<Sale | undefined>;
  createSale(sale: InsertSale): Promise<Sale>;
  updateSale(id: string, sale: Partial<InsertSale>): Promise<Sale>;
  deleteSale(id: string): Promise<void>;
  getSalesByClient(clientId: string): Promise<Sale[]>;
  getSalesByDateRange(startDate: Date, endDate: Date): Promise<Sale[]>;

  // Certifications
  getCertifications(): Promise<Certification[]>;
  getCertification(id: string): Promise<Certification | undefined>;
  createCertification(cert: InsertCertification): Promise<Certification>;
  updateCertification(id: string, cert: Partial<InsertCertification>): Promise<Certification>;
  deleteCertification(id: string): Promise<void>;
  getPendingCertifications(): Promise<Certification[]>;

  // Consultations
  getConsultations(): Promise<Consultation[]>;
  getConsultation(id: string): Promise<Consultation | undefined>;
  createConsultation(consultation: InsertConsultation): Promise<Consultation>;
  updateConsultation(id: string, consultation: Partial<InsertConsultation>): Promise<Consultation>;
  deleteConsultation(id: string): Promise<void>;
  getConsultationsByClient(clientId: string): Promise<Consultation[]>;

  // Tasks
  getTasks(): Promise<Task[]>;
  getTask(id: string): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, task: Partial<InsertTask>): Promise<Task>;
  deleteTask(id: string): Promise<void>;
  getTasksByDueDate(date: Date): Promise<Task[]>;
  getPendingTasks(): Promise<Task[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private inventory: Map<string, Inventory>;
  private clients: Map<string, Client>;
  private suppliers: Map<string, Supplier>;
  private sales: Map<string, Sale>;
  private certifications: Map<string, Certification>;
  private consultations: Map<string, Consultation>;
  private tasks: Map<string, Task>;

  constructor() {
    this.users = new Map();
    this.inventory = new Map();
    this.clients = new Map();
    this.suppliers = new Map();
    this.sales = new Map();
    this.certifications = new Map();
    this.consultations = new Map();
    this.tasks = new Map();
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Inventory
  async getInventory(): Promise<Inventory[]> {
    return Array.from(this.inventory.values());
  }

  async getInventoryItem(id: string): Promise<Inventory | undefined> {
    return this.inventory.get(id);
  }

  async createInventoryItem(item: InsertInventory): Promise<Inventory> {
    const id = randomUUID();
    const now = new Date();
    const inventoryItem: Inventory = {
      ...item,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.inventory.set(id, inventoryItem);
    return inventoryItem;
  }

  async updateInventoryItem(id: string, item: Partial<InsertInventory>): Promise<Inventory> {
    const existing = this.inventory.get(id);
    if (!existing) {
      throw new Error("Inventory item not found");
    }
    const updated: Inventory = {
      ...existing,
      ...item,
      updatedAt: new Date(),
    };
    this.inventory.set(id, updated);
    return updated;
  }

  async deleteInventoryItem(id: string): Promise<void> {
    this.inventory.delete(id);
  }

  async searchInventory(query: string): Promise<Inventory[]> {
    const items = Array.from(this.inventory.values());
    return items.filter(item =>
      item.type.toLowerCase().includes(query.toLowerCase()) ||
      item.origin.toLowerCase().includes(query.toLowerCase()) ||
      item.stoneId.toLowerCase().includes(query.toLowerCase())
    );
  }

  // Clients
  async getClients(): Promise<Client[]> {
    return Array.from(this.clients.values());
  }

  async getClient(id: string): Promise<Client | undefined> {
    return this.clients.get(id);
  }

  async createClient(client: InsertClient): Promise<Client> {
    const id = randomUUID();
    const now = new Date();
    const newClient: Client = {
      ...client,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.clients.set(id, newClient);
    return newClient;
  }

  async updateClient(id: string, client: Partial<InsertClient>): Promise<Client> {
    const existing = this.clients.get(id);
    if (!existing) {
      throw new Error("Client not found");
    }
    const updated: Client = {
      ...existing,
      ...client,
      updatedAt: new Date(),
    };
    this.clients.set(id, updated);
    return updated;
  }

  async deleteClient(id: string): Promise<void> {
    this.clients.delete(id);
  }

  async searchClients(query: string): Promise<Client[]> {
    const clients = Array.from(this.clients.values());
    return clients.filter(client =>
      client.name.toLowerCase().includes(query.toLowerCase()) ||
      client.city.toLowerCase().includes(query.toLowerCase()) ||
      client.clientType.toLowerCase().includes(query.toLowerCase())
    );
  }

  // Suppliers
  async getSuppliers(): Promise<Supplier[]> {
    return Array.from(this.suppliers.values());
  }

  async getSupplier(id: string): Promise<Supplier | undefined> {
    return this.suppliers.get(id);
  }

  async createSupplier(supplier: InsertSupplier): Promise<Supplier> {
    const id = randomUUID();
    const now = new Date();
    const newSupplier: Supplier = {
      ...supplier,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.suppliers.set(id, newSupplier);
    return newSupplier;
  }

  async updateSupplier(id: string, supplier: Partial<InsertSupplier>): Promise<Supplier> {
    const existing = this.suppliers.get(id);
    if (!existing) {
      throw new Error("Supplier not found");
    }
    const updated: Supplier = {
      ...existing,
      ...supplier,
      updatedAt: new Date(),
    };
    this.suppliers.set(id, updated);
    return updated;
  }

  async deleteSupplier(id: string): Promise<void> {
    this.suppliers.delete(id);
  }

  async searchSuppliers(query: string): Promise<Supplier[]> {
    const suppliers = Array.from(this.suppliers.values());
    return suppliers.filter(supplier =>
      supplier.name.toLowerCase().includes(query.toLowerCase()) ||
      supplier.location.toLowerCase().includes(query.toLowerCase())
    );
  }

  // Sales
  async getSales(): Promise<Sale[]> {
    return Array.from(this.sales.values());
  }

  async getSale(id: string): Promise<Sale | undefined> {
    return this.sales.get(id);
  }

  async createSale(sale: InsertSale): Promise<Sale> {
    const id = randomUUID();
    const now = new Date();
    const newSale: Sale = {
      ...sale,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.sales.set(id, newSale);
    return newSale;
  }

  async updateSale(id: string, sale: Partial<InsertSale>): Promise<Sale> {
    const existing = this.sales.get(id);
    if (!existing) {
      throw new Error("Sale not found");
    }
    const updated: Sale = {
      ...existing,
      ...sale,
      updatedAt: new Date(),
    };
    this.sales.set(id, updated);
    return updated;
  }

  async deleteSale(id: string): Promise<void> {
    this.sales.delete(id);
  }

  async getSalesByClient(clientId: string): Promise<Sale[]> {
    return Array.from(this.sales.values()).filter(sale => sale.clientId === clientId);
  }

  async getSalesByDateRange(startDate: Date, endDate: Date): Promise<Sale[]> {
    return Array.from(this.sales.values()).filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate >= startDate && saleDate <= endDate;
    });
  }

  // Certifications
  async getCertifications(): Promise<Certification[]> {
    return Array.from(this.certifications.values());
  }

  async getCertification(id: string): Promise<Certification | undefined> {
    return this.certifications.get(id);
  }

  async createCertification(cert: InsertCertification): Promise<Certification> {
    const id = randomUUID();
    const now = new Date();
    const newCert: Certification = {
      ...cert,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.certifications.set(id, newCert);
    return newCert;
  }

  async updateCertification(id: string, cert: Partial<InsertCertification>): Promise<Certification> {
    const existing = this.certifications.get(id);
    if (!existing) {
      throw new Error("Certification not found");
    }
    const updated: Certification = {
      ...existing,
      ...cert,
      updatedAt: new Date(),
    };
    this.certifications.set(id, updated);
    return updated;
  }

  async deleteCertification(id: string): Promise<void> {
    this.certifications.delete(id);
  }

  async getPendingCertifications(): Promise<Certification[]> {
    return Array.from(this.certifications.values()).filter(cert => cert.status === "Pending");
  }

  // Consultations
  async getConsultations(): Promise<Consultation[]> {
    return Array.from(this.consultations.values());
  }

  async getConsultation(id: string): Promise<Consultation | undefined> {
    return this.consultations.get(id);
  }

  async createConsultation(consultation: InsertConsultation): Promise<Consultation> {
    const id = randomUUID();
    const now = new Date();
    const newConsultation: Consultation = {
      ...consultation,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.consultations.set(id, newConsultation);
    return newConsultation;
  }

  async updateConsultation(id: string, consultation: Partial<InsertConsultation>): Promise<Consultation> {
    const existing = this.consultations.get(id);
    if (!existing) {
      throw new Error("Consultation not found");
    }
    const updated: Consultation = {
      ...existing,
      ...consultation,
      updatedAt: new Date(),
    };
    this.consultations.set(id, updated);
    return updated;
  }

  async deleteConsultation(id: string): Promise<void> {
    this.consultations.delete(id);
  }

  async getConsultationsByClient(clientId: string): Promise<Consultation[]> {
    return Array.from(this.consultations.values()).filter(consultation => consultation.clientId === clientId);
  }

  // Tasks
  async getTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values());
  }

  async getTask(id: string): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async createTask(task: InsertTask): Promise<Task> {
    const id = randomUUID();
    const now = new Date();
    const newTask: Task = {
      ...task,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.tasks.set(id, newTask);
    return newTask;
  }

  async updateTask(id: string, task: Partial<InsertTask>): Promise<Task> {
    const existing = this.tasks.get(id);
    if (!existing) {
      throw new Error("Task not found");
    }
    const updated: Task = {
      ...existing,
      ...task,
      updatedAt: new Date(),
    };
    this.tasks.set(id, updated);
    return updated;
  }

  async deleteTask(id: string): Promise<void> {
    this.tasks.delete(id);
  }

  async getTasksByDueDate(date: Date): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return taskDate.toDateString() === date.toDateString();
    });
  }

  async getPendingTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(task => !task.completed);
  }
}

export const storage = new MemStorage();
