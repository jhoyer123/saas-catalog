export type InputType = "text" | "color" | "image" | "number";

export interface OptionTypeRow {
  id: string;
  name: string;
  input_type: InputType;
  is_visual_default: boolean;
  is_default_on_create: boolean;
  sort_order: number;
  created_at: string;
  value_count: number;
}

export interface OptionValue {
  id: string;
  option_type_id: string;
  value: string;
  color_hexes: string[] | null;
  image_url: string | null;
  numeric_value: number | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface OptionValueRow {
  id: string;
  option_type_id: string;
  value: string;
  unit: string | null;
  color_hexes: string[] | null;
  image_url: string | null;
  numeric_value: number | null;
  created_at: string;
  updated_at: string;
}
