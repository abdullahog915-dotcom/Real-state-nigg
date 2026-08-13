// Database Types
// This file contains TypeScript types for all database tables
// Generated based on the Supabase schema

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
      profiles: {
        Row: {
          id: string;
          user_id: string;
          first_name: string | null;
          last_name: string | null;
          phone: string | null;
          role: 'customer' | 'agent' | 'admin';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          first_name?: string | null;
          last_name?: string | null;
          phone?: string | null;
          role?: 'customer' | 'agent' | 'admin';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          first_name?: string | null;
          last_name?: string | null;
          phone?: string | null;
          role?: 'customer' | 'agent' | 'admin';
          created_at?: string;
          updated_at?: string;
        };
      };
      agents: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          slug: string;
          email: string | null;
          phone: string | null;
          whatsapp: string | null;
          bio: string | null;
          photo_url: string | null;
          specialization: string[] | null;
          locations: string[] | null;
          is_active: boolean;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          name: string;
          slug: string;
          email?: string | null;
          phone?: string | null;
          whatsapp?: string | null;
          bio?: string | null;
          photo_url?: string | null;
          specialization?: string[] | null;
          locations?: string[] | null;
          is_active?: boolean;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          name?: string;
          slug?: string;
          email?: string | null;
          phone?: string | null;
          whatsapp?: string | null;
          bio?: string | null;
          photo_url?: string | null;
          specialization?: string[] | null;
          locations?: string[] | null;
          is_active?: boolean;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      locations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          city: string;
          state: string;
          country: string;
          description: string | null;
          is_featured: boolean;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          city: string;
          state: string;
          country?: string;
          description?: string | null;
          is_featured?: boolean;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          city?: string;
          state?: string;
          country?: string;
          description?: string | null;
          is_featured?: boolean;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      properties: {
        Row: {
          id: string;
          title: string;
          slug: string;
          description: string | null;
          property_id: string | null;
          property_type: string;
          transaction_type: 'sale' | 'rent' | 'short-let';
          status: 'draft' | 'published' | 'featured' | 'sold' | 'rented' | 'archived';
          price: number;
          currency: string;
          location_id: string | null;
          address: string | null;
          latitude: number | null;
          longitude: number | null;
          bedrooms: number | null;
          bathrooms: number | null;
          toilets: number | null;
          area: number | null;
          lot_size: number | null;
          year_built: number | null;
          parking_spaces: number | null;
          floors: number | null;
          is_furnished: boolean;
          featured_image: string | null;
          gallery_images: string[] | null;
          floor_plan_url: string | null;
          video_url: string | null;
          agent_id: string | null;
          meta_title: string | null;
          meta_description: string | null;
          og_image: string | null;
          is_featured: boolean;
          views_count: number;
          created_at: string;
          updated_at: string;
          published_at: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          description?: string | null;
          property_id?: string | null;
          property_type: string;
          transaction_type: 'sale' | 'rent' | 'short-let';
          status?: 'draft' | 'published' | 'featured' | 'sold' | 'rented' | 'archived';
          price: number;
          currency?: string;
          location_id?: string | null;
          address?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          bedrooms?: number | null;
          bathrooms?: number | null;
          toilets?: number | null;
          area?: number | null;
          lot_size?: number | null;
          year_built?: number | null;
          parking_spaces?: number | null;
          floors?: number | null;
          is_furnished?: boolean;
          featured_image?: string | null;
          gallery_images?: string[] | null;
          floor_plan_url?: string | null;
          video_url?: string | null;
          agent_id?: string | null;
          meta_title?: string | null;
          meta_description?: string | null;
          og_image?: string | null;
          is_featured?: boolean;
          views_count?: number;
          created_at?: string;
          updated_at?: string;
          published_at?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          description?: string | null;
          property_id?: string | null;
          property_type?: string;
          transaction_type?: 'sale' | 'rent' | 'short-let';
          status?: 'draft' | 'published' | 'featured' | 'sold' | 'rented' | 'archived';
          price?: number;
          currency?: string;
          location_id?: string | null;
          address?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          bedrooms?: number | null;
          bathrooms?: number | null;
          toilets?: number | null;
          area?: number | null;
          lot_size?: number | null;
          year_built?: number | null;
          parking_spaces?: number | null;
          floors?: number | null;
          is_furnished?: boolean;
          featured_image?: string | null;
          gallery_images?: string[] | null;
          floor_plan_url?: string | null;
          video_url?: string | null;
          agent_id?: string | null;
          meta_title?: string | null;
          meta_description?: string | null;
          og_image?: string | null;
          is_featured?: boolean;
          views_count?: number;
          created_at?: string;
          updated_at?: string;
          published_at?: string | null;
        };
      };
      amenities: {
        Row: {
          id: string;
          name: string;
          slug: string;
          icon: string | null;
          category: 'general' | 'security' | 'facilities' | 'services' | null;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          icon?: string | null;
          category?: 'general' | 'security' | 'facilities' | 'services' | null;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          icon?: string | null;
          category?: 'general' | 'security' | 'facilities' | 'services' | null;
          display_order?: number;
          created_at?: string;
        };
      };
      property_amenities: {
        Row: {
          id: string;
          property_id: string;
          amenity_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          amenity_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string;
          amenity_id?: string;
          created_at?: string;
        };
      };
      favorites: {
        Row: {
          id: string;
          user_id: string;
          property_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          property_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          property_id?: string;
          created_at?: string;
        };
      };
      inquiries: {
        Row: {
          id: string;
          property_id: string | null;
          name: string;
          email: string;
          phone: string | null;
          message: string;
          source: 'website' | 'whatsapp' | 'phone' | 'email';
          status: 'new' | 'contacted' | 'qualified' | 'negotiation' | 'won' | 'lost';
          assigned_agent_id: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          property_id?: string | null;
          name: string;
          email: string;
          phone?: string | null;
          message: string;
          source?: 'website' | 'whatsapp' | 'phone' | 'email';
          status?: 'new' | 'contacted' | 'qualified' | 'negotiation' | 'won' | 'lost';
          assigned_agent_id?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string | null;
          name?: string;
          email?: string;
          phone?: string | null;
          message?: string;
          source?: 'website' | 'whatsapp' | 'phone' | 'email';
          status?: 'new' | 'contacted' | 'qualified' | 'negotiation' | 'won' | 'lost';
          assigned_agent_id?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      viewing_requests: {
        Row: {
          id: string;
          property_id: string;
          name: string;
          email: string;
          phone: string;
          preferred_date: string;
          preferred_time: string;
          message: string | null;
          status: 'requested' | 'confirmed' | 'completed' | 'cancelled';
          agent_id: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          name: string;
          email: string;
          phone: string;
          preferred_date: string;
          preferred_time: string;
          message?: string | null;
          status?: 'requested' | 'confirmed' | 'completed' | 'cancelled';
          agent_id?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string;
          name?: string;
          email?: string;
          phone?: string;
          preferred_date?: string;
          preferred_time?: string;
          message?: string | null;
          status?: 'requested' | 'confirmed' | 'completed' | 'cancelled';
          agent_id?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      blog_categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          display_order?: number;
          created_at?: string;
        };
      };
      blog_posts: {
        Row: {
          id: string;
          title: string;
          slug: string;
          content: string;
          excerpt: string | null;
          category_id: string | null;
          author_id: string | null;
          featured_image: string | null;
          status: 'draft' | 'published' | 'archived';
          meta_title: string | null;
          meta_description: string | null;
          views_count: number;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          content: string;
          excerpt?: string | null;
          category_id?: string | null;
          author_id?: string | null;
          featured_image?: string | null;
          status?: 'draft' | 'published' | 'archived';
          meta_title?: string | null;
          meta_description?: string | null;
          views_count?: number;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          content?: string;
          excerpt?: string | null;
          category_id?: string | null;
          author_id?: string | null;
          featured_image?: string | null;
          status?: 'draft' | 'published' | 'archived';
          meta_title?: string | null;
          meta_description?: string | null;
          views_count?: number;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      contact_submissions: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string | null;
          message: string;
          status: 'new' | 'read' | 'replied' | 'archived';
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone?: string | null;
          message: string;
          status?: 'new' | 'read' | 'replied' | 'archived';
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string | null;
          message?: string;
          status?: 'new' | 'read' | 'replied' | 'archived';
          created_at?: string;
        };
      };
      site_settings: {
        Row: {
          id: string;
          key: string;
          value: string | null;
          type: 'text' | 'number' | 'boolean' | 'json';
          group_name: string | null;
          description: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          key: string;
          value?: string | null;
          type?: 'text' | 'number' | 'boolean' | 'json';
          group_name?: string | null;
          description?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          key?: string;
          value?: string | null;
          type?: 'text' | 'number' | 'boolean' | 'json';
          group_name?: string | null;
          description?: string | null;
          updated_at?: string;
        };
      };
      social_links: {
        Row: {
          id: string;
          platform: 'facebook' | 'instagram' | 'twitter' | 'linkedin' | 'youtube' | 'whatsapp';
          url: string;
          display_order: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          platform: 'facebook' | 'instagram' | 'twitter' | 'linkedin' | 'youtube' | 'whatsapp';
          url: string;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          platform?: 'facebook' | 'instagram' | 'twitter' | 'linkedin' | 'youtube' | 'whatsapp';
          url?: string;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
        };
      };
    };
    Views: {};
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      is_agent: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
  };
}
