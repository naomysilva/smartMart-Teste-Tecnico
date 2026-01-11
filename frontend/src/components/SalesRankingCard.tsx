import { Card, Typography, Row, Col, Statistic, List, Badge, Empty, Space, Tooltip } from "antd";
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from "recharts";

const { Text, Title } = Typography;

interface SalesRankingCardProps {
  title: string;
  sales: any[];
  products: any[];
  topN?: number;
}

function SalesBarChart({ data }: { data: any[] }) {
  if (!data.length) return null;

  return (
    <div style={{ marginTop: 24 }}>
      <Text strong style={{ fontSize: 11, color: "#8c8c8c", textTransform: 'uppercase', letterSpacing: '1px' }}>
        Performance de Volume
      </Text>

      <div style={{ 
        marginTop: 12, 
        padding: "16px", 
        background: "#001529", // Azul escuro/Preto do AntD
        borderRadius: 16, 
        height: 180 
      }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, left: -30, bottom: 0 }}>
            <XAxis
              dataKey="name"
              tick={{ fontSize: 9, fill: "#8c8c8c" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => v.length > 8 ? `${v.substring(0, 8)}.` : v}
            />
            <YAxis tick={{ fontSize: 9, fill: "#8c8c8c" }} axisLine={false} tickLine={false} />
            <RechartsTooltip
              cursor={{ fill: "rgba(255,255,255,0.05)" }}
              contentStyle={{ background: '#141414', borderRadius: 8, border: "none", color: '#fff' }}
              itemStyle={{ color: '#1890ff' }}
            />
            <Bar dataKey="vendas" radius={[4, 4, 0, 0]} barSize={24}>
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={index === 0 ? "#1890ff" : "#003a8c"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function SalesRankingCard({ title, sales, products, topN = 5 }: SalesRankingCardProps) {
  if (!sales.length || !products.length) {
    return (
      <Card title={title} bordered={false} style={{ borderRadius: 20 }}>
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Sem dados" />
      </Card>
    );
  }

  const salesMap: Record<number, number> = {};
  sales.forEach(s => {
    salesMap[s.product_id] = (salesMap[s.product_id] || 0) + s.quantity;
  });

  const rankedProducts = [...products]
    .filter(p => salesMap[p.id] > 0)
    .sort((a, b) => (salesMap[b.id] || 0) - (salesMap[a.id] || 0));

  const mostSold = rankedProducts[0];
  const leastSold = rankedProducts[rankedProducts.length - 1];

  const chartData = rankedProducts.slice(0, 5).map(p => ({
    name: p.name,
    vendas: salesMap[p.id]
  }));

  return (
    <Card 
      title={<Title level={4} style={{ margin: 0, color: '#001529' }}>{title}</Title>}
      bordered={false}
      style={{ 
        borderRadius: 20, 
        boxShadow: '0 8px 30px rgba(0,0,0,0.05)',
        background: '#fff' 
      }}
    >
      <Row gutter={[16, 16]}>
        {/* Card Destaque Azul */}
        <Col span={12}>
          <div style={{ 
            background: '#e6f7ff', 
            padding: '16px', 
            borderRadius: 16, 
            border: '1px solid #91d5ff' 
          }}>
            <Statistic
              title={<Text style={{ fontSize: 10, color: '#0050b3', fontWeight: 700 }}>PICO DE VENDAS</Text>}
              value={salesMap[mostSold?.id] || 0}
              valueStyle={{ color: '#001529', fontSize: 24, fontWeight: 900 }}
              suffix={<span style={{ fontSize: 12 }}>un</span>}
            />
            <Text strong ellipsis style={{ color: '#0050b3', fontSize: 12, display: 'block', marginTop: 4 }}>
              {mostSold?.name}
            </Text>
          </div>
        </Col>

        {/* Card Contraste Preto/Cinza */}
        <Col span={12}>
          <div style={{ 
            background: '#141414', 
            padding: '16px', 
            borderRadius: 16, 
            border: '1px solid #000' 
          }}>
            <Statistic
              title={<Text style={{ fontSize: 10, color: '#8c8c8c', fontWeight: 700 }}>BAIXO VOLUME</Text>}
              value={salesMap[leastSold?.id] || 0}
              valueStyle={{ color: '#fff', fontSize: 24, fontWeight: 900 }}
              suffix={<span style={{ fontSize: 12, color: '#8c8c8c' }}>un</span>}
            />
            <Text strong ellipsis style={{ color: '#8c8c8c', fontSize: 12, display: 'block', marginTop: 4 }}>
              {leastSold?.name}
            </Text>
          </div>
        </Col>

        {/* Ranking Minimalista */}
        <Col span={24}>
          <div style={{ marginTop: 8 }}>
            <Title level={5} style={{ fontSize: 14, marginBottom: 16 }}>Classificação Mensal</Title>
            <List
              size="small"
              dataSource={rankedProducts.slice(0, topN)}
              renderItem={(item, index) => (
                <List.Item style={{ border: 'none', padding: '8px 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <Space size="middle">
                      <div style={{ 
                        width: 22, 
                        height: 22, 
                        borderRadius: 6, 
                        background: index === 0 ? '#1890ff' : '#001529',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 10,
                        fontWeight: 'bold',
                        color: '#fff'
                      }}>
                        {index + 1}
                      </div>
                      <Text style={{ fontSize: 13, color: '#262626', fontWeight: index === 0 ? 600 : 400 }}>{item.name}</Text>
                    </Space>
                    <Text strong style={{ color: index === 0 ? '#1890ff' : '#001529' }}>
                      {salesMap[item.id]} <span style={{ fontWeight: 400, fontSize: 10, color: '#8c8c8c' }}>un</span>
                    </Text>
                  </div>
                </List.Item>
              )}
            />
          </div>
        </Col>

        <Col span={24}>
          <SalesBarChart data={chartData} />
        </Col>
      </Row>
    </Card>
  );
}