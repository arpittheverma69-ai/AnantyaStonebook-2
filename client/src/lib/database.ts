import { supabase } from './supabase'
import type { Database } from './supabase'

// Type aliases for easier use
type Inventory = Database['public']['Tables']['inventory']['Row']
type InsertInventory = Database['public']['Tables']['inventory']['Insert']
type UpdateInventory = Database['public']['Tables']['inventory']['Update']

type Client = Database['public']['Tables']['clients']['Row']
type InsertClient = Database['public']['Tables']['clients']['Insert']
type UpdateClient = Database['public']['Tables']['clients']['Update']

type Supplier = Database['public']['Tables']['suppliers']['Row']
type InsertSupplier = Database['public']['Tables']['suppliers']['Insert']
type UpdateSupplier = Database['public']['Tables']['suppliers']['Update']

type Sale = Database['public']['Tables']['sales']['Row']
type InsertSale = Database['public']['Tables']['sales']['Insert']
type UpdateSale = Database['public']['Tables']['sales']['Update']

type Certification = Database['public']['Tables']['certifications']['Row']
type InsertCertification = Database['public']['Tables']['certifications']['Insert']
type UpdateCertification = Database['public']['Tables']['certifications']['Update']

type Consultation = Database['public']['Tables']['consultations']['Row']
type InsertConsultation = Database['public']['Tables']['consultations']['Insert']
type UpdateConsultation = Database['public']['Tables']['consultations']['Update']

type Task = Database['public']['Tables']['tasks']['Row']
type InsertTask = Database['public']['Tables']['tasks']['Insert']
type UpdateTask = Database['public']['Tables']['tasks']['Update']

type User = Database['public']['Tables']['users']['Row']
type InsertUser = Database['public']['Tables']['users']['Insert']
type UpdateUser = Database['public']['Tables']['users']['Update']

// Utility: Map camelCase inventory object to snake_case for Supabase
function toSnakeCaseInventory(input: any) {
  return {
    gem_id: input.gemId,
    type: input.type,
    grade: input.grade,
    carat: input.carat,
    origin: input.origin,
    custom_origin: input.customOrigin,
    price_per_carat: input.pricePerCarat,
    total_price: input.totalPrice,
    is_available: input.isAvailable,
    quantity: input.quantity,
    image_url: input.imageUrl,
    description: input.description,
    ai_analysis: input.aiAnalysis,
    supplier_id: input.supplierId,
    certified: input.certified,
    certificate_lab: input.certificateLab,
    certificate_file: input.certificateFile,
    status: input.status,
    package_type: input.packageType,
    notes: input.notes,
    tags: input.tags,
    treatments: input.treatments ?? input.extended?.treatments ?? null,
    disclose_treatments: input.discloseTreatments ?? input.extended?.discloseTreatments ?? false,
    media: input.media ?? input.extended?.media ?? null,
    reorder_rules: input.reorderRules ?? input.extended?.reorderRules ?? null,
    created_at: input.createdAt,
    updated_at: input.updatedAt,
  }
}

// Utility: Map camelCase sale object to snake_case for Supabase
function toSnakeCaseSale(input: any) {
  const payload: any = {
    sale_id: input.saleId,
    date: input.date,
    client_id: input.clientId,
    stone_id: input.stoneId,
    quantity: input.quantity,
    total_amount: input.totalAmount,
    profit: input.profit,
    invoice_file: input.invoiceFile,
    payment_status: input.paymentStatus,
    notes: input.notes,
    created_at: input.createdAt,
    updated_at: input.updatedAt,
  };
  
  // Add optional fields if they exist
  if (input.waitingPeriod !== undefined) payload.waiting_period = input.waitingPeriod;
  if (input.isTrustworthy !== undefined) payload.is_trustworthy = input.isTrustworthy;
  if (input.anyDiscount !== undefined) payload.any_discount = input.anyDiscount;
  if (input.isOutOfState !== undefined) payload.is_out_of_state = input.isOutOfState;
  if (input.cgst !== undefined) payload.cgst = input.cgst;
  if (input.sgst !== undefined) payload.sgst = input.sgst;
  if (input.igst !== undefined) payload.igst = input.igst;
  if (input.totalWithTax !== undefined) payload.total_with_tax = input.totalWithTax;
  // Add invoice-specific fields
  if (input.buyersOrderNumber !== undefined) payload.buyers_order_number = input.buyersOrderNumber;
  if (input.buyersOrderDate !== undefined) payload.buyers_order_date = input.buyersOrderDate;
  if (input.dispatchDocNo !== undefined) payload.dispatch_doc_no = input.dispatchDocNo;
  if (input.deliveryNoteDate !== undefined) payload.delivery_note_date = input.deliveryNoteDate;
  if (input.dispatchedThrough !== undefined) payload.dispatched_through = input.dispatchedThrough;
  if (input.destination !== undefined) payload.destination = input.destination;
  if (input.termsOfDelivery !== undefined) payload.terms_of_delivery = input.termsOfDelivery;
  
  return payload;
}

