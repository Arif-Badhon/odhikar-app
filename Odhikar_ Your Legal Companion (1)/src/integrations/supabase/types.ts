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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          appointment_label: string
          case_id: string
          clinic_id: string
          clinic_name: string
          created_at: string
          id: string
          scheduled_at: string | null
          slot_id: string
          status: string
          updated_at: string
        }
        Insert: {
          appointment_label: string
          case_id: string
          clinic_id: string
          clinic_name: string
          created_at?: string
          id?: string
          scheduled_at?: string | null
          slot_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          appointment_label?: string
          case_id?: string
          clinic_id?: string
          clinic_name?: string
          created_at?: string
          id?: string
          scheduled_at?: string | null
          slot_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: true
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      case_evidence: {
        Row: {
          case_id: string
          created_at: string
          id: string
          item: string
          location: string | null
          provenance: Json
          updated_at: string
        }
        Insert: {
          case_id: string
          created_at?: string
          id?: string
          item: string
          location?: string | null
          provenance?: Json
          updated_at?: string
        }
        Update: {
          case_id?: string
          created_at?: string
          id?: string
          item?: string
          location?: string | null
          provenance?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_evidence_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      case_follow_up_answers: {
        Row: {
          answer: string
          answered_at: string
          case_id: string
          field_key: string
          id: string
        }
        Insert: {
          answer: string
          answered_at?: string
          case_id: string
          field_key: string
          id?: string
        }
        Update: {
          answer?: string
          answered_at?: string
          case_id?: string
          field_key?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_follow_up_answers_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      case_parties: {
        Row: {
          case_id: string
          created_at: string
          detail: string | null
          id: string
          name: string | null
          party_role: string
          provenance: Json
          relationship: string | null
          updated_at: string
        }
        Insert: {
          case_id: string
          created_at?: string
          detail?: string | null
          id?: string
          name?: string | null
          party_role: string
          provenance?: Json
          relationship?: string | null
          updated_at?: string
        }
        Update: {
          case_id?: string
          created_at?: string
          detail?: string | null
          id?: string
          name?: string | null
          party_role?: string
          provenance?: Json
          relationship?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_parties_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      cases: {
        Row: {
          assigned_to: string | null
          audio_duration_seconds: number
          audio_path: string | null
          case_kind: string
          case_number: string
          confidence: number
          created_at: string
          id: string
          missing_fields: Json
          primary_category: string
          received_at: string
          safety_flag: boolean
          safety_note: string | null
          secondary_category: string | null
          status: Database["public"]["Enums"]["case_status"]
          structured_record: Json
          transcript_bn: string
          transcript_source: string | null
          updated_at: string
          urgency: Database["public"]["Enums"]["case_urgency"]
        }
        Insert: {
          assigned_to?: string | null
          audio_duration_seconds?: number
          audio_path?: string | null
          case_kind?: string
          case_number: string
          confidence?: number
          created_at?: string
          id?: string
          missing_fields?: Json
          primary_category: string
          received_at?: string
          safety_flag?: boolean
          safety_note?: string | null
          secondary_category?: string | null
          status?: Database["public"]["Enums"]["case_status"]
          structured_record?: Json
          transcript_bn: string
          transcript_source?: string | null
          updated_at?: string
          urgency?: Database["public"]["Enums"]["case_urgency"]
        }
        Update: {
          assigned_to?: string | null
          audio_duration_seconds?: number
          audio_path?: string | null
          case_kind?: string
          case_number?: string
          confidence?: number
          created_at?: string
          id?: string
          missing_fields?: Json
          primary_category?: string
          received_at?: string
          safety_flag?: boolean
          safety_note?: string | null
          secondary_category?: string | null
          status?: Database["public"]["Enums"]["case_status"]
          structured_record?: Json
          transcript_bn?: string
          transcript_source?: string | null
          updated_at?: string
          urgency?: Database["public"]["Enums"]["case_urgency"]
        }
        Relationships: []
      }
      complaint_drafts: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          case_id: string
          created_at: string
          draft_text: string
          id: string
          review_state: string
          template_key: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          case_id: string
          created_at?: string
          draft_text: string
          id?: string
          review_state?: string
          template_key: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          case_id?: string
          created_at?: string
          draft_text?: string
          id?: string
          review_state?: string
          template_key?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "complaint_drafts_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: true
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_article_sources: {
        Row: {
          article_id: string
          created_at: string
          id: string
          notes: string | null
          section_kind: string | null
          source_id: string
        }
        Insert: {
          article_id: string
          created_at?: string
          id?: string
          notes?: string | null
          section_kind?: string | null
          source_id: string
        }
        Update: {
          article_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          section_kind?: string | null
          source_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_article_sources_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "knowledge_articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knowledge_article_sources_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "knowledge_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_articles: {
        Row: {
          category_id: string
          created_at: string
          help_contacts: Json
          id: string
          published: boolean
          related_slugs: string[]
          reviewed_on: string | null
          reviewed_status: string
          sections: Json
          slug: string
          summary_bn: string
          tags: string[]
          title_bn: string
          title_en: string
          updated_at: string
        }
        Insert: {
          category_id: string
          created_at?: string
          help_contacts?: Json
          id: string
          published?: boolean
          related_slugs?: string[]
          reviewed_on?: string | null
          reviewed_status?: string
          sections?: Json
          slug: string
          summary_bn: string
          tags?: string[]
          title_bn: string
          title_en: string
          updated_at?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          help_contacts?: Json
          id?: string
          published?: boolean
          related_slugs?: string[]
          reviewed_on?: string | null
          reviewed_status?: string
          sections?: Json
          slug?: string
          summary_bn?: string
          tags?: string[]
          title_bn?: string
          title_en?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_articles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "knowledge_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_categories: {
        Row: {
          created_at: string
          description_bn: string
          display_order: number
          icon: string
          id: string
          name_bn: string
          name_en: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description_bn: string
          display_order?: number
          icon: string
          id: string
          name_bn: string
          name_en: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description_bn?: string
          display_order?: number
          icon?: string
          id?: string
          name_bn?: string
          name_en?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      knowledge_sources: {
        Row: {
          act_year: number | null
          created_at: string
          id: string
          issuing_authority: string | null
          notes: string | null
          official_url: string | null
          publication_date: string | null
          reviewed_on: string | null
          reviewed_status: string
          section_or_rule: string | null
          source_title_bn: string
          source_title_en: string | null
          source_type: string
          updated_at: string
        }
        Insert: {
          act_year?: number | null
          created_at?: string
          id?: string
          issuing_authority?: string | null
          notes?: string | null
          official_url?: string | null
          publication_date?: string | null
          reviewed_on?: string | null
          reviewed_status?: string
          section_or_rule?: string | null
          source_title_bn: string
          source_title_en?: string | null
          source_type: string
          updated_at?: string
        }
        Update: {
          act_year?: number | null
          created_at?: string
          id?: string
          issuing_authority?: string | null
          notes?: string | null
          official_url?: string | null
          publication_date?: string | null
          reviewed_on?: string | null
          reviewed_status?: string
          section_or_rule?: string | null
          source_title_bn?: string
          source_title_en?: string | null
          source_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      staff_profiles: {
        Row: {
          active: boolean
          clinic_name: string | null
          created_at: string
          display_name: string
          email: string
          id: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          clinic_name?: string | null
          created_at?: string
          display_name: string
          email: string
          id?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          clinic_name?: string | null
          created_at?: string
          display_name?: string
          email?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      training_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          session_id: string
          turn_number: number
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          session_id: string
          turn_number: number
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          session_id?: string
          turn_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "training_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "training_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      training_scenarios: {
        Row: {
          active: boolean
          age: number | null
          competency_focus: string[]
          created_at: string
          difficulty: string
          district: string
          gender: string | null
          hidden_ground_truth: Json
          id: string
          legal_category: string
          persona_name: string
          public_brief: string
          title_bn: string
          title_en: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          age?: number | null
          competency_focus?: string[]
          created_at?: string
          difficulty: string
          district: string
          gender?: string | null
          hidden_ground_truth: Json
          id: string
          legal_category: string
          persona_name: string
          public_brief: string
          title_bn: string
          title_en: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          age?: number | null
          competency_focus?: string[]
          created_at?: string
          difficulty?: string
          district?: string
          gender?: string | null
          hidden_ground_truth?: Json
          id?: string
          legal_category?: string
          persona_name?: string
          public_brief?: string
          title_bn?: string
          title_en?: string
          updated_at?: string
        }
        Relationships: []
      }
      training_scores: {
        Row: {
          competency_scores: Json
          created_at: string
          documentation_completeness: string | null
          effective_interview_checklist: Json
          elicited_facts: Json
          id: string
          leading_or_repetitive_questions: Json
          legal_process_source_note: string
          missed_evidence_questions: Json
          missed_information: Json
          missed_safety_questions: Json
          session_id: string
          session_summary: string | null
          strengths: Json
          suggested_follow_ups: Json
          total_score: number
        }
        Insert: {
          competency_scores: Json
          created_at?: string
          documentation_completeness?: string | null
          effective_interview_checklist?: Json
          elicited_facts?: Json
          id?: string
          leading_or_repetitive_questions?: Json
          legal_process_source_note?: string
          missed_evidence_questions?: Json
          missed_information?: Json
          missed_safety_questions?: Json
          session_id: string
          session_summary?: string | null
          strengths?: Json
          suggested_follow_ups?: Json
          total_score: number
        }
        Update: {
          competency_scores?: Json
          created_at?: string
          documentation_completeness?: string | null
          effective_interview_checklist?: Json
          elicited_facts?: Json
          id?: string
          leading_or_repetitive_questions?: Json
          legal_process_source_note?: string
          missed_evidence_questions?: Json
          missed_information?: Json
          missed_safety_questions?: Json
          session_id?: string
          session_summary?: string | null
          strengths?: Json
          suggested_follow_ups?: Json
          total_score?: number
        }
        Relationships: [
          {
            foreignKeyName: "training_scores_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: true
            referencedRelation: "training_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      training_sessions: {
        Row: {
          completed_at: string | null
          created_at: string
          duration_seconds: number | null
          id: string
          scenario_id: string
          staff_id: string
          started_at: string
          status: Database["public"]["Enums"]["training_status"]
          turn_count: number
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          duration_seconds?: number | null
          id?: string
          scenario_id: string
          staff_id: string
          started_at?: string
          status?: Database["public"]["Enums"]["training_status"]
          turn_count?: number
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          duration_seconds?: number | null
          id?: string
          scenario_id?: string
          staff_id?: string
          started_at?: string
          status?: Database["public"]["Enums"]["training_status"]
          turn_count?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_sessions_scenario_id_fkey"
            columns: ["scenario_id"]
            isOneToOne: false
            referencedRelation: "training_scenarios"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_active_staff: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "paralegal" | "coordinator" | "admin"
      case_status: "New" | "Assigned" | "Booked" | "Closed"
      case_urgency: "Urgent" | "Time-sensitive" | "Normal"
      training_status: "in_progress" | "completed" | "abandoned"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["paralegal", "coordinator", "admin"],
      case_status: ["New", "Assigned", "Booked", "Closed"],
      case_urgency: ["Urgent", "Time-sensitive", "Normal"],
      training_status: ["in_progress", "completed", "abandoned"],
    },
  },
} as const
