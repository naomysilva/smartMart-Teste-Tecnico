import type { Sale } from "../types";

export const formatCurrency = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const sumTotalSales = (sales: Sale[]) =>
  sales.reduce((acc, s) => acc + s.total_price, 0);
