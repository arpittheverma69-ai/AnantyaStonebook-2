import { createClient } from '@supabase/supabase-js';
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
import { IStorage } from "./storage";

// Initialize Supabase client
const supabaseUrl = 'https://luaoeowqcvnbjcpascnk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1YW9lb3dxY3ZuYmpjcGFzY25rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzOTgxMTEsImV4cCI6MjA2OTk3NDExMX0.Gf8dsa6oxudXZ8AB2mpz_FVTFx2y8wyD6TF7dyAWBG8';

const supabase = createClient(supabaseUrl, supabaseKey);

// Utility functions to convert between camelCase and snake_case
const toSnakeCase = (obj: any): any => {
  const result: any = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      result[snakeKey] = obj[key];
    }
  }
  return result;
};

const fromSnakeCase = (obj: any): any => {
  const result: any = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      result[camelKey] = obj[key];
    }
  }
  return result;
};

export class SupabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) return undefined;
    return fromSnakeCase(data) as User;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();
    
    if (error || !data) return undefined;
    return fromSnakeCase(data) as User;
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = randomUUID();
    const now = new Date();
    const newUser = { ...user, id, createdAt: now, updatedAt: now };
    
    const { data, error } = await supabase
      .from('users')
      .insert(toSnakeCase(newUser))
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create user: ${error.message}`);
    return fromSnakeCase(data) as User;
  }

  // Inventory
  async getInventory(): Promise<Inventory[]> {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(`Failed to fetch inventory: ${error.message}`);
    return (data || []).map(fromSnakeCase) as Inventory[];
  }

  async getInventoryItem(id: string): Promise<Inventory | undefined> {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) return undefined;
    return fromSnakeCase(data) as Inventory;
  }

  async createInventoryItem(item: InsertInventory): Promise<Inventory> {
    const id = randomUUID();
    const now = new Date();
    const newItem = { ...item, id, createdAt: now, updatedAt: now };
    
    const { data, error } = await supabase
      .from('inventory')
      .insert(toSnakeCase(newItem))
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create inventory item: ${error.message}`);
    return fromSnakeCase(data) as Inventory;
  }

  async updateInventoryItem(id: string, item: Partial<InsertInventory>): Promise<Inventory> {
    const { data, error } = await supabase
      .from('inventory')
      .update({ ...toSnakeCase(item), updated_at: new Date() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw new Error(`Failed to update inventory item: ${error.message}`);
    return fromSnakeCase(data) as Inventory;
  }

  async deleteInventoryItem(id: string): Promise<void> {
    const { error } = await supabase
      .from('inventory')
      .delete()
      .eq('id', id);
    
    if (error) throw new Error(`Failed to delete inventory item: ${error.message}`);
  }

  async searchInventory(query: string): Promise<Inventory[]> {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .or(`type.ilike.%${query}%,origin.ilike.%${query}%,gem_id.ilike.%${query}%`)
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(`Failed to search inventory: ${error.message}`);
    return (data || []).map(fromSnakeCase) as Inventory[];
  }

  // Clients
  async getClients(): Promise<Client[]> {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(`Failed to fetch clients: ${error.message}`);
    return (data || []).map(fromSnakeCase) as Client[];
  }

  async getClient(id: string): Promise<Client | undefined> {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) return undefined;
    return fromSnakeCase(data) as Client;
  }

  async createClient(client: InsertClient): Promise<Client> {
    const id = randomUUID();
    const now = new Date();
    const newClient = { ...client, id, createdAt: now, updatedAt: now };
    
    const { data, error } = await supabase
      .from('clients')
      .insert(toSnakeCase(newClient))
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create client: ${error.message}`);
    return fromSnakeCase(data) as Client;
  }

  async updateClient(id: string, client: Partial<InsertClient>): Promise<Client> {
    const { data, error } = await supabase
      .from('clients')
      .update({ ...toSnakeCase(client), updated_at: new Date() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw new Error(`Failed to update client: ${error.message}`);
    return fromSnakeCase(data) as Client;
  }

  async deleteClient(id: string): Promise<void> {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);
    
    if (error) throw new Error(`Failed to delete client: ${error.message}`);
  }

  async searchClients(query: string): Promise<Client[]> {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .or(`name.ilike.%${query}%,city.ilike.%${query}%,phone.ilike.%${query}%,email.ilike.%${query}%`)
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(`Failed to search clients: ${error.message}`);
    return (data || []).map(fromSnakeCase) as Client[];
  }

  // Suppliers
  async getSuppliers(): Promise<Supplier[]> {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(`Failed to fetch suppliers: ${error.message}`);
    return (data || []).map(fromSnakeCase) as Supplier[];
  }

  async getSupplier(id: string): Promise<Supplier | undefined> {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) return undefined;
    return fromSnakeCase(data) as Supplier;
  }

  async createSupplier(supplier: InsertSupplier): Promise<Supplier> {
    const id = randomUUID();
    const now = new Date();
    const newSupplier = { ...supplier, id, createdAt: now, updatedAt: now };
    
    const { data, error } = await supabase
      .from('suppliers')
      .insert(toSnakeCase(newSupplier))
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create supplier: ${error.message}`);
    return fromSnakeCase(data) as Supplier;
  }

  async updateSupplier(id: string, supplier: Partial<InsertSupplier>): Promise<Supplier> {
    const { data, error } = await supabase
      .from('suppliers')
      .update({ ...toSnakeCase(supplier), updated_at: new Date() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw new Error(`Failed to update supplier: ${error.message}`);
    return fromSnakeCase(data) as Supplier;
  }

  async deleteSupplier(id: string): Promise<void> {
    const { error } = await supabase
      .from('suppliers')
      .delete()
      .eq('id', id);
    
    if (error) throw new Error(`Failed to delete supplier: ${error.message}`);
  }

  async searchSuppliers(query: string): Promise<Supplier[]> {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .or(`name.ilike.%${query}%,location.ilike.%${query}%,phone.ilike.%${query}%,email.ilike.%${query}%`)
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(`Failed to search suppliers: ${error.message}`);
    return (data || []).map(fromSnakeCase) as Supplier[];
  }

  // Sales
  async getSales(): Promise<Sale[]> {
    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(`Failed to fetch sales: ${error.message}`);
    return (data || []).map(fromSnakeCase) as Sale[];
  }

  async getSale(id: string): Promise<Sale | undefined> {
    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) return undefined;
    return fromSnakeCase(data) as Sale;
  }

  async createSale(sale: InsertSale): Promise<Sale> {
    const id = randomUUID();
    const now = new Date();
    const newSale = { ...sale, id, createdAt: now, updatedAt: now };
    
    const { data, error } = await supabase
      .from('sales')
      .insert(toSnakeCase(newSale))
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create sale: ${error.message}`);
    return fromSnakeCase(data) as Sale;
  }

  async updateSale(id: string, sale: Partial<InsertSale>): Promise<Sale> {
    const { data, error } = await supabase
      .from('sales')
      .update({ ...toSnakeCase(sale), updated_at: new Date() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw new Error(`Failed to update sale: ${error.message}`);
    return fromSnakeCase(data) as Sale;
  }

  async deleteSale(id: string): Promise<void> {
    const { error } = await supabase
      .from('sales')
      .delete()
      .eq('id', id);
    
    if (error) throw new Error(`Failed to delete sale: ${error.message}`);
  }

  async getSalesByClient(clientId: string): Promise<Sale[]> {
    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(`Failed to fetch sales by client: ${error.message}`);
    return (data || []).map(fromSnakeCase) as Sale[];
  }

  async getSalesByDateRange(startDate: Date, endDate: Date): Promise<Sale[]> {
    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(`Failed to fetch sales by date range: ${error.message}`);
    return (data || []).map(fromSnakeCase) as Sale[];
  }

  // Certifications
  async getCertifications(): Promise<Certification[]> {
    const { data, error } = await supabase
      .from('certifications')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(`Failed to fetch certifications: ${error.message}`);
    return (data || []).map(fromSnakeCase) as Certification[];
  }

  async getCertification(id: string): Promise<Certification | undefined> {
    const { data, error } = await supabase
      .from('certifications')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) return undefined;
    return fromSnakeCase(data) as Certification;
  }

  async createCertification(cert: InsertCertification): Promise<Certification> {
    const id = randomUUID();
    const now = new Date();
    const newCert = { ...cert, id, createdAt: now, updatedAt: now };
    
    const { data, error } = await supabase
      .from('certifications')
      .insert(toSnakeCase(newCert))
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create certification: ${error.message}`);
    return fromSnakeCase(data) as Certification;
  }

  async updateCertification(id: string, cert: Partial<InsertCertification>): Promise<Certification> {
    const { data, error } = await supabase
      .from('certifications')
      .update({ ...toSnakeCase(cert), updated_at: new Date() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw new Error(`Failed to update certification: ${error.message}`);
    return fromSnakeCase(data) as Certification;
  }

  async deleteCertification(id: string): Promise<void> {
    const { error } = await supabase
      .from('certifications')
      .delete()
      .eq('id', id);
    
    if (error) throw new Error(`Failed to delete certification: ${error.message}`);
  }

  async getPendingCertifications(): Promise<Certification[]> {
    const { data, error } = await supabase
      .from('certifications')
      .select('*')
      .eq('status', 'Pending')
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(`Failed to fetch pending certifications: ${error.message}`);
    return (data || []).map(fromSnakeCase) as Certification[];
  }

  // Consultations
  async getConsultations(): Promise<Consultation[]> {
    const { data, error } = await supabase
      .from('consultations')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(`Failed to fetch consultations: ${error.message}`);
    return (data || []).map(fromSnakeCase) as Consultation[];
  }

  async getConsultation(id: string): Promise<Consultation | undefined> {
    const { data, error } = await supabase
      .from('consultations')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) return undefined;
    return fromSnakeCase(data) as Consultation;
  }

  async createConsultation(consultation: InsertConsultation): Promise<Consultation> {
    const id = randomUUID();
    const now = new Date();
    const newConsultation = { ...consultation, id, createdAt: now, updatedAt: now };
    
    const { data, error } = await supabase
      .from('consultations')
      .insert(toSnakeCase(newConsultation))
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create consultation: ${error.message}`);
    return fromSnakeCase(data) as Consultation;
  }

  async updateConsultation(id: string, consultation: Partial<InsertConsultation>): Promise<Consultation> {
    const { data, error } = await supabase
      .from('consultations')
      .update({ ...toSnakeCase(consultation), updated_at: new Date() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw new Error(`Failed to update consultation: ${error.message}`);
    return fromSnakeCase(data) as Consultation;
  }

  async deleteConsultation(id: string): Promise<void> {
    const { error } = await supabase
      .from('consultations')
      .delete()
      .eq('id', id);
    
    if (error) throw new Error(`Failed to delete consultation: ${error.message}`);
  }

  async getConsultationsByClient(clientId: string): Promise<Consultation[]> {
    const { data, error } = await supabase
      .from('consultations')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(`Failed to fetch consultations by client: ${error.message}`);
    return (data || []).map(fromSnakeCase) as Consultation[];
  }

  // Tasks
  async getTasks(): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(`Failed to fetch tasks: ${error.message}`);
    return (data || []).map(fromSnakeCase) as Task[];
  }

  async getTask(id: string): Promise<Task | undefined> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) return undefined;
    return fromSnakeCase(data) as Task;
  }

  async createTask(task: InsertTask): Promise<Task> {
    const id = randomUUID();
    const now = new Date();
    const newTask = { ...task, id, createdAt: now, updatedAt: now };
    
    const { data, error } = await supabase
      .from('tasks')
      .insert(toSnakeCase(newTask))
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create task: ${error.message}`);
    return fromSnakeCase(data) as Task;
  }

  async updateTask(id: string, task: Partial<InsertTask>): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .update({ ...toSnakeCase(task), updated_at: new Date() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw new Error(`Failed to update task: ${error.message}`);
    return fromSnakeCase(data) as Task;
  }

  async deleteTask(id: string): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);
    
    if (error) throw new Error(`Failed to delete task: ${error.message}`);
  }

  async getTasksByDueDate(date: Date): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .gte('due_date', date.toISOString().split('T')[0])
      .lt('due_date', new Date(date.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('due_date', { ascending: true });
    
    if (error) throw new Error(`Failed to fetch tasks by due date: ${error.message}`);
    return (data || []).map(fromSnakeCase) as Task[];
  }

  async getPendingTasks(): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .neq('status', 'Completed')
      .order('due_date', { ascending: true });
    
    if (error) throw new Error(`Failed to fetch pending tasks: ${error.message}`);
    return (data || []).map(fromSnakeCase) as Task[];
  }
}
