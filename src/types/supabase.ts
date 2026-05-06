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
      Session: {
        Row: {
          id: string
          createdAt: string
          updatedAt: string
          status: string
          squad: string
          functionalityType: string
          currentPain: string
        }
        Insert: {
          id?: string
          createdAt?: string
          updatedAt?: string
          status?: string
          squad: string
          functionalityType: string
          currentPain: string
        }
        Update: {
          id?: string
          createdAt?: string
          updatedAt?: string
          status?: string
          squad?: string
          functionalityType?: string
          currentPain?: string
        }
      }
      Message: {
        Row: {
          id: string
          createdAt: string
          sessionId: string
          role: string
          content: string
          type: string | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          createdAt?: string
          sessionId: string
          role: string
          content: string
          type?: string | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          createdAt?: string
          sessionId?: string
          role?: string
          content?: string
          type?: string | null
          metadata?: Json | null
        }
      }
      UserStory: {
        Row: {
          id: string
          createdAt: string
          sessionId: string
          messageId: string
          persona: string
          action: string
          benefit: string
          criteria: Json
          lintResult: Json | null
          linearIssueId: string | null
          linearIssueUrl: string | null
        }
        Insert: {
          id?: string
          createdAt?: string
          sessionId: string
          messageId: string
          persona: string
          action: string
          benefit: string
          criteria: Json
          lintResult?: Json | null
          linearIssueId?: string | null
          linearIssueUrl?: string | null
        }
        Update: {
          id?: string
          createdAt?: string
          sessionId?: string
          messageId?: string
          persona?: string
          action?: string
          benefit?: string
          criteria?: Json
          lintResult?: Json | null
          linearIssueId?: string | null
          linearIssueUrl?: string | null
        }
      }
      Feedback: {
        Row: {
          id: string
          createdAt: string
          sessionId: string
          messageId: string
          vote: string
          reason: string | null
        }
        Insert: {
          id?: string
          createdAt?: string
          sessionId: string
          messageId: string
          vote: string
          reason?: string | null
        }
        Update: {
          id?: string
          createdAt?: string
          sessionId?: string
          messageId?: string
          vote?: string
          reason?: string | null
        }
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
