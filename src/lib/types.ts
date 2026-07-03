export type LocationType = "table" | "lieu";

export interface Location {
  id: string;
  slug: string;
  name: string;
  type: LocationType;
  sort_order: number;
  created_at: string;
}

export interface Photo {
  id: string;
  location_id: string;
  storage_path: string;
  caption: string | null;
  author_name: string | null;
  created_at: string;
}

export interface PhotoComment {
  id: string;
  photo_id: string;
  author_name: string;
  text: string;
  created_at: string;
}

export interface GuestbookMessage {
  id: string;
  author_name: string;
  text: string;
  created_at: string;
}
