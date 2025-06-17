import { createClient } from '@supabase/supabase-js'

// Configurações do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nletapjvgiaodajzkmcl.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sZXRhcGp2Z2lhb2RhanprbWNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1NjUwNjcsImV4cCI6MjA2NTE0MTA2N30.fKW5zo_lnW5jf4wLidhTugxZVb8u_Y_KHOeV1Kk642o'

// Debug das variáveis de ambiente
console.log('🔧 Environment Variables Debug:')
console.log('URL from env:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('Key from env:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'true' : 'false')

// Verificar se as credenciais estão configuradas
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Credenciais do Supabase não configuradas!')
  console.error('Verifique se o arquivo .env.local está configurado corretamente')
}

// Criar cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

// Log para debug
console.log('🔗 Supabase Client: Real Database')
console.log('📍 URL:', supabaseUrl)
console.log('🔑 Has Key:', !!supabaseAnonKey)

// Tipos das tabelas do banco
export type Database = {
  public: {
    Tables: {
      products: {
        Row: {
          id: number
          name: string
          code: string
          description: string
          category: string
          quantity: number
          unit: string
          purchase_price: number
          sell_price: number
          min_stock: number
          location: string
          supplier: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['products']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['products']['Insert']>
      }
      finished_products: {
        Row: {
          id: number
          name: string
          code: string
          description: string
          category: string
          estimated_time: number
          sell_price: number
          status: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['finished_products']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['finished_products']['Insert']>
      }
      bom_items: {
        Row: {
          id: number
          finished_product_id: number
          component_id: number
          quantity: number
          process: string
          position: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['bom_items']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['bom_items']['Insert']>
      }
      production_orders: {
        Row: {
          id: number
          finished_product_id: number
          quantity: number
          status: string
          priority: string
          planned_start_date: string
          planned_end_date: string
          actual_start_date: string | null
          actual_end_date: string | null
          estimated_duration: number
          notes: string | null
          assigned_operator: string | null
          station: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['production_orders']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['production_orders']['Insert']>
      }
    }
  }
} 