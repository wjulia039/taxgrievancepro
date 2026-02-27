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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      accounts: {
        Row: {
          created_at: string | null
          created_by: string | null
          email: string | null
          id: string
          name: string
          picture_url: string | null
          public_data: Json
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          id?: string
          name: string
          picture_url?: string | null
          public_data?: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          id?: string
          name?: string
          picture_url?: string | null
          public_data?: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      audit_events: {
        Row: {
          created_at: string
          entity_id: string | null
          entity_type: string
          event_type: string
          id: string
          ip: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          entity_id?: string | null
          entity_type: string
          event_type: string
          id?: string
          ip?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          event_type?: string
          id?: string
          ip?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      leads: {
        Row: {
          created_at: string
          email: string
          id: string
          opt_in_confirmed_at: string | null
          recontact_month: number | null
          tag: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          opt_in_confirmed_at?: string | null
          recontact_month?: number | null
          tag: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          opt_in_confirmed_at?: string | null
          recontact_month?: number | null
          tag?: string
          user_id?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          created_at: string
          disclaimer_version: string
          id: string
          idempotency_key: string | null
          legal_accepted_at: string | null
          payment_intent_id: string | null
          precheck_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          disclaimer_version?: string
          id?: string
          idempotency_key?: string | null
          legal_accepted_at?: string | null
          payment_intent_id?: string | null
          precheck_id: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          disclaimer_version?: string
          id?: string
          idempotency_key?: string | null
          legal_accepted_at?: string | null
          payment_intent_id?: string | null
          precheck_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_precheck_id_fkey"
            columns: ["precheck_id"]
            isOneToOne: false
            referencedRelation: "prechecks"
            referencedColumns: ["id"]
          },
        ]
      }
      prechecks: {
        Row: {
          confidence: number | null
          confirmed_by_user: boolean
          created_at: string
          decision: string
          factors: string[] | null
          id: string
          metadata: Json | null
          metrics: Json | null
          property_id: string
          rule_pack_id: string | null
          snapshot_config: Json | null
          user_id: string
        }
        Insert: {
          confidence?: number | null
          confirmed_by_user?: boolean
          created_at?: string
          decision: string
          factors?: string[] | null
          id?: string
          metadata?: Json | null
          metrics?: Json | null
          property_id: string
          rule_pack_id?: string | null
          snapshot_config?: Json | null
          user_id: string
        }
        Update: {
          confidence?: number | null
          confirmed_by_user?: boolean
          created_at?: string
          decision?: string
          factors?: string[] | null
          id?: string
          metadata?: Json | null
          metrics?: Json | null
          property_id?: string
          rule_pack_id?: string | null
          snapshot_config?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prechecks_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prechecks_rule_pack_id_fkey"
            columns: ["rule_pack_id"]
            isOneToOne: false
            referencedRelation: "rule_packs"
            referencedColumns: ["id"]
          },
        ]
      }
      properties: {
        Row: {
          address_quality_score: number | null
          country: string | null
          created_at: string
          formatted_address: string
          geocode_status: string
          id: string
          lat: number
          lng: number
          locality: string | null
          place_id: string
          postal_code: string | null
          route: string | null
          street_number: string | null
          unit_number: string | null
        }
        Insert: {
          address_quality_score?: number | null
          country?: string | null
          created_at?: string
          formatted_address: string
          geocode_status?: string
          id?: string
          lat: number
          lng: number
          locality?: string | null
          place_id: string
          postal_code?: string | null
          route?: string | null
          street_number?: string | null
          unit_number?: string | null
        }
        Update: {
          address_quality_score?: number | null
          country?: string | null
          created_at?: string
          formatted_address?: string
          geocode_status?: string
          id?: string
          lat?: number
          lng?: number
          locality?: string | null
          place_id?: string
          postal_code?: string | null
          route?: string | null
          street_number?: string | null
          unit_number?: string | null
        }
        Relationships: []
      }
      reports: {
        Row: {
          attempt_count: number
          content_snapshot: Json | null
          created_at: string
          engine_version: string
          generated_at: string | null
          id: string
          last_error: string | null
          order_id: string
          pdf_url: string | null
          template_version: string
          user_id: string
        }
        Insert: {
          attempt_count?: number
          content_snapshot?: Json | null
          created_at?: string
          engine_version?: string
          generated_at?: string | null
          id?: string
          last_error?: string | null
          order_id: string
          pdf_url?: string | null
          template_version?: string
          user_id: string
        }
        Update: {
          attempt_count?: number
          content_snapshot?: Json | null
          created_at?: string
          engine_version?: string
          generated_at?: string | null
          id?: string
          last_error?: string | null
          order_id?: string
          pdf_url?: string | null
          template_version?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      rule_packs: {
        Row: {
          created_at: string
          id: string
          name: string
          published: boolean
          rules_json: Json
          version: number
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          published?: boolean
          rules_json: Json
          version?: number
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          published?: boolean
          rules_json?: Json
          version?: number
        }
        Relationships: []
      }
      system_configs: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      lock_order_for_processing: {
        Args: { p_order_id: string }
        Returns: {
          created_at: string
          disclaimer_version: string
          id: string
          idempotency_key: string | null
          legal_accepted_at: string | null
          payment_intent_id: string | null
          precheck_id: string
          status: string
          updated_at: string
          user_id: string
        }[]
        SetofOptions: {
          from: "*"
          to: "orders"
          isOneToOne: false
          isSetofReturn: true
        }
      }
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
