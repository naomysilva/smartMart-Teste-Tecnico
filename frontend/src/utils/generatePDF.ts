import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

async function generateChartImage(sales: any[]) {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 250;
    const ctx = canvas.getContext('2d');

    if (!ctx) return "";

    const monthlyData: Record<string, number> = {};
    sales.forEach(sale => {
        const month = new Date(sale.date).toLocaleDateString('pt-BR', { month: 'short' });
        monthlyData[month] = (monthlyData[month] || 0) + sale.total_price;
    });

    // Plugin para garantir que o fundo do gráfico seja BRANCO (evita gráfico transparente/em branco)
    const backgroundColorPlugin = {
        id: 'customCanvasBackgroundColor',
        beforeDraw: (chart: any) => {
            const { ctx } = chart;
            ctx.save();
            ctx.globalCompositeOperation = 'destination-over';
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, chart.width, chart.height);
            ctx.restore();
        }
    };

    const chartInstance = new Chart(ctx as any, {
        type: 'bar',
        data: {
            labels: Object.keys(monthlyData),
            datasets: [{
                label: 'Faturamento por Mês (R$)',
                data: Object.values(monthlyData),
                backgroundColor: 'rgba(79, 70, 229, 0.8)',
                borderColor: 'rgb(79, 70, 229)',
                borderWidth: 1
            }]
        },
        options: {
            devicePixelRatio: 2,
            animation: false, // Desativar animação é essencial para PDF
            responsive: false,
            scales: {
                y: { beginAtZero: true }
            }
        },
        plugins: [backgroundColorPlugin]
    });

    // Extraímos como JPEG para evitar o erro "wrong PNG signature"
    const imageBase64 = canvas.toDataURL('image/jpeg', 1.0);

    // Limpar a instância para liberar memória
    chartInstance.destroy();

    return imageBase64;
}

export async function generateFullPDF(
    products: any[],
    sales: any[],
    totalSales: number,
    analytics: any
) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const dateStr = new Date().toLocaleDateString('pt-BR');

    const PRIMARY_COLOR: [number, number, number] = [30, 41, 59];
    const ACCENT_COLOR: [number, number, number] = [79, 70, 229];

    // 1. CABEÇALHO
    doc.setFillColor(...PRIMARY_COLOR);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text("Relatório de Performance", 14, 25);
    doc.setFontSize(10);
    doc.text(`Emissão: ${dateStr}`, pageWidth - 14, 25, { align: 'right' });

    // 2. KPIs
    doc.setTextColor(...PRIMARY_COLOR);
    doc.setFontSize(13);
    doc.text("Resumo Executivo", 14, 52);

    const kpiData = [
        ["Total em Vendas:", `R$ ${totalSales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`],
        ["Produto Destaque:", products.find(p => p.id === Number(analytics.bestProduct?.[0]))?.name || "-"],
        ["Marca Líder:", analytics.bestBrand?.[0] || "-"]
    ];

    doc.setFontSize(9);
    kpiData.forEach((kpi, index) => {
        doc.setFont("helvetica", "bold");
        doc.text(kpi[0], 14, 62 + (index * 6));
        doc.setFont("helvetica", "normal");
        doc.text(kpi[1], 50, 62 + (index * 6));
    });

    // 3. GRÁFICO (Com tratamento de erro)
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("Evolução de Faturamento", 14, 88);

    try {
        const chartImage = await generateChartImage(sales);
        if (chartImage) {
            // Usamos 'JPEG' aqui para casar com o toDataURL
            doc.addImage(chartImage, 'JPEG', 14, 92, 180, 60, undefined, 'FAST');
        }
    } catch (e) {
        console.error("Erro ao inserir gráfico", e);
        doc.setFontSize(10);
        doc.text("Erro ao carregar gráfico", 14, 100);
    }

    // 4. TABELA DE VENDAS
    doc.setFontSize(13);
    doc.text("Detalhamento de Vendas", 14, 165);

    const salesTableData = sales.map(sale => [
        products.find(p => p.id === sale.product_id)?.name || `ID: ${sale.product_id}`,
        sale.quantity.toString(),
        `R$ ${sale.total_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
    ]);

    autoTable(doc, {
        head: [["Produto", "Qtd", "Valor Total"]],
        body: salesTableData,
        startY: 170,
        theme: "striped",
        headStyles: { fillColor: ACCENT_COLOR, fontSize: 10 },
        styles: { fontSize: 9 },
        margin: { bottom: 25 }
    });

    // 5. TABELA DE INVENTÁRIO
    const finalYVendas = (doc as any).lastAutoTable.finalY || 200;
    let currentY = finalYVendas + 12;

    if (currentY > 250) {
        doc.addPage();
        currentY = 20;
    }

    doc.setFontSize(13);
    doc.setTextColor(...PRIMARY_COLOR);
    doc.text("Inventário de Produtos", 14, currentY);

    const productTable = products.map(p => [
        p.name,
        p.brand,
        `R$ ${p.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        p.category_id.toString()
    ]);

    autoTable(doc, {
        head: [["Nome do Produto", "Marca", "Preço", "Cat."]],
        body: productTable,
        startY: currentY + 4,
        theme: "grid",
        headStyles: { fillColor: PRIMARY_COLOR, fontSize: 10 },
        styles: { fontSize: 9 },
        margin: { bottom: 25 }
    });


    const totalPages = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Página ${i} de ${totalPages}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
    }

    doc.save(`relatorio_completo.pdf`);
}