
export interface TikTokAccount {
  id: string;
  nome: string;
  seguidores: number;
  clientes?: number; // For Shopify stores
  nicho: string;
  nicho_customizado?: string;
  pais: string;
  login: string;
  senha: string;
  preco: number;
  status: 'disponivel_venda' | 'em_producao' | 'vendido';
  comprada_por?: string;
  vendedor_id?: string; // ID do vendedor que cadastrou a conta
  plataforma: 'TikTok' | 'Kwai' | 'YouTube' | 'Instagram' | 'Facebook' | 'Shopify';
  tiktok_shop: 'Sim' | 'Não';
  monetizada?: 'Sim' | 'Não';
  engajamento: 'Alto' | 'Médio' | 'Baixo';
  created_at?: string;
  profile_image_url?: string; // Novo campo para foto de perfil
  account_screenshot_url?: string; // Screenshot da conta
  // Shopify specific fields
  descricao_loja?: string;
  vendas_mensais?: string;
  produtos_cadastrados?: number;
  trafego_mensal?: string;
  integracoes_ativas?: string;
  dominio_incluso?: boolean;
  loja_pronta?: boolean;
}

export interface User {
  id: string;
  email: string;
  data_criacao: string;
}

export interface Purchase {
  id: string;
  usuario_id: string;
  conta_id: string;
  data_compra: string;
  conta?: TikTokAccount;
}

export interface FilterOptions {
  seguidores: string;
  nicho: string;
  pais: string;
  plataforma: string;
}

export type NichoType = 'Moda' | 'Humor' | 'Pets' | 'Fitness' | 'Beleza' | 'Música' | 'Viagem' | 'Comida' | 'Gaming' | 'Educação' | 'Lifestyle' | 'Outros';

export type SeguidoresRange = '0-10k' | '10k-50k' | '50k+' | 'todos';

export type PlataformaType = 'TikTok' | 'Kwai' | 'YouTube' | 'Instagram' | 'Facebook' | 'Shopify' | 'todos';

export type PaisType = 'Brasil' | 'Estados Unidos' | 'Alemanha' | 'Reino Unido' | 'todos';

export type AccountStatusType = 'disponivel_venda' | 'em_producao' | 'vendido';

export interface Banner {
  id: string;
  title: string;
  type: 'desktop' | 'mobile' | 'dashboard';
  image_url: string;
  is_active: boolean;
  order_position: number;
  link_url?: string;
  created_at?: string;
  updated_at?: string;
}

export type BannerType = 'desktop' | 'mobile' | 'dashboard';

export interface SimpleBanner {
  id: string;
  type: 'desktop' | 'mobile' | 'dashboard';
  imageData: string; // base64
  linkUrl?: string;
  createdAt: string;
  isActive: boolean;
}

export interface Seller {
  id: string;
  name: string;
  rating: number; // 1-5 stars
  total_sales: number;
  member_since: string;
}

export interface Complaint {
  id: string;
  usuario_id: string;
  conta_id: string;
  vendedor_id?: string;
  texto: string;
  imagem_url?: string;
  usuario_telefone?: string;
  vendedor_telefone?: string;
  status: 'pendente' | 'em_analise' | 'resolvida' | 'rejeitada';
  arquivada?: boolean;
  created_at: string;
  updated_at?: string;
  data_compra?: string; // Data da compra da conta
  // Campos relacionados para exibição
  usuario_nome?: string;
  usuario_email?: string;
  conta_nome?: string;
  conta_login?: string;
  conta_senha?: string;
  vendedor_nome?: string;
  vendedor_email?: string;
}
