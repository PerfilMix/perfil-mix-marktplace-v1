export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      accounts: {
        Row: {
          account_screenshot_url: string | null
          clientes: number | null
          comprada_por: string | null
          created_at: string
          descricao_loja: string | null
          dominio_incluso: boolean | null
          engajamento: string
          id: string
          integracoes_ativas: string | null
          login: string
          loja_pronta: boolean | null
          monetizada: string | null
          nicho: string
          nicho_customizado: string | null
          nome: string
          pais: string
          plataforma: string
          preco: number
          produtos_cadastrados: number | null
          profile_image_url: string | null
          seguidores: number
          senha: string
          status: string
          tiktok_shop: string
          trafego_mensal: string | null
          vendas_mensais: string | null
          vendedor_id: string | null
        }
        Insert: {
          account_screenshot_url?: string | null
          clientes?: number | null
          comprada_por?: string | null
          created_at?: string
          descricao_loja?: string | null
          dominio_incluso?: boolean | null
          engajamento?: string
          id?: string
          integracoes_ativas?: string | null
          login: string
          loja_pronta?: boolean | null
          monetizada?: string | null
          nicho: string
          nicho_customizado?: string | null
          nome: string
          pais: string
          plataforma?: string
          preco: number
          produtos_cadastrados?: number | null
          profile_image_url?: string | null
          seguidores: number
          senha: string
          status?: string
          tiktok_shop?: string
          trafego_mensal?: string | null
          vendas_mensais?: string | null
          vendedor_id?: string | null
        }
        Update: {
          account_screenshot_url?: string | null
          clientes?: number | null
          comprada_por?: string | null
          created_at?: string
          descricao_loja?: string | null
          dominio_incluso?: boolean | null
          engajamento?: string
          id?: string
          integracoes_ativas?: string | null
          login?: string
          loja_pronta?: boolean | null
          monetizada?: string | null
          nicho?: string
          nicho_customizado?: string | null
          nome?: string
          pais?: string
          plataforma?: string
          preco?: number
          produtos_cadastrados?: number | null
          profile_image_url?: string | null
          seguidores?: number
          senha?: string
          status?: string
          tiktok_shop?: string
          trafego_mensal?: string | null
          vendas_mensais?: string | null
          vendedor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "accounts_vendedor_id_fkey"
            columns: ["vendedor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      admins: {
        Row: {
          created_at: string
          email: string
          id: string
          password: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          password: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          password?: string
        }
        Relationships: []
      }
      banners: {
        Row: {
          created_at: string
          id: string
          image_url: string
          is_active: boolean
          link_url: string | null
          order_position: number
          title: string | null
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          is_active?: boolean
          link_url?: string | null
          order_position?: number
          title?: string | null
          type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          is_active?: boolean
          link_url?: string | null
          order_position?: number
          title?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      checkout_data: {
        Row: {
          cpf_cnpj: string
          created_at: string
          email: string
          email_confirmacao: string
          id: string
          nome_completo: string
          telefone: string
          tenant_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cpf_cnpj: string
          created_at?: string
          email: string
          email_confirmacao: string
          id?: string
          nome_completo: string
          telefone: string
          tenant_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cpf_cnpj?: string
          created_at?: string
          email?: string
          email_confirmacao?: string
          id?: string
          nome_completo?: string
          telefone?: string
          tenant_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "checkout_data_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      collaborators: {
        Row: {
          created_at: string
          created_by: string | null
          email: string
          id: string
          is_active: boolean | null
          name: string
          password: string
          permissions: string[] | null
          telefone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          name: string
          password: string
          permissions?: string[] | null
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          name?: string
          password?: string
          permissions?: string[] | null
          telefone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      complaints: {
        Row: {
          arquivada: boolean | null
          conta_id: string
          created_at: string
          id: string
          imagem_url: string | null
          status: string
          texto: string
          updated_at: string
          usuario_id: string
          usuario_telefone: string | null
          vendedor_id: string | null
          vendedor_telefone: string | null
        }
        Insert: {
          arquivada?: boolean | null
          conta_id: string
          created_at?: string
          id?: string
          imagem_url?: string | null
          status?: string
          texto: string
          updated_at?: string
          usuario_id: string
          usuario_telefone?: string | null
          vendedor_id?: string | null
          vendedor_telefone?: string | null
        }
        Update: {
          arquivada?: boolean | null
          conta_id?: string
          created_at?: string
          id?: string
          imagem_url?: string | null
          status?: string
          texto?: string
          updated_at?: string
          usuario_id?: string
          usuario_telefone?: string | null
          vendedor_id?: string | null
          vendedor_telefone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "complaints_conta_id_fkey"
            columns: ["conta_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      help_center_faqs: {
        Row: {
          answer: string
          category: string
          created_at: string
          id: string
          is_active: boolean | null
          keywords: string[] | null
          order_position: number | null
          question: string
          updated_at: string
        }
        Insert: {
          answer: string
          category: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          keywords?: string[] | null
          order_position?: number | null
          question: string
          updated_at?: string
        }
        Update: {
          answer?: string
          category?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          keywords?: string[] | null
          order_position?: number | null
          question?: string
          updated_at?: string
        }
        Relationships: []
      }
      seller_commissions: {
        Row: {
          commission_percentage: number
          created_at: string
          id: string
          seller_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          commission_percentage?: number
          created_at?: string
          id?: string
          seller_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          commission_percentage?: number
          created_at?: string
          id?: string
          seller_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "seller_commissions_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      seller_ratings: {
        Row: {
          account_id: string
          created_at: string
          id: string
          rating: number
          seller_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id: string
          created_at?: string
          id?: string
          rating: number
          seller_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string
          created_at?: string
          id?: string
          rating?: number
          seller_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "seller_ratings_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      seller_requests: {
        Row: {
          admin_observacoes: string | null
          chave_pix: string | null
          cpf_cnpj: string | null
          created_at: string
          data_envio_documentos: string | null
          documento_foto_url: string | null
          endereco_completo: string | null
          id: string
          message: string | null
          nome_completo: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          selfie_documento_url: string | null
          status: string
          telefone: string | null
          termos_aceitos: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_observacoes?: string | null
          chave_pix?: string | null
          cpf_cnpj?: string | null
          created_at?: string
          data_envio_documentos?: string | null
          documento_foto_url?: string | null
          endereco_completo?: string | null
          id?: string
          message?: string | null
          nome_completo?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          selfie_documento_url?: string | null
          status?: string
          telefone?: string | null
          termos_aceitos?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_observacoes?: string | null
          chave_pix?: string | null
          cpf_cnpj?: string | null
          created_at?: string
          data_envio_documentos?: string | null
          documento_foto_url?: string | null
          endereco_completo?: string | null
          id?: string
          message?: string | null
          nome_completo?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          selfie_documento_url?: string | null
          status?: string
          telefone?: string | null
          termos_aceitos?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          active: boolean | null
          created_at: string | null
          id: string
          key: string
          position: number | null
          type: string
          updated_at: string | null
          value: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          key: string
          position?: number | null
          type: string
          updated_at?: string | null
          value: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          key?: string
          position?: number | null
          type?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          whatsapp: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name: string
          whatsapp: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          whatsapp?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          abacatepay_external_reference: string | null
          abacatepay_payment_status: string | null
          abacatepay_pix_id: string | null
          account_id: string | null
          amount: number
          commission_percentage: number | null
          created_at: string
          currency: string
          id: string
          mercado_pago_external_reference: string | null
          mercado_pago_payment_id: string | null
          mercado_pago_payment_method: string | null
          mercado_pago_payment_status: string | null
          qr_code: string | null
          qr_code_base64: string | null
          status: string
          stripe_payment_intent_id: string | null
          stripe_session_id: string
          ticket_url: string | null
          updated_at: string
          user_id: string | null
          webhook_processed: boolean | null
        }
        Insert: {
          abacatepay_external_reference?: string | null
          abacatepay_payment_status?: string | null
          abacatepay_pix_id?: string | null
          account_id?: string | null
          amount: number
          commission_percentage?: number | null
          created_at?: string
          currency?: string
          id?: string
          mercado_pago_external_reference?: string | null
          mercado_pago_payment_id?: string | null
          mercado_pago_payment_method?: string | null
          mercado_pago_payment_status?: string | null
          qr_code?: string | null
          qr_code_base64?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id: string
          ticket_url?: string | null
          updated_at?: string
          user_id?: string | null
          webhook_processed?: boolean | null
        }
        Update: {
          abacatepay_external_reference?: string | null
          abacatepay_payment_status?: string | null
          abacatepay_pix_id?: string | null
          account_id?: string | null
          amount?: number
          commission_percentage?: number | null
          created_at?: string
          currency?: string
          id?: string
          mercado_pago_external_reference?: string | null
          mercado_pago_payment_id?: string | null
          mercado_pago_payment_method?: string | null
          mercado_pago_payment_status?: string | null
          qr_code?: string | null
          qr_code_base64?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string
          ticket_url?: string | null
          updated_at?: string
          user_id?: string | null
          webhook_processed?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          email: string
          id: string
          is_admin: boolean
          is_approved_seller: boolean | null
          name: string
          password: string
          profile_image_url: string | null
          seller_sales_blocked: boolean | null
          telefone: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_admin?: boolean
          is_approved_seller?: boolean | null
          name: string
          password: string
          profile_image_url?: string | null
          seller_sales_blocked?: boolean | null
          telefone?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_admin?: boolean
          is_approved_seller?: boolean | null
          name?: string
          password?: string
          profile_image_url?: string | null
          seller_sales_blocked?: boolean | null
          telefone?: string | null
        }
        Relationships: []
      }
      withdrawal_requests: {
        Row: {
          admin_notes: string | null
          amount: number
          created_at: string
          id: string
          processed_at: string | null
          requested_at: string
          reviewed_at: string | null
          reviewed_by: string | null
          seller_id: string
          status: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          amount: number
          created_at?: string
          id?: string
          processed_at?: string | null
          requested_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          seller_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          amount?: number
          created_at?: string
          id?: string
          processed_at?: string | null
          requested_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          seller_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      authenticate_admin: {
        Args: { admin_email: string; admin_password: string }
        Returns: {
          admin_data: Json
        }[]
      }
      current_user_is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      get_seller_average_rating: {
        Args: { seller_user_id: string }
        Returns: Json
      }
      get_seller_commission: {
        Args: { seller_user_id: string }
        Returns: number
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_system_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      validate_cpf_cnpj: {
        Args: { doc: string }
        Returns: boolean
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
