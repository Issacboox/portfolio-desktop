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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      admins: {
        Row: {
          created_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          cited_chunk_ids: string[]
          content: string
          created_at: string
          id: string
          input_tokens: number | null
          output_tokens: number | null
          role: Database["public"]["Enums"]["chat_role"]
          session_id: string
        }
        Insert: {
          cited_chunk_ids?: string[]
          content: string
          created_at?: string
          id?: string
          input_tokens?: number | null
          output_tokens?: number | null
          role: Database["public"]["Enums"]["chat_role"]
          session_id: string
        }
        Update: {
          cited_chunk_ids?: string[]
          content?: string
          created_at?: string
          id?: string
          input_tokens?: number | null
          output_tokens?: number | null
          role?: Database["public"]["Enums"]["chat_role"]
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          country: string | null
          id: string
          page: string | null
          started_at: string
          visitor_hash: string
        }
        Insert: {
          country?: string | null
          id?: string
          page?: string | null
          started_at?: string
          visitor_hash: string
        }
        Update: {
          country?: string | null
          id?: string
          page?: string | null
          started_at?: string
          visitor_hash?: string
        }
        Relationships: []
      }
      fit_reports: {
        Row: {
          created_at: string
          email: string | null
          id: string
          job_description: string
          result: Json
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          job_description: string
          result: Json
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          job_description?: string
          result?: Json
        }
        Relationships: []
      }
      knowledge_chunks: {
        Row: {
          chunk_index: number
          content: string
          embedding: string | null
          id: string
          source_id: string
          source_type: Database["public"]["Enums"]["source_type"]
          updated_at: string
        }
        Insert: {
          chunk_index: number
          content: string
          embedding?: string | null
          id?: string
          source_id: string
          source_type: Database["public"]["Enums"]["source_type"]
          updated_at?: string
        }
        Update: {
          chunk_index?: number
          content?: string
          embedding?: string | null
          id?: string
          source_id?: string
          source_type?: Database["public"]["Enums"]["source_type"]
          updated_at?: string
        }
        Relationships: []
      }
      posts: {
        Row: {
          body_md: string
          created_at: string
          excerpt: string | null
          id: string
          published_at: string | null
          slug: string
          status: Database["public"]["Enums"]["post_status"]
          summary: string | null
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: {
          body_md?: string
          created_at?: string
          excerpt?: string | null
          id?: string
          published_at?: string | null
          slug: string
          status?: Database["public"]["Enums"]["post_status"]
          summary?: string | null
          tags?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          body_md?: string
          created_at?: string
          excerpt?: string | null
          id?: string
          published_at?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["post_status"]
          summary?: string | null
          tags?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profile_sections: {
        Row: {
          body_md: string
          id: string
          key: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          body_md?: string
          id?: string
          key: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          body_md?: string
          id?: string
          key?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          approach: string | null
          created_at: string
          featured: boolean
          id: string
          live_url: string | null
          problem: string | null
          published: boolean
          repo_url: string | null
          result: string | null
          role: string | null
          slug: string
          sort_order: number
          stack: string[]
          title: string
          updated_at: string
        }
        Insert: {
          approach?: string | null
          created_at?: string
          featured?: boolean
          id?: string
          live_url?: string | null
          problem?: string | null
          published?: boolean
          repo_url?: string | null
          result?: string | null
          role?: string | null
          slug: string
          sort_order?: number
          stack?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          approach?: string | null
          created_at?: string
          featured?: boolean
          id?: string
          live_url?: string | null
          problem?: string | null
          published?: boolean
          repo_url?: string | null
          result?: string | null
          role?: string | null
          slug?: string
          sort_order?: number
          stack?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
      match_knowledge_chunks: {
        Args: {
          match_count?: number
          min_similarity?: number
          query_embedding: string
        }
        Returns: {
          content: string
          id: string
          similarity: number
          source_id: string
          source_type: Database["public"]["Enums"]["source_type"]
        }[]
      }
    }
    Enums: {
      chat_role: "user" | "assistant"
      post_status: "draft" | "published"
      source_type: "profile" | "project" | "post"
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
      chat_role: ["user", "assistant"],
      post_status: ["draft", "published"],
      source_type: ["profile", "project", "post"],
    },
  },
} as const
