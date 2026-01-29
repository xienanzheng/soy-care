export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      food_logs: {
        Row: {
          amount_grams: number | null
          calories: number | null
          carb_percent: number | null
          created_at: string
          fat_percent: number | null
          id: string
          logged_at: string
          meal_type: string | null
          name: string
          notes: string | null
          protein_percent: number | null
          pet_id: string
          photo_url: string | null
          user_id: string
        }
        Insert: {
          amount_grams?: number | null
          calories?: number | null
          carb_percent?: number | null
          created_at?: string
          fat_percent?: number | null
          id?: string
          logged_at?: string
          meal_type?: string | null
          name: string
          notes?: string | null
          protein_percent?: number | null
          pet_id: string
          photo_url?: string | null
          user_id: string
        }
        Update: {
          amount_grams?: number | null
          calories?: number | null
          carb_percent?: number | null
          created_at?: string
          fat_percent?: number | null
          id?: string
          logged_at?: string
          meal_type?: string | null
          name?: string
          notes?: string | null
          protein_percent?: number | null
          pet_id?: string
          photo_url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "food_logs_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      measurement_logs: {
        Row: {
          body_length_cm: number | null
          chest_cm: number | null
          created_at: string
          id: string
          logged_at: string
          neck_cm: number | null
          notes: string | null
          pet_id: string
          user_id: string
          weight_kg: number | null
        }
        Insert: {
          body_length_cm?: number | null
          chest_cm?: number | null
          created_at?: string
          id?: string
          logged_at?: string
          neck_cm?: number | null
          notes?: string | null
          pet_id: string
          user_id: string
          weight_kg?: number | null
        }
        Update: {
          body_length_cm?: number | null
          chest_cm?: number | null
          created_at?: string
          id?: string
          logged_at?: string
          neck_cm?: number | null
          notes?: string | null
          pet_id?: string
          user_id?: string
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "measurement_logs_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      pets: {
        Row: {
          allergies: string | null
          breed: string
          created_at: string
          date_of_birth: string | null
          favorite_activities: string | null
          gender: string
          handle: string
          id: string
          medical_history: string | null
          name: string
          owner_name: string | null
          personality: string | null
          photo_url: string | null
          species: string
          updated_at: string
          user_id: string
        }
        Insert: {
          allergies?: string | null
          breed: string
          created_at?: string
          date_of_birth?: string | null
          favorite_activities?: string | null
          gender?: string
          handle: string
          id?: string
          medical_history?: string | null
          name: string
          owner_name?: string | null
          personality?: string | null
          photo_url?: string | null
          species: string
          updated_at?: string
          user_id: string
        }
        Update: {
          allergies?: string | null
          breed?: string
          created_at?: string
          date_of_birth?: string | null
          favorite_activities?: string | null
          gender?: string
          handle?: string
          id?: string
          medical_history?: string | null
          name?: string
          owner_name?: string | null
          personality?: string | null
          photo_url?: string | null
          species?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      poop_logs: {
        Row: {
          ai_labels: Json | null
          ai_risk_level: string | null
          ai_status: string | null
          ai_summary: string | null
          amount: string
          blood_present: boolean | null
          color: string
          consistency: string
          created_at: string
          image_embedding: Json | null
          id: string
          location: string | null
          logged_at: string
          moisture_level: string | null
          mucus_present: boolean | null
          notes: string | null
          pet_id: string
          photo_url: string | null
          smell_level: number | null
          thumbnail_url: string | null
          undesirable_behavior_notes: string | null
          undesirable_behaviors: string[] | null
          user_id: string
          user_rating: number | null
        }
        Insert: {
          ai_labels?: Json | null
          ai_risk_level?: string | null
          ai_status?: string | null
          ai_summary?: string | null
          amount: string
          blood_present?: boolean | null
          color: string
          consistency: string
          created_at?: string
          image_embedding?: Json | null
          id?: string
          location?: string | null
          logged_at?: string
          moisture_level?: string | null
          mucus_present?: boolean | null
          notes?: string | null
          pet_id: string
          photo_url?: string | null
          smell_level?: number | null
          thumbnail_url?: string | null
          undesirable_behavior_notes?: string | null
          undesirable_behaviors?: string[] | null
          user_id: string
          user_rating?: number | null
        }
        Update: {
          ai_labels?: Json | null
          ai_risk_level?: string | null
          ai_status?: string | null
          ai_summary?: string | null
          amount?: string
          blood_present?: boolean | null
          color?: string
          consistency?: string
          created_at?: string
          image_embedding?: Json | null
          id?: string
          location?: string | null
          logged_at?: string
          moisture_level?: string | null
          mucus_present?: boolean | null
          notes?: string | null
          pet_id?: string
          photo_url?: string | null
          smell_level?: number | null
          thumbnail_url?: string | null
          undesirable_behavior_notes?: string | null
          undesirable_behaviors?: string[] | null
          user_id?: string
          user_rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "poop_logs_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_presets: {
        Row: {
          created_at: string
          default_amount_grams: number | null
          default_calories: number | null
          default_carb_percent: number | null
          default_fat_percent: number | null
          default_food_name: string
          default_meal_type: string | null
          default_protein_percent: number | null
          id: string
          name: string
          notes: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          default_amount_grams?: number | null
          default_calories?: number | null
          default_carb_percent?: number | null
          default_fat_percent?: number | null
          default_food_name: string
          default_meal_type?: string | null
          default_protein_percent?: number | null
          id?: string
          name: string
          notes?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          default_amount_grams?: number | null
          default_calories?: number | null
          default_carb_percent?: number | null
          default_fat_percent?: number | null
          default_food_name?: string
          default_meal_type?: string | null
          default_protein_percent?: number | null
          id?: string
          name?: string
          notes?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      supplement_logs: {
        Row: {
          created_at: string
          dosage: string | null
          frequency: string | null
          id: string
          logged_at: string
          name: string
          notes: string | null
          purpose: string | null
          pet_id: string
          photo_url: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          dosage?: string | null
          frequency?: string | null
          id?: string
          logged_at?: string
          name: string
          notes?: string | null
          purpose?: string | null
          pet_id: string
          photo_url?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          dosage?: string | null
          frequency?: string | null
          id?: string
          logged_at?: string
          name?: string
          notes?: string | null
          purpose?: string | null
          pet_id?: string
          photo_url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplement_logs_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      health_notes: {
        Row: {
          created_at: string
          id: string
          owner_message: string | null
          pet_id: string
          raw_response: Json | null
          recommendations: string | null
          risk_level: string | null
          summary: string
        }
        Insert: {
          created_at?: string
          id?: string
          owner_message?: string | null
          pet_id: string
          raw_response?: Json | null
          recommendations?: string | null
          risk_level?: string | null
          summary: string
        }
        Update: {
          created_at?: string
          id?: string
          owner_message?: string | null
          pet_id?: string
          raw_response?: Json | null
          recommendations?: string | null
          risk_level?: string | null
          summary?: string
        }
        Relationships: [
          {
            foreignKeyName: "health_notes_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      pet_challenges: {
        Row: {
          created_at: string
          goal: number
          id: string
          pet_id: string
          progress: number
          streak_days: number | null
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          goal: number
          id?: string
          pet_id: string
          progress?: number
          streak_days?: number | null
          subtitle?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          goal?: number
          id?: string
          pet_id?: string
          progress?: number
          streak_days?: number | null
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pet_challenges_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
          referencedColumns: ["id"]
        },
      ]
    }
      pet_health_certificates: {
        Row: {
          clinic: string | null
          created_at: string
          document_url: string | null
          expires_at: string | null
          id: string
          issued_at: string
          notes: string | null
          pet_id: string
          title: string
          user_id: string
          vet_name: string | null
        }
        Insert: {
          clinic?: string | null
          created_at?: string
          document_url?: string | null
          expires_at?: string | null
          id?: string
          issued_at: string
          notes?: string | null
          pet_id: string
          title: string
          user_id: string
          vet_name?: string | null
        }
        Update: {
          clinic?: string | null
          created_at?: string
          document_url?: string | null
          expires_at?: string | null
          id?: string
          issued_at?: string
          notes?: string | null
          pet_id?: string
          title?: string
          user_id?: string
          vet_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pet_health_certificates_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      pet_vaccinations: {
        Row: {
          clinic: string | null
          created_at: string
          date_administered: string
          document_url: string | null
          id: string
          lot_number: string | null
          next_due: string | null
          notes: string | null
          pet_id: string
          user_id: string
          vaccine_name: string
          vet_name: string | null
        }
        Insert: {
          clinic?: string | null
          created_at?: string
          date_administered: string
          document_url?: string | null
          id?: string
          lot_number?: string | null
          next_due?: string | null
          notes?: string | null
          pet_id: string
          user_id: string
          vaccine_name: string
          vet_name?: string | null
        }
        Update: {
          clinic?: string | null
          created_at?: string
          date_administered?: string
          document_url?: string | null
          id?: string
          lot_number?: string | null
          next_due?: string | null
          notes?: string | null
          pet_id?: string
          user_id?: string
          vaccine_name?: string
          vet_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pet_vaccinations_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          content: string
          created_at: string
          id: string
          likes: number | null
          owner_name: string
          pet_id: string
          photo_url: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          likes?: number | null
          owner_name: string
          pet_id: string
          photo_url?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          likes?: number | null
          owner_name?: string
          pet_id?: string
          photo_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "community_posts_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      poop_insights: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          pet_id: string
          risk_level: string | null
          similarity_vector: Json | null
          summary: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          pet_id: string
          risk_level?: string | null
          similarity_vector?: Json | null
          summary?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          pet_id?: string
          risk_level?: string | null
          similarity_vector?: Json | null
          summary?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "poop_insights_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      user_metrics: {
        Row: {
          user_id: string
          consecutive_days: number | null
          last_checkin: string | null
          credits: number | null
          total_entries: number | null
          last_entry_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          consecutive_days?: number | null
          last_checkin?: string | null
          credits?: number | null
          total_entries?: number | null
          last_entry_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          consecutive_days?: number | null
          last_checkin?: string | null
          credits?: number | null
          total_entries?: number | null
          last_entry_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      credit_transactions: {
        Row: {
          id: string
          user_id: string
          delta: number
          reason: string | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          delta: number
          reason?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          delta?: number
          reason?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Relationships: []
      }
      user_vet_contacts: {
        Row: {
          id: string
          user_id: string
          vet_name: string | null
          clinic: string | null
          phone: string | null
          email: string | null
          address: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          vet_name?: string | null
          clinic?: string | null
          phone?: string | null
          email?: string | null
          address?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          vet_name?: string | null
          clinic?: string | null
          phone?: string | null
          email?: string | null
          address?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      vets: {
        Row: {
          id: string
          name: string
          specialty: string | null
          bio: string | null
          avatar_url: string | null
          clinic: string | null
          city: string | null
          contact_email: string | null
          is_online: boolean | null
          rating: number | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          specialty?: string | null
          bio?: string | null
          avatar_url?: string | null
          clinic?: string | null
          city?: string | null
          contact_email?: string | null
          is_online?: boolean | null
          rating?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          specialty?: string | null
          bio?: string | null
          avatar_url?: string | null
          clinic?: string | null
          city?: string | null
          contact_email?: string | null
          is_online?: boolean | null
          rating?: number | null
          created_at?: string
        }
        Relationships: []
      }
      vet_chat_threads: {
        Row: {
          id: string
          user_id: string
          pet_id: string | null
          vet_id: string | null
          status: string
          topic: string | null
          credit_cost: number | null
          created_at: string
          updated_at: string
          closed_at: string | null
          last_message_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          pet_id?: string | null
          vet_id?: string | null
          status?: string
          topic?: string | null
          credit_cost?: number | null
          created_at?: string
          updated_at?: string
          closed_at?: string | null
          last_message_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          pet_id?: string | null
          vet_id?: string | null
          status?: string
          topic?: string | null
          credit_cost?: number | null
          created_at?: string
          updated_at?: string
          closed_at?: string | null
          last_message_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vet_chat_threads_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vet_chat_threads_vet_id_fkey"
            columns: ["vet_id"]
            isOneToOne: false
            referencedRelation: "vets"
            referencedColumns: ["id"]
          },
        ]
      }
      vet_chat_messages: {
        Row: {
          id: string
          thread_id: string
          sender_type: string
          sender_id: string | null
          message: string
          attachments: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          thread_id: string
          sender_type: string
          sender_id?: string | null
          message: string
          attachments?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          thread_id?: string
          sender_type?: string
          sender_id?: string | null
          message?: string
          attachments?: Json | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vet_chat_messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "vet_chat_threads"
            referencedColumns: ["id"]
          },
        ]
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
