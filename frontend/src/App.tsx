import { useState, useRef, useEffect } from "react";
import { Header } from "./components/Header";
import { DashboardCard } from "./components/DashboardCard";
import { ProductForm } from "./components/ProductForm";
import { ProductTable } from "./components/ProductTable";
import { SalesRankingCard } from "./components/SalesRankingCard";
import { useProducts } from "./hooks/useProducts";
import { useSales } from "./hooks/useSales";
import { formatCurrency } from "./utils/format";
import { DollarSign, ShoppingBag, TrendingUp } from "lucide-react";
import { SalesAnalysis } from "./components/SalesAnalysis";
import { generateFullPDF } from "./utils/generatePDF";
import { Button } from "antd";
import { FilePdfOutlined } from "@ant-design/icons";

function App() {
  const { products, fetchProducts } = useProducts();
  const { sales, total, fetchSales } = useSales();

  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [newProduct, setNewProduct] = useState({ name: "", description: "", price: "", brand: "", category_id: "" });

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filteredSales, setFilteredSales] = useState<any[]>([]);

  useEffect(() => {
    fetchProducts();
    fetchSales();
  }, []);

  function handleFilterSales() {
    const filtered = sales.filter(sale => {
      const saleDate = new Date(sale.date);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
      if (start && saleDate < start) return false;
      if (end && saleDate > end) return false;
      return true;
    });
    setFilteredSales(filtered);
  }

  const handleDeleteProduct = (productId: number) => {
    if (!window.confirm("Tem certeza que deseja excluir este produto?")) return;
    fetch(`http://localhost:8000/products/${productId}`, {
      method: "DELETE",
    })
      .then(res => {
        if (!res.ok) throw new Error("Erro ao deletar produto");
        fetchProducts();
        fetchSales();
      })
      .catch(() => {
        alert("Não foi possível excluir o produto.");
      });
  };

  const totalSales = filteredSales.reduce((acc, sale) => acc + sale.total_price, 0);

  const analytics = (() => {
    if (filteredSales.length === 0) return {};
    const productMap: Record<number, number> = {};
    const brandMap: Record<string, number> = {};
    const monthMap: Record<string, number> = {};
    filteredSales.forEach(sale => {
      productMap[sale.product_id] = (productMap[sale.product_id] || 0) + sale.quantity;
      const brand = products.find(p => p.id === sale.product_id)?.brand || "Desconhecida";
      brandMap[brand] = (brandMap[brand] || 0) + sale.quantity;
      const month = new Date(sale.date).toISOString().slice(0, 7);
      monthMap[month] = (monthMap[month] || 0) + sale.total_price;
    });
    const maxKey = (obj: Record<string, number>) =>
      Object.keys(obj).reduce((a, b) => (obj[a] > obj[b] ? a : b), "");
    const minKey = (obj: Record<string, number>) =>
      Object.keys(obj).reduce((a, b) => (obj[a] < obj[b] ? a : b), "");
    const maxProduct = Object.keys(productMap)
      .map(Number)
      .reduce((a, b) => (productMap[a] > productMap[b] ? a : b));
    const minProduct = Object.keys(productMap)
      .map(Number)
      .reduce((a, b) => (productMap[a] < productMap[b] ? a : b));
    const maxBrand = maxKey(brandMap);
    const minBrand = minKey(brandMap);
    const bestMonth = maxKey(monthMap);
    const worstMonth = minKey(monthMap);
    return {
      bestProduct: [maxProduct],
      worstProduct: [minProduct],
      bestBrand: [maxBrand],
      worstBrand: [minBrand],
      bestMonth: [bestMonth],
      worstMonth: [worstMonth],
    };
  })();

  const handleSaveProduct = (product: any) => {
    const method = editingProductId ? "PUT" : "POST";
    const url = editingProductId
      ? `http://localhost:8000/products/${editingProductId}`
      : "http://localhost:8000/products";
    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...product, price: Number(product.price), category_id: Number(product.category_id) })
    }).then(() => {
      setNewProduct({ name: "", description: "", price: "", brand: "", category_id: "" });
      setEditingProductId(null);
      fetchProducts();
      fetchSales();
    });
  };

  const uploadCSV = async (file?: File) => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("http://localhost:8000/products/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      throw new Error("Erro ao importar CSV");
    }



    fetchProducts();
    fetchSales();
  };


  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-12">
      <Header />
      <main className="max-w-6xl mx-auto p-6 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <DashboardCard title="Faturamento Total" value={formatCurrency(total)} icon={<DollarSign />} />
          <DashboardCard title="Vendas Realizadas" value={sales.length} icon={<ShoppingBag />} />
          <DashboardCard title="Itens no Inventário" value={products.length} icon={<TrendingUp />} bgColor="bg-white" textColor="text-slate-900" />
        </div>
        <div className="col-span-1 md:col-span-2 lg:col-span-4">
          <SalesRankingCard title="Ranking de Vendas" sales={sales} products={products} topN={5} />
        </div>
        <SalesAnalysis
          sales={filteredSales}
          products={products}
          total={totalSales}
          startDate={startDate}
          endDate={endDate}
          setStartDate={setStartDate}
          setEndDate={setEndDate}
          onFilter={handleFilterSales}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
          <Button
            type="primary"
            icon={<FilePdfOutlined />}
            size="large"
            onClick={() => generateFullPDF(products, filteredSales, totalSales, analytics)}
            style={{
              background: '#4F39F6',
              borderColor: '#4F39F6',
              borderRadius: '12px',
              fontWeight: 600,
              height: '45px',
              padding: '0 24px',
              display: 'flex',
              alignItems: 'center',
              boxShadow: '0 4px 14px 0 rgba(0,21,41,0.2)'
            }}
          >
            Gerar Relatório PDF
          </Button>
        </div>
        <div id="product-form-section" className="scroll-mt-24">
          <ProductForm
            product={editingProductId ? products.find(p => p.id === editingProductId) : undefined}
            onSave={handleSaveProduct}
            onCancel={() => setEditingProductId(null)}
            onUploadCSV={uploadCSV}
          />
        </div>
        <ProductTable
          products={products}
          onEdit={(p) => {
            setEditingProductId(p.id);
            setNewProduct(p);
            requestAnimationFrame(() => {
              document
                .getElementById("product-form-section")
                ?.scrollIntoView({ behavior: "smooth" });
            });
          }}
          onDelete={handleDeleteProduct}
        />
      </main>
    </div>
  );
}

export default App;
