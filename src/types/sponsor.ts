export interface Sponsor {
  id: string;
  name: string;
  tagline: string | null;
  logo_url: string | null;
  link_url: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
}
