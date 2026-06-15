export interface Product {
  id: string;
  cat: string;
  name: string;
  price: number;
  blurb: string;
  swatch: [string, string];
  stock: number;
  tags: string[];
  featured?: boolean;
}

export interface Category {
  id: string;
  label: string;
  icon: string;
}

export interface CartItem {
  id: string;
  qty: number;
}