function toSnakeCaseSaleItem(input: any, saleId: string) {
  return {
    sale_id: saleId,
    stone_id: input.stoneId, // This should be the UUID, not gem_id
    quantity: input.quantity ?? 1,
    carat: input.carat,
    price_per_carat: input.pricePerCarat,
    total_price: input.totalPrice,
  }
}

function toSnakeCaseSupplier(input: any) {
  return {
    name: input.name,
    location: input.location,
    phone: input.phone,
    email: input.email,
    address: input.address,
    type: input.type,
    gemstone_types: Array.isArray(input.gemstoneTypes) ? input.gemstoneTypes : [],
    certification_options: input.certificationOptions,
    notes: input.notes,
    tags: Array.isArray(input.tags) ? input.tags : [],
    arrival_date: input.arrivalDate && input.arrivalDate !== "" ? input.arrivalDate : null,
    departure_date: input.departureDate && input.departureDate !== "" ? input.departureDate : null,
    city: input.city,
    state: input.state,
    gst_number: input.gstNumber,
    landmark: input.landmark,
    total_amount: input.totalAmount,
    total_sold: input.totalSold,
    quality_rating: input.qualityRating,
    reliability_score: input.reliabilityScore,
    last_transaction_date: input.lastTransactionDate && input.lastTransactionDate !== "" ? input.lastTransactionDate : null,
  }
}

function toSnakeCaseTask(input: any) {
  const payload: any = {};
  if (input.title !== undefined) payload.title = input.title;
  if (input.status !== undefined) payload.status = input.status;
  if (input.description !== undefined) payload.description = input.description;
  if (input.notes !== undefined) payload.notes = input.notes;
  if (input.assignedTo !== undefined) payload.assigned_to = input.assignedTo;
  if (input.dueDate || input.due_date) payload.due_date = input.dueDate || input.due_date;
  if (input.priority !== undefined) payload.priority = input.priority;
  // Intentionally omitting related_to and related_type as they may not exist in DB
  return payload;
}

