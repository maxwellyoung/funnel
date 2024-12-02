export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      resources: {
        Row: {
          id: string;
          title: string;
          url: string;
          notes: string | null;
          is_completed: boolean;
          progress: number;
          created_at: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          title: string;
          url: string;
          notes?: string | null;
          is_completed?: boolean;
          progress?: number;
          created_at?: string;
          user_id: string;
        };
        Update: {
          id?: string;
          title?: string;
          url?: string;
          notes?: string | null;
          is_completed?: boolean;
          progress?: number;
          created_at?: string;
          user_id?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
        };
        Insert: {
          id?: string;
          name: string;
        };
        Update: {
          id?: string;
          name?: string;
        };
      };
      resource_categories: {
        Row: {
          resource_id: string;
          category_id: string;
        };
        Insert: {
          resource_id: string;
          category_id: string;
        };
        Update: {
          resource_id?: string;
          category_id?: string;
        };
      };
    };
  };
}
