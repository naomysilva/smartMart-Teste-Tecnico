export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  brand: string;
  category_id: number;
}

export interface Sale {
  id: number;
  product_id: number;
  quantity: number;
  total_price: number;
  date: string;
}
