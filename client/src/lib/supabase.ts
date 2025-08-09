import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://luaoeowqcvnbjcpascnk.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1YW9lb3dxY3ZuYmpjcGFzY25rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzOTgxMTEsImV4cCI6MjA2OTk3NDExMX0.Gf8dsa6oxudXZ8AB2mpz_FVTFx2y8wyD6TF7dyAWBG8'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types based on your schema
export interface Database {
  public: {
    Tables: {
      inventory: {
        Row: {
          id: string
          gemId: string
          type: string
          grade: string
          carat: number
          origin: string
          customOrigin: string | null
          pricePerCarat: number
          totalPrice: number
          isAvailable: boolean
          quantity: number
          imageUrl: string | null
          description: string | null
          aiAnalysis: string | null
          supplierId: string | null
          certified: boolean
          certificateLab: string | null
          certificateFile: string | null
          status: string
          packageType: string | null
          notes: string | null
          tags: string[]
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: string
          gemId: string
          type: string
          grade?: string
          carat: number
          origin: string
          customOrigin?: string | null
          pricePerCarat: number
          totalPrice: number
          isAvailable?: boolean
          quantity?: number
          imageUrl?: string | null
          description?: string | null
          aiAnalysis?: string | null
          supplierId?: string | null
          certified?: boolean
          certificateLab?: string | null
          certificateFile?: string | null
          status?: string
          packageType?: string | null
          notes?: string | null
          tags?: string[]
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          gemId?: string
          type?: string
          grade?: string
          carat?: number
          origin?: string
          customOrigin?: string | null
          pricePerCarat?: number
          totalPrice?: number
          isAvailable?: boolean
          quantity?: number
          imageUrl?: string | null
          description?: string | null
          aiAnalysis?: string | null
          supplierId?: string | null
          certified?: boolean
          certificateLab?: string | null
          certificateFile?: string | null
          status?: string
          packageType?: string | null
          notes?: string | null
          tags?: string[]
          createdAt?: string
          updatedAt?: string
        }
      }
      clients: {
        Row: {
          id: string
          name: string
          clientType: string
          city: string
          phone: string | null
          email: string | null
          address: string | null
          gstNumber: string | null
          businessName: string | null
          businessAddress: string | null
          loyaltyLevel: string
          notes: string | null
          tags: string[]
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: string
          name: string
          clientType: string
          city: string
          phone?: string | null
          email?: string | null
          address?: string | null
          gstNumber?: string | null
          businessName?: string | null
          businessAddress?: string | null
          loyaltyLevel?: string
          notes?: string | null
          tags?: string[]
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          name?: string
          clientType?: string
          city?: string
          phone?: string | null
          email?: string | null
          address?: string | null
          gstNumber?: string | null
          businessName?: string | null
          businessAddress?: string | null
          loyaltyLevel?: string
          notes?: string | null
          tags?: string[]
          createdAt?: string
          updatedAt?: string
        }
      }
      suppliers: {
        Row: {
          id: string
          name: string
          location: string
          phone: string | null
          email: string | null
          address: string | null
          type: string
          gemstoneTypes: string[]
          certificationOptions: string | null
          notes: string | null
          tags: string[]
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: string
          name: string
          location: string
          phone?: string | null
          email?: string | null
          address?: string | null
          type: string
          gemstoneTypes?: string[]
          certificationOptions?: string | null
          notes?: string | null
          tags?: string[]
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          name?: string
          location?: string
          phone?: string | null
          email?: string | null
          address?: string | null
          type?: string
          gemstoneTypes?: string[]
          certificationOptions?: string | null
          notes?: string | null
          tags?: string[]
          createdAt?: string
          updatedAt?: string
        }
      }
      sales: {
        Row: {
          id: string
          saleId: string
          date: string
          clientId: string | null
          stoneId: string | null
          quantity: number
          totalAmount: number
          profit: number
          invoiceFile: string | null
          paymentStatus: string
          notes: string | null
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: string
          saleId: string
          date: string
          clientId?: string | null
          stoneId?: string | null
          quantity?: number
          totalAmount: number
          profit: number
          invoiceFile?: string | null
          paymentStatus?: string
          notes?: string | null
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          saleId?: string
          date?: string
          clientId?: string | null
          stoneId?: string | null
          quantity?: number
          totalAmount?: number
          profit?: number
          invoiceFile?: string | null
          paymentStatus?: string
          notes?: string | null
          createdAt?: string
          updatedAt?: string
        }
      }
      certifications: {
        Row: {
          id: string
          stoneId: string | null
          lab: string
          dateSent: string | null
          dateReceived: string | null
          certificateFile: string | null
          status: string
          notes: string | null
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: string
          stoneId?: string | null
          lab: string
          dateSent?: string | null
          dateReceived?: string | null
          certificateFile?: string | null
          status?: string
          notes?: string | null
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          stoneId?: string | null
          lab?: string
          dateSent?: string | null
          dateReceived?: string | null
          certificateFile?: string | null
          status?: string
          notes?: string | null
          createdAt?: string
          updatedAt?: string
        }
      }
      consultations: {
        Row: {
          id: string
          clientId: string | null
          date: string
          medium: string
          outcome: string
          notes: string | null
          followUpDate: string | null
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: string
          clientId?: string | null
          date: string
          medium: string
          outcome: string
          notes?: string | null
          followUpDate?: string | null
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          clientId?: string | null
          date?: string
          medium?: string
          outcome?: string
          notes?: string | null
          followUpDate?: string | null
          createdAt?: string
          updatedAt?: string
        }
      }
      tasks: {
        Row: {
          id: string
          title: string
          description: string | null
          status: string
          priority: string
          dueDate: string | null
          assignedTo: string | null
          relatedTo: string | null
          relatedToType: string | null
          notes: string | null
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          status?: string
          priority?: string
          dueDate?: string | null
          assignedTo?: string | null
          relatedTo?: string | null
          relatedToType?: string | null
          notes?: string | null
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          status?: string
          priority?: string
          dueDate?: string | null
          assignedTo?: string | null
          relatedTo?: string | null
          relatedToType?: string | null
          notes?: string | null
          createdAt?: string
          updatedAt?: string
        }
      }
      users: {
        Row: {
          id: string
          username: string
          password: string
          role: string
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: string
          username: string
          password: string
          role?: string
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          username?: string
          password?: string
          role?: string
          createdAt?: string
          updatedAt?: string
        }
      }
    }
  }
} 