// Inventory Operations
export const inventoryService = {
  async getAll(): Promise<Inventory[]> {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    console.log('Inventory service - Raw data from Supabase:', data);
    return data || []
  },

  async getById(id: string): Promise<Inventory | null> {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async create(inventory: InsertInventory): Promise<Inventory> {
    const payload = toSnakeCaseInventory(inventory)
    console.log('Supabase inventory payload:', payload)
    const { data, error } = await supabase
      .from('inventory')
      .insert(payload)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async update(id: string, updates: UpdateInventory): Promise<Inventory> {
    const payload = toSnakeCaseInventory(updates)
    const { data, error } = await supabase
      .from('inventory')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('inventory')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  async search(query: string): Promise<Inventory[]> {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .or(`type.ilike.%${query}%,gem_id.ilike.%${query}%,origin.ilike.%${query}%`)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  }
}

// Utility: Map camelCase client object to snake_case for Supabase
function toSnakeCaseClient(input: any) {
  return {
    name: input.name,
    client_type: input.clientType,
    city: input.city,
    state: input.state,
    phone: input.phone,
    email: input.email,
    address: input.address,
    gst_number: input.gstNumber,
    business_name: input.businessName,
    business_address: input.businessAddress,
    loyalty_level: input.loyaltyLevel,
    is_trustworthy: input.isTrustworthy,
    is_recurring: input.isRecurring,
    notes: input.notes,
    tags: input.tags,
    what_they_want: input.whatTheyWant,
    created_at: input.createdAt,
    updated_at: input.updatedAt,
  };
}
// Client Operations
export const clientService = {
  async getAll(): Promise<Client[]> {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async getById(id: string): Promise<Client | null> {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async create(client: InsertClient): Promise<Client> {
    const payload = toSnakeCaseClient(client)
    console.log('Supabase client payload:', payload)
    const { data, error } = await supabase
      .from('clients')
      .insert(payload)
      .select()
      .single()
    if (error) {
      console.error('Supabase client create error:', error)
      throw error
    }
    return data
  },

  async update(id: string, updates: UpdateClient): Promise<Client> {
    const payload = toSnakeCaseClient(updates)
    console.log('Supabase client update payload:', payload)
    const { data, error } = await supabase
      .from('clients')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) {
      console.error('Supabase client update error:', error)
      throw error
    }
    return data
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  async search(query: string): Promise<Client[]> {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .or(`name.ilike.%${query}%,business_name.ilike.%${query}%,city.ilike.%${query}%`)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  }
}

// Supplier Operations
export const supplierService = {
  async getAll(): Promise<Supplier[]> {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async getById(id: string): Promise<Supplier | null> {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async create(supplier: InsertSupplier): Promise<Supplier> {
    const payload = toSnakeCaseSupplier(supplier)
    const { data, error } = await supabase
      .from('suppliers')
      .insert(payload)
      .select()
      .single()
    
    if (error) {
      console.error('Supabase supplier create error:', error)
      throw error
    }
    
    return data
  },

  async update(id: string, updates: UpdateSupplier): Promise<Supplier> {
    const payload = toSnakeCaseSupplier(updates)
    const { data, error } = await supabase
      .from('suppliers')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Supabase supplier update error:', error)
      throw error
    }
    
    return data
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('suppliers')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  async search(query: string): Promise<Supplier[]> {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .or(`name.ilike.%${query}%,location.ilike.%${query}%`)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  }
}

// Sale Operations
export const saleService = {
  async getAll(): Promise<Sale[]> {
    const { data, error } = await supabase
      .from('sales')
      .select(`
        *,
        clients(name, business_name, gst_number, address, phone),
        inventory(type, gem_id, carat, price_per_carat),
        sale_items(*, inventory:stone_id(gem_id, type, carat, price_per_carat))
      `)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async getById(id: string): Promise<Sale | null> {
    const { data, error } = await supabase
      .from('sales')
      .select(`
        *,
        clients(name, business_name, gst_number, address, phone),
        inventory(type, gem_id, carat, price_per_carat),
        sale_items(*, inventory:stone_id(gem_id, type, carat, price_per_carat))
      `)
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async create(sale: InsertSale): Promise<Sale> {
    const payload = toSnakeCaseSale(sale)
    console.log('Supabase sale payload:', payload)
    const { data, error } = await supabase
      .from('sales')
      .insert(payload)
      .select()
      .single()
    
    if (error) {
      console.log('Supabase sale create error:', error)
      throw error
    }
    return data
  },

  async replaceItems(saleId: string, items: any[]): Promise<void> {
    // Remove existing items
    const { error: delError } = await supabase
      .from('sale_items')
      .delete()
      .eq('sale_id', saleId)
    if (delError) throw delError

    if (!items || items.length === 0) return

    const payload = items.map((it) => toSnakeCaseSaleItem(it, saleId))
    const { error: insError } = await supabase
      .from('sale_items')
      .insert(payload)
    if (insError) throw insError
  },

  async update(id: string, updates: UpdateSale): Promise<Sale> {
    const payload = toSnakeCaseSale(updates)
    console.log('Supabase sale update payload:', payload)
    const { data, error } = await supabase
      .from('sales')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.log('Supabase sale update error:', error)
      throw error
    }
    return data
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('sales')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  async search(query: string): Promise<Sale[]> {
    const { data, error } = await supabase
      .from('sales')
      .select(`
        *,
        clients(name, business_name, gst_number, address, phone),
        inventory(type, gem_id, carat, price_per_carat),
        sale_items(*, inventory:stone_id(gem_id, type, carat, price_per_carat))
      `)
      .or(`sale_id.ilike.%${query}%`)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async getDashboardMetrics() {
    const { data: sales, error: salesError } = await supabase
      .from('sales')
      .select('total_amount, profit, created_at')
      .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
    
    if (salesError) throw salesError

    const { data: inventory, error: inventoryError } = await supabase
      .from('inventory')
      .select('total_price')
      .eq('is_available', true)
    
    if (inventoryError) throw inventoryError

    const monthlySales = sales?.reduce((sum, sale) => sum + sale.total_amount, 0) || 0
    const inventoryValue = inventory?.reduce((sum, item) => sum + item.total_price, 0) || 0

    return {
      monthlySales,
      inventoryValue,
      totalSales: sales?.length || 0,
      totalInventory: inventory?.length || 0
    }
  }
}

// Certification Operations
export const certificationService = {
  async getAll(): Promise<Certification[]> {
    const { data, error } = await supabase
      .from('certifications')
      .select('*, inventory(type, gem_id)')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async create(certification: InsertCertification): Promise<Certification> {
    const { data, error } = await supabase
      .from('certifications')
      .insert(certification)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async update(id: string, updates: UpdateCertification): Promise<Certification> {
    const { data, error } = await supabase
      .from('certifications')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// Consultation Operations
export const consultationService = {
  async getAll(): Promise<any[]> {
    const { data, error } = await supabase
      .from('consultations')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Consultation getAll error:', error)
      throw error
    }
    return (data || []).map(fromSnakeCaseConsultation)
  },

  async create(consultation: any): Promise<any> {
    const consultationData = toSnakeCaseConsultation(consultation)
    console.log('Database: Creating consultation with data:', consultationData);
    console.log('Database: Original consultation data:', consultation);
    
    const { data, error } = await supabase
      .from('consultations')
      .insert(consultationData)
      .select()
      .single()
    
    if (error) {
      console.error('Database: Consultation create error:', error);
      console.error('Database: Error details:', error.details);
      console.error('Database: Error hint:', error.hint);
      throw error
    }
    
    console.log('Database: Consultation created successfully:', data);
    return fromSnakeCaseConsultation(data)
  },

  async update(id: string, consultation: any): Promise<any> {
    const consultationData = toSnakeCaseConsultation(consultation)
    console.log('Database: Updating consultation with data:', consultationData);
    console.log('Database: Original consultation data:', consultation);
    console.log('Database: Consultation ID:', id);
    
    const { data, error } = await supabase
      .from('consultations')
      .update({ ...consultationData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Database: Consultation update error:', error);
      throw error
    }
    
    console.log('Database: Consultation updated successfully:', data);
    return fromSnakeCaseConsultation(data)
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('consultations')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Consultation delete error:', error)
      throw error
    }
  }
}

// Helper function to convert consultation data to snake_case
function toSnakeCaseConsultation(consultation: any) {
  return {
    client_name: consultation.clientName,
    client_phone: consultation.clientPhone,
    client_email: consultation.clientEmail,
    consultation_type: consultation.consultationType,
    consultation_date: consultation.consultationDate,
    consultation_time: consultation.consultationTime,
    duration: consultation.duration,
    gemstone_interest: consultation.gemstoneInterest,
    budget: consultation.budget,
    urgency: consultation.urgency,
    consultation_status: consultation.consultationStatus,
    consultation_notes: consultation.consultationNotes,
    follow_up_required: consultation.followUpRequired,
    follow_up_date: consultation.followUpDate,
    follow_up_notes: consultation.followUpNotes,
    recommendations: consultation.recommendations,
    next_steps: consultation.nextSteps,
    client_satisfaction: consultation.clientSatisfaction,
    special_requirements: consultation.specialRequirements,
    location: consultation.location,
    consultation_method: consultation.consultationMethod,
    payment_status: consultation.paymentStatus,
    consultation_fee: consultation.consultationFee,
    tags: consultation.tags,
  }
}

// Helper function to convert consultation data from snake_case
function fromSnakeCaseConsultation(consultation: any) {
  return {
    id: consultation.id,
    clientName: consultation.client_name,
    clientPhone: consultation.client_phone,
    clientEmail: consultation.client_email,
    consultationType: consultation.consultation_type,
    consultationDate: consultation.consultation_date,
    consultationTime: consultation.consultation_time,
    duration: consultation.duration,
    gemstoneInterest: consultation.gemstone_interest || [],
    budget: consultation.budget,
    urgency: consultation.urgency,
    consultationStatus: consultation.consultation_status,
    consultationNotes: consultation.consultation_notes,
    followUpRequired: consultation.follow_up_required,
    followUpDate: consultation.follow_up_date,
    followUpNotes: consultation.follow_up_notes,
    recommendations: consultation.recommendations,
    nextSteps: consultation.next_steps,
    clientSatisfaction: consultation.client_satisfaction,
    specialRequirements: consultation.special_requirements,
    location: consultation.location,
    consultationMethod: consultation.consultation_method,
    paymentStatus: consultation.payment_status,
    consultationFee: consultation.consultation_fee,
    tags: consultation.tags || [],
    createdAt: consultation.created_at,
    updatedAt: consultation.updated_at,
  }
}

// Task Operations
export const taskService = {
  async getAll(): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async create(task: any): Promise<Task> {
    const payload = toSnakeCaseTask(task)
    const { data, error } = await supabase
      .from('tasks')
      .insert(payload)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async update(id: string, updates: any): Promise<Task> {
    const payload = toSnakeCaseTask(updates)
    const { data, error } = await supabase
      .from('tasks')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// File Upload Operations
export const fileService = {
  async uploadFile(file: File, bucket: string = 'anantya-files'): Promise<string> {
    const fileName = `${Date.now()}-${file.name}`
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file)
    
    if (error) throw error
    
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName)
    
    return publicUrl
  },

  async deleteFile(fileName: string, bucket: string = 'anantya-files'): Promise<void> {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([fileName])
    
    if (error) throw error
  }
} 