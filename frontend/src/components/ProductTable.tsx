import { useState } from "react";
import { Table, Input, Select, Button, Tag, Space, Card, Typography, Tooltip, Popconfirm, Row, Col } from "antd";
import { 
  SearchOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  FilterOutlined,
  InboxOutlined 
} from "@ant-design/icons";

const { Text, Title } = Typography;

interface ProductTableProps {
  products: any[];
  onEdit: (product: any) => void;
  onDelete: (productId: number) => void;
}

export function ProductTable({ products, onEdit, onDelete }: ProductTableProps) {
  const [search, setSearch] = useState("");
  const [brandFilter, setBrandFilter] = useState<string | null>(null);

  const brands = Array.from(new Set(products.map(p => p.brand)))
    .filter(Boolean)
    .map(b => ({ label: b, value: b }));

  const filteredData = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                         p.brand.toLowerCase().includes(search.toLowerCase());
    const matchesBrand = brandFilter ? p.brand === brandFilter : true;
    return matchesSearch && matchesBrand;
  });

  const columns = [
    {
      title: 'PRODUTO',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: any, b: any) => a.name.localeCompare(b.name),
      render: (text: string, record: any) => (
        <Space direction="vertical" size={0}>
          <Text strong style={{ fontSize: 14, color: '#001529' }}>{text}</Text>
          <Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {record.brand}
          </Text>
        </Space>
      ),
    },
    {
      title: 'VALOR UNITÁRIO',
      dataIndex: 'price',
      key: 'price',
      align: 'right' as const,
      sorter: (a: any, b: any) => a.price - b.price,
      render: (price: number) => (
        <Text style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: '#001529' }}>
          R$ {price.toFixed(2)}
        </Text>
      ),
    },
    {
      title: 'AÇÕES',
      key: 'actions',
      align: 'center' as const,
      width: 120,
      render: (_: any, record: any) => (
        <Space size="small">
          <Tooltip title="Editar">
            <Button 
              type="text" 
              icon={<EditOutlined style={{ color: '#1890ff' }} />} 
              onClick={() => onEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Excluir produto?"
            description="Esta ação não pode ser desfeita."
            onConfirm={() => onDelete(record.id)}
            okText="Sim"
            cancelText="Não"
            okButtonProps={{ danger: true, size: 'small' }}
            cancelButtonProps={{ size: 'small' }}
          >
            <Tooltip title="Excluir">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card 
      bordered={false}
      style={{ 
        borderRadius: 24, 
        boxShadow: '0 10px 40px rgba(0,0,0,0.04)',
        maxWidth: '1152px',
        margin: '24px auto'
      }}
    >
      {/* HEADER DA TABELA */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
        <div>
          <Title level={4} style={{ margin: 0, fontWeight: 800 }}>Inventário</Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Gerencie seus produtos e preços
          </Text>
        </div>
        <Tag color="#001529" style={{ borderRadius: 6, margin: 0 }}>
          {filteredData.length} Itens
        </Tag>
      </div>

      {/* FILTROS */}
      <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
        <Col xs={24} md={16}>
          <Input
            placeholder="Pesquisar por nome ou marca..."
            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ borderRadius: 12, height: 42 }}
            allowClear
          />
        </Col>
        <Col xs={24} md={8}>
          <Select
            placeholder="Filtrar por Marca"
            suffixIcon={<FilterOutlined />}
            options={brands}
            onChange={value => setBrandFilter(value)}
            allowClear
            style={{ width: '100%', borderRadius: 12, height: 42 }}
            dropdownStyle={{ borderRadius: 12 }}
          />
        </Col>
      </Row>

      <Table 
        columns={columns} 
        dataSource={filteredData}
        rowKey="id"
        pagination={{
          pageSize: 7,
          showSizeChanger: false,
          position: ['bottomCenter'],
          itemRender: (page, type, originalElement) => {
            if (type === 'prev') return <Text style={{ fontSize: 12 }}>Anterior</Text>;
            if (type === 'next') return <Text style={{ fontSize: 12 }}>Próximo</Text>;
            return originalElement;
          }
        }}
        locale={{
          emptyText: (
            <div style={{ padding: '40px 0' }}>
              <InboxOutlined style={{ fontSize: 40, color: '#f0f0f0' }} />
              <p style={{ color: '#bfbfbf', marginTop: 8 }}>Nenhum item encontrado</p>
            </div>
          )
        }}
        style={{ 
          background: '#fff',
        }}
        rowClassName="custom-row"
      />

      <style>{`
        .ant-table-thead > tr > th {
          background: #fafafa !important;
          color: #8c8c8c !important;
          font-size: 11px !important;
          font-weight: 700 !important;
          letter-spacing: 1px !important;
          border-bottom: 1px solid #f0f0f0 !important;
        }
        .ant-table-row {
          transition: all 0.3s;
        }
        .ant-table-row:hover {
          background-color: #f6faff !important;
        }
        .ant-pagination-item-active {
          border-color: #001529 !important;
          background: #001529 !important;
        }
        .ant-pagination-item-active a {
          color: #fff !important;
        }
      `}</style>
    </Card>
  );
}