export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      cities: {
        Row: {
          id: string
          is_remote: boolean | null
          name: string
          region: string | null
        }
        Insert: {
          id?: string
          is_remote?: boolean | null
          name: string
          region?: string | null
        }
        Update: {
          id?: string
          is_remote?: boolean | null
          name?: string
          region?: string | null
        }
        Relationships: []
      }
      job_categories: {
        Row: {
          id: string
          name: string
          parent_id: string | null
        }
        Insert: {
          id?: string
          name: string
          parent_id?: string | null
        }
        Update: {
          id?: string
          name?: string
          parent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "job_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          participant_a: string | null
          participant_b: string | null
          vacancy_id: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          participant_a?: string | null
          participant_b?: string | null
          vacancy_id?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          participant_a?: string | null
          participant_b?: string | null
          vacancy_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matches_participant_a_fkey"
            columns: ["participant_a"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_participant_b_fkey"
            columns: ["participant_b"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_vacancy_id_fkey"
            columns: ["vacancy_id"]
            isOneToOne: false
            referencedRelation: "vacancies"
            referencedColumns: ["id"]
          },
        ]
      }
      swipes: {
        Row: {
          created_at: string | null
          direction: Database["public"]["Enums"]["swipe_direction"]
          id: string
          swiper_id: string | null
          target_id: string
          target_type: Database["public"]["Enums"]["target_type"]
        }
        Insert: {
          created_at?: string | null
          direction: Database["public"]["Enums"]["swipe_direction"]
          id?: string
          swiper_id?: string | null
          target_id: string
          target_type: Database["public"]["Enums"]["target_type"]
        }
        Update: {
          created_at?: string | null
          direction?: Database["public"]["Enums"]["swipe_direction"]
          id?: string
          swiper_id?: string | null
          target_id?: string
          target_type?: Database["public"]["Enums"]["target_type"]
        }
        Relationships: [
          {
            foreignKeyName: "swipes_swiper_id_fkey"
            columns: ["swiper_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          achievement: string | null
          avatar_url: string | null
          city: string | null
          company: string | null
          created_at: string | null
          experience: string | null
          first_name: string
          id: string
          last_name: string | null
          portfolio_url: string | null
          resume_url: string | null
          role: Database["public"]["Enums"]["user_role"]
          salary_expectation: number | null
          skills: string[] | null
          telegram_id: number
          updated_at: string | null
          username: string | null
          video_resume_url: string | null
        }
        Insert: {
          achievement?: string | null
          avatar_url?: string | null
          city?: string | null
          company?: string | null
          created_at?: string | null
          experience?: string | null
          first_name: string
          id?: string
          last_name?: string | null
          portfolio_url?: string | null
          resume_url?: string | null
          role: Database["public"]["Enums"]["user_role"]
          salary_expectation?: number | null
          skills?: string[] | null
          telegram_id: number
          updated_at?: string | null
          username?: string | null
          video_resume_url?: string | null
        }
        Update: {
          achievement?: string | null
          avatar_url?: string | null
          city?: string | null
          company?: string | null
          created_at?: string | null
          experience?: string | null
          first_name?: string
          id?: string
          last_name?: string | null
          portfolio_url?: string | null
          resume_url?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          salary_expectation?: number | null
          skills?: string[] | null
          telegram_id?: number
          updated_at?: string | null
          username?: string | null
          video_resume_url?: string | null
        }
        Relationships: []
      }
      vacancies: {
        Row: {
          city: string
          created_at: string | null
          description: string
          employer_id: string | null
          id: string
          salary_max: number | null
          salary_min: number | null
          skills_required: string[] | null
          team_lead_avatar: string | null
          team_lead_name: string | null
          title: string
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          city: string
          created_at?: string | null
          description: string
          employer_id?: string | null
          id?: string
          salary_max?: number | null
          salary_min?: number | null
          skills_required?: string[] | null
          team_lead_avatar?: string | null
          team_lead_name?: string | null
          title: string
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          city?: string
          created_at?: string | null
          description?: string
          employer_id?: string | null
          id?: string
          salary_max?: number | null
          salary_min?: number | null
          skills_required?: string[] | null
          team_lead_avatar?: string | null
          team_lead_name?: string | null
          title?: string
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vacancies_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      clean_expired_matches: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_filtered_seekers_for_employer: {
        Args: {
          p_user_id: string
          p_city?: string
          p_skills?: string[]
          p_salary_min?: number
          p_salary_max?: number
          p_has_video?: boolean
        }
        Returns: {
          id: string
          telegram_id: number
          username: string
          first_name: string
          last_name: string
          avatar_url: string
          city: string
          skills: string[]
          experience: string
          achievement: string
          salary_expectation: number
          resume_url: string
          portfolio_url: string
          video_resume_url: string
          role: string
          created_at: string
          updated_at: string
        }[]
      }
      get_filtered_vacancies_for_seeker: {
        Args: {
          p_user_id: string
          p_city?: string
          p_skills?: string[]
          p_salary_min?: number
          p_salary_max?: number
          p_has_video?: boolean
        }
        Returns: {
          id: string
          title: string
          description: string
          city: string
          skills_required: string[]
          salary_min: number
          salary_max: number
          video_url: string
          team_lead_name: string
          team_lead_avatar: string
          employer_id: string
          created_at: string
          updated_at: string
          employer_first_name: string
          employer_last_name: string
          employer_company: string
          employer_avatar_url: string
        }[]
      }
    }
    Enums: {
      swipe_direction: "like" | "dislike"
      target_type: "user" | "vacancy"
      user_role: "seeker" | "employer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      swipe_direction: ["like", "dislike"],
      target_type: ["user", "vacancy"],
      user_role: ["seeker", "employer"],
    },
  },
} as const
