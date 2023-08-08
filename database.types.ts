export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      Quote: {
        Row: {
          currTime: string | null
          dateOfCompletion: string | null
          dealId: number
          installerId: number
          quoteCertification: number | null
          quoteLabour: number | null
          quoteMaterials: number | null
          quoteScaffolding: number | null
          totalQuote: number | null
        }
        Insert: {
          currTime?: string | null
          dateOfCompletion?: string | null
          dealId: number
          installerId?: number
          quoteCertification?: number | null
          quoteLabour?: number | null
          quoteMaterials?: number | null
          quoteScaffolding?: number | null
          totalQuote?: number | null
        }
        Update: {
          currTime?: string | null
          dateOfCompletion?: string | null
          dealId?: number
          installerId?: number
          quoteCertification?: number | null
          quoteLabour?: number | null
          quoteMaterials?: number | null
          quoteScaffolding?: number | null
          totalQuote?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
