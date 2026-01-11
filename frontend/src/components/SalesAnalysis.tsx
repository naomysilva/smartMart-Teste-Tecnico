import { useState, useMemo } from "react";
import { Card, Typography, Row, Col, Progress, List, DatePicker, Button, Space, Divider } from "antd";
import dayjs from "dayjs";

const { Text, Title } = Typography;
const { RangePicker } = DatePicker;

interface SalesAnalysisProps {
  sales: any[];
  products: any[];
  total: number;
  startDate: string;
  endDate: string;
  setStartDate: (date: string) => void;
  setEndDate: (date: string) => void;
  onFilter: () => void;
}

export function SalesAnalysis({
  sales,
  products,
  total,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  onFilter
}: SalesAnalysisProps) {
  const [expanded, setExpanded] = useState(false);
  const maxItems = 5;

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const analytics = useMemo(() => {
    const salesByMonth: Record<string, number> = {};
    const productTotals: Record<number, number> = {};
    const brandTotals: Record<string, number> = {};

    sales.forEach(sale => {
      const date = new Date(sale.date);
      if (isNaN(date.getTime())) return;

      const monthKey = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
      salesByMonth[monthKey] = (salesByMonth[monthKey] || 0) + sale.total_price;
      productTotals[sale.product_id] = (productTotals[sale.product_id] || 0) + sale.quantity;

      const product = products.find(p => p.id === sale.product_id);
      if (product) {
        brandTotals[product.brand] = (brandTotals[product.brand] || 0) + sale.total_price;
      }
    });

    const monthEntries = Object.entries(salesByMonth).sort((a, b) => b[1] - a[1]);
    const productEntries = Object.entries(productTotals).sort((a, b) => b[1] - a[1]);
    const brandEntries = Object.entries(brandTotals).sort((a, b) => b[1] - a[1]);

    return {
      bestMonth: monthEntries[0],
      bestProduct: productEntries[0],
      bestBrand: brandEntries[0],
      monthlyProfitPercentage: monthEntries.map(([month, value]) => ({
        month,
        profit: total ? (value / total) * 100 : 0,
        raw: value
      }))
    };
  }, [sales, products, total]);

  const visibleSales = expanded ? sales : sales.slice(0, maxItems);

  return (
    <Card
      bordered={false}
      style={{ borderRadius: 24, boxShadow: '0 10px 40px rgba(0,0,0,0.04)', maxWidth: '1152px', margin: '0 auto' }}
    >
      {/* HEADER MINIMALISTA */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <Text style={{ fontSize: 11, color: '#8c8c8c', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 600 }}>
            Painel Analítico
          </Text>
          <Title level={3} style={{ margin: 0, fontWeight: 800 }}>Performance Comercial</Title>
        </div>

        <Space direction="vertical" align="end">
          <Space.Compact>
            <RangePicker
              // Use value em vez de defaultValue
              value={[
                startDate ? dayjs(startDate, "YYYY-MM-DD") : null,
                endDate ? dayjs(endDate, "YYYY-MM-DD") : null
              ]}
              onChange={(dates) => {
                if (dates) {
                  setStartDate(dates[0]?.format("YYYY-MM-DD") || "");
                  setEndDate(dates[1]?.format("YYYY-MM-DD") || "");
                } else {
                  // caso o usuário limpe o RangePicker
                  setStartDate("");
                  setEndDate("");
                }
              }}
              style={{ borderRadius: '12px 0 0 12px', borderRight: 0 }}
            />
            <Button
              type="primary"
              onClick={onFilter}
              style={{ borderRadius: '0 12px 12px 0', background: '#141414', border: 'none', height: 40 }}
            >
              Aplicar
            </Button>
          </Space.Compact>
        </Space>

      </div>

      {/* MÉTRICAS DE DESTAQUE */}
      <Row gutter={[24, 24]} style={{ marginBottom: 40 }}>
        <Col span={8}>
          <div style={{ padding: '20px', background: '#fafafa', borderRadius: 16 }}>
            <Text type="secondary" style={{ fontSize: 10, fontWeight: 700 }}>TOTAL LÍQUIDO</Text>
            <div style={{ margin: '8px 0' }}>
              <span style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-1px' }}>
                R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <Progress percent={100} showInfo={false} strokeColor="#141414" size={2} />
          </div>
        </Col>
        <Col span={8}>
          <div style={{ padding: '20px', background: '#fafafa', borderRadius: 16 }}>
            <Text type="secondary" style={{ fontSize: 10, fontWeight: 700 }}>PRODUTO LÍDER</Text>
            <div style={{ margin: '8px 0' }}>
              <span style={{ fontSize: 18, fontWeight: 700, display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {products.find(p => p.id === Number(analytics.bestProduct?.[0]))?.name || "-"}
              </span>
            </div>
            <Text style={{ fontSize: 12, color: '#8c8c8c' }}>{analytics.bestProduct?.[1] || 0} unidades vendidas</Text>
          </div>
        </Col>
        <Col span={8}>
          <div style={{ padding: '20px', background: '#fafafa', borderRadius: 16 }}>
            <Text type="secondary" style={{ fontSize: 10, fontWeight: 700 }}>MARCA EM DESTAQUE</Text>
            <div style={{ margin: '8px 0' }}>
              <span style={{ fontSize: 18, fontWeight: 700, display: 'block' }}>
                {analytics.bestBrand?.[0] || "-"}
              </span>
            </div>
            <Text style={{ fontSize: 12, color: '#8c8c8c' }}>Maior faturamento por marca</Text>
          </div>
        </Col>
      </Row>

      <Row gutter={48}>
        {/* COLUNA ESQUERDA: DISTRIBUIÇÃO MENSAL */}
        <Col span={10}>
          <Title level={5} style={{ fontSize: 14, marginBottom: 20 }}>Faturamento Mensal</Title>
          <div>
            {analytics.monthlyProfitPercentage.map(m => (
              <div key={m.month} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={{ fontSize: 12, fontWeight: 500 }}>{m.month}</Text>
                  <Text style={{ fontSize: 12, fontWeight: 700 }}>{m.profit.toFixed(1)}%</Text>
                </div>
                <Progress
                  percent={m.profit}
                  showInfo={false}
                  strokeColor={m.profit === Math.max(...analytics.monthlyProfitPercentage.map(x => x.profit)) ? "#141414" : "#e8e8e8"}
                  strokeWidth={6}
                />
              </div>
            ))}
          </div>
        </Col>

        {/* COLUNA DIREITA: TABELA DE VENDAS RECENTES */}
        <Col span={14}>
          <Title level={5} style={{ fontSize: 14, marginBottom: 20 }}>Vendas Consolidadas</Title>
          <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 16, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#fafafa' }}>
                <tr>
                  <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: 11, color: '#bfbfbf', fontWeight: 600 }}>PRODUTO</th>
                  <th style={{ padding: '12px 20px', textAlign: 'center', fontSize: 11, color: '#bfbfbf', fontWeight: 600 }}>QTD</th>
                  <th style={{ padding: '12px 20px', textAlign: 'right', fontSize: 11, color: '#bfbfbf', fontWeight: 600 }}>TOTAL</th>
                </tr>
              </thead>
              <tbody>
                {visibleSales.map(s => (
                  <tr key={s.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                    <td style={{ padding: '14px 20px', fontSize: 13 }}>
                      {products.find(p => p.id === s.product_id)?.name || `ID: ${s.product_id}`}
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'center', fontSize: 13, color: '#8c8c8c' }}>
                      {s.quantity}
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'right', fontSize: 13, fontWeight: 700 }}>
                      R$ {s.total_price.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {sales.length > maxItems && (
              <div style={{ textAlign: 'center', padding: '12px' }}>
                <Button
                  type="link"
                  onClick={() => setExpanded(!expanded)}
                  style={{ color: '#8c8c8c', fontSize: 12, fontWeight: 600 }}
                >
                  {expanded ? "VER MENOS" : `VER TODOS (${sales.length})`}
                </Button>
              </div>
            )}
          </div>
        </Col>
      </Row>
    </Card>
  );
}