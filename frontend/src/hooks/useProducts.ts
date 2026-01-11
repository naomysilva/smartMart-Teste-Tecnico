import { useState, useEffect } from "react";

export function useProducts() {
  const [products, setProducts] = useState<any[]>([]);

  const fetchProducts = async () => {
    const res = await fetch("http://localhost:8000/products");
    const data = await res.json();
    setProducts(data);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return { products, setProducts, fetchProducts };
}
