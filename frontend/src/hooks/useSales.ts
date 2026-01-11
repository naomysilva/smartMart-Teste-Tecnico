import { useState } from "react";

export function useSales() {
  const [sales, setSales] = useState<any[]>([]);
  const [total, setTotal] = useState(0);

  const fetchSales = async (start?: string, end?: string) => {
    let url = "http://localhost:8000/sales";
    if (start && end) url += `?start=${start}&end=${end}`;

    const res = await fetch(url);
    const data = await res.json();
    setSales(data);

    const sum = data.reduce((acc: number, s: any) => acc + s.total_price, 0);
    setTotal(sum);
  };

  return { sales, total, fetchSales };
}
