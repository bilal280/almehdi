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
      admins: {
        Row: {
          created_at: string
          id: string
          name: string
          password: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          password: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          password?: string
          updated_at?: string
        }
        Relationships: []
      }
      circle_daily_activities: {
        Row: {
          activity_type: string
          circle_id: string
          completed_pages: number | null
          created_at: string
          date: string
          description: string | null
          id: string
          notes: string | null
          target_pages: number | null
          updated_at: string
        }
        Insert: {
          activity_type: string
          circle_id: string
          completed_pages?: number | null
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          notes?: string | null
          target_pages?: number | null
          updated_at?: string
        }
        Update: {
          activity_type?: string
          circle_id?: string
          completed_pages?: number | null
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          notes?: string | null
          target_pages?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "circle_daily_activities_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "circles"
            referencedColumns: ["id"]
          },
        ]
      }
      circles: {
        Row: {
          created_at: string
          group_name: string
          id: string
          name: string
          teacher_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          group_name: string
          id?: string
          name: string
          teacher_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          group_name?: string
          id?: string
          name?: string
          teacher_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "circles_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      student_attendance: {
        Row: {
          created_at: string
          date: string
          id: string
          notes: string | null
          status: string
          student_id: string
          teacher_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          status: string
          student_id: string
          teacher_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          status?: string
          student_id?: string
          teacher_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_attendance_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      student_beginner_recitations: {
        Row: {
          created_at: string
          date: string
          grade: string | null
          id: string
          line_count: number
          line_numbers: string | null
          page_number: number
          student_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          date?: string
          grade?: string | null
          id?: string
          line_count: number
          line_numbers?: string | null
          page_number: number
          student_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          date?: string
          grade?: string | null
          id?: string
          line_count?: number
          line_numbers?: string | null
          page_number?: number
          student_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      student_daily_work: {
        Row: {
          behavior_grade: string | null
          created_at: string
          date: string
          general_points: number | null
          hadith_count: number | null
          hadith_grade: string | null
          id: string
          new_recitation_grade: string | null
          new_recitation_page_numbers: string | null
          new_recitation_pages: number | null
          review_grade: string | null
          review_page_numbers: string | null
          review_pages: number | null
          student_id: string
          teacher_notes: string | null
          updated_at: string
        }
        Insert: {
          behavior_grade?: string | null
          created_at?: string
          date?: string
          general_points?: number | null
          hadith_count?: number | null
          hadith_grade?: string | null
          id?: string
          new_recitation_grade?: string | null
          new_recitation_page_numbers?: string | null
          new_recitation_pages?: number | null
          review_grade?: string | null
          review_page_numbers?: string | null
          review_pages?: number | null
          student_id: string
          teacher_notes?: string | null
          updated_at?: string
        }
        Update: {
          behavior_grade?: string | null
          created_at?: string
          date?: string
          general_points?: number | null
          hadith_count?: number | null
          hadith_grade?: string | null
          id?: string
          new_recitation_grade?: string | null
          new_recitation_page_numbers?: string | null
          new_recitation_pages?: number | null
          review_grade?: string | null
          review_page_numbers?: string | null
          review_pages?: number | null
          student_id?: string
          teacher_notes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_daily_work_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_exams: {
        Row: {
          attempt_number: number
          circle_id: string
          created_at: string
          exam_date: string
          exam_score: number | null
          grade: string | null
          id: string
          juz_number: number
          notes: string | null
          short_surah_grade: string | null
          short_surah_name: string | null
          stability_score: number | null
          student_id: string
          tafsir_score: number | null
          tajweed_score: number | null
          updated_at: string
        }
        Insert: {
          attempt_number: number
          circle_id: string
          created_at?: string
          exam_date?: string
          exam_score?: number | null
          grade?: string | null
          id?: string
          juz_number: number
          notes?: string | null
          short_surah_grade?: string | null
          short_surah_name?: string | null
          stability_score?: number | null
          student_id: string
          tafsir_score?: number | null
          tajweed_score?: number | null
          updated_at?: string
        }
        Update: {
          attempt_number?: number
          circle_id?: string
          created_at?: string
          exam_date?: string
          exam_score?: number | null
          grade?: string | null
          id?: string
          juz_number?: number
          notes?: string | null
          short_surah_grade?: string | null
          short_surah_name?: string | null
          stability_score?: number | null
          student_id?: string
          tafsir_score?: number | null
          tajweed_score?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_exams_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "circles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_exams_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_points: {
        Row: {
          created_at: string
          date: string
          id: string
          point_type: string
          points: number
          reason: string | null
          student_id: string
          teacher_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          date?: string
          id?: string
          point_type: string
          points?: number
          reason?: string | null
          student_id: string
          teacher_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          point_type?: string
          points?: number
          reason?: string | null
          student_id?: string
          teacher_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_points_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_ranking_points: {
        Row: {
          attendance_points: number | null
          behavior_points: number | null
          created_at: string
          date: string
          exam_points: number | null
          homework_points: number | null
          id: string
          student_id: string
          total_points: number | null
          updated_at: string
        }
        Insert: {
          attendance_points?: number | null
          behavior_points?: number | null
          created_at?: string
          date?: string
          exam_points?: number | null
          homework_points?: number | null
          id?: string
          student_id: string
          total_points?: number | null
          updated_at?: string
        }
        Update: {
          attendance_points?: number | null
          behavior_points?: number | null
          created_at?: string
          date?: string
          exam_points?: number | null
          homework_points?: number | null
          id?: string
          student_id?: string
          total_points?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_ranking_points_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          age: number
          circle_id: string
          contact_number: string | null
          contact_number_2: string | null
          created_at: string
          father_name: string | null
          id: string
          level: string
          mother_name: string | null
          name: string
          notes: string | null
          photo_url: string | null
          residence_area: string | null
          student_number: number
          updated_at: string
        }
        Insert: {
          age: number
          circle_id: string
          contact_number?: string | null
          contact_number_2?: string | null
          created_at?: string
          father_name?: string | null
          id?: string
          level?: string
          mother_name?: string | null
          name: string
          notes?: string | null
          photo_url?: string | null
          residence_area?: string | null
          student_number?: number
          updated_at?: string
        }
        Update: {
          age?: number
          circle_id?: string
          contact_number?: string | null
          contact_number_2?: string | null
          created_at?: string
          father_name?: string | null
          id?: string
          level?: string
          mother_name?: string | null
          name?: string
          notes?: string | null
          photo_url?: string | null
          residence_area?: string | null
          student_number?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "students_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "circles"
            referencedColumns: ["id"]
          },
        ]
      }
      teachers: {
        Row: {
          created_at: string
          id: string
          name: string
          password: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          password: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          password?: string
          updated_at?: string
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
