import { useState, useEffect } from "react";
import {
  Form,
  Input,
  InputNumber,
  Button,
  Card,
  Typography,
  Row,
  Col,
  Upload,
  message,
  Divider,
  Space,
} from "antd";
import {
  SaveOutlined,
  CloseOutlined,
  ShoppingOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import axios from "axios";

const { Text, Title, Paragraph } = Typography;
const { TextArea } = Input;
const { Dragger } = Upload;

/* =====================
   PROPS
===================== */
interface ProductFormProps {
  product?: any;
  onSave: (product: any) => void;
  onCancel: () => void;
  onUploadCSV?: (file: File) => void | Promise<void>;
}

/* =====================
   COMPONENT
===================== */
export function ProductForm({
  product,
  onSave,
  onCancel,
  onUploadCSV,
}: ProductFormProps) {
  const [form] = Form.useForm();
  const [uploading, setUploading] = useState(false);

  /* =====================
     SYNC FORM
  ===================== */
  useEffect(() => {
    if (product) {
      form.setFieldsValue(product);
    } else {
      form.resetFields();
    }
  }, [product, form]);

  /* =====================
     SAVE PRODUCT
  ===================== */
  const onFinish = async (values: any) => {
    try {
      const res = await axios.post(
        "http://localhost:8000/products",
        values
      );

      message.success("Produto salvo com sucesso!");
      form.resetFields();
      onSave(res.data);
    } catch (err) {
      console.error(err);
      message.error("Erro ao salvar produto");
    }
  };

  /* =====================
     CSV UPLOAD
  ===================== */
  const handleCSVUpload = async (file: File) => {
    setUploading(true);

    try {
      if (onUploadCSV) {
        // função vinda do componente pai
        await onUploadCSV(file);
      } else {
        // fallback: envia direto para o backend
        const formData = new FormData();
        formData.append("file", file);

        await axios.post(
          "http://localhost:8000/products/upload",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
      }

      message.success("Produtos importados com sucesso!");
    } catch (err) {
      console.error(err);
      message.error("Erro ao importar CSV");
    } finally {
      setUploading(false);
    }
  };

  /* =====================
     RENDER
  ===================== */
  return (
    <div style={{ maxWidth: 1152, margin: "0 auto", padding: "0 24px" }}>
      <Row gutter={[24, 24]}>
        {/* FORMULÁRIO */}
        <Col xs={24} lg={16}>
          <Card
            bordered={false}
            style={{
              borderRadius: 24,
              boxShadow: "0 10px 40px rgba(0,0,0,0.04)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 24,
              }}
            >
              <Space>
                <div
                  style={{
                    background: "#001529",
                    padding: 8,
                    borderRadius: 10,
                  }}
                >
                  <ShoppingOutlined style={{ color: "#fff" }} />
                </div>
                <Title level={4} style={{ margin: 0 }}>
                  {product ? "Editar Produto" : "Novo Cadastro"}
                </Title>
              </Space>

              {product && (
                <Button
                  danger
                  type="text"
                  icon={<CloseOutlined />}
                  onClick={onCancel}
                >
                  CANCELAR
                </Button>
              )}
            </div>

            <Form form={form} layout="vertical" onFinish={onFinish}>
              <Row gutter={16}>
                <Col span={16}>
                  <Form.Item
                    label={<Text strong>NOME</Text>}
                    name="name"
                    rules={[{ required: true, message: "Informe o nome" }]}
                  >
                    <Input />
                  </Form.Item>
                </Col>

                <Col span={8}>
                  <Form.Item label={<Text strong>MARCA</Text>} name="brand">
                    <Input />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label={<Text strong>DESCRIÇÃO</Text>}
                name="description"
              >
                <TextArea rows={3} />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label={<Text strong>PREÇO</Text>}
                    name="price"
                    rules={[{ required: true }]}
                  >
                    <InputNumber style={{ width: "100%" }} />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    label={<Text strong>CATEGORIA</Text>}
                    name="category_id"
                  >
                    <InputNumber style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
              </Row>

              <Button
                type="primary"
                htmlType="submit"
                block
                size="large"
                icon={<SaveOutlined />}
                style={{
                  background: "#001529",
                  border: "none",
                  marginTop: 12,
                }}
              >
                SALVAR
              </Button>
            </Form>
          </Card>
        </Col>

        {/* IMPORTAÇÃO CSV */}
        <Col xs={24} lg={8}>
          <Card bordered={false} style={{ borderRadius: 24 }}>
            <Title level={5}>Importação CSV</Title>
            <Paragraph type="secondary">
              Arraste ou selecione um arquivo CSV
            </Paragraph>

            <Dragger
              accept=".csv"
              showUploadList={false}
              disabled={uploading}
              customRequest={async ({ file, onSuccess, onError }) => {
                try {
                  const realFile =
                    (file as any).originFileObj || (file as File);
                  await handleCSVUpload(realFile);
                  onSuccess?.("ok");
                } catch (err) {
                  onError?.(err as any);
                }
              }}
            >
              <UploadOutlined style={{ fontSize: 24 }} />
              <p>Clique ou arraste o CSV</p>
            </Dragger>

            <Divider>OU</Divider>

            <Button
              block
              icon={<UploadOutlined />}
              onClick={() =>
                document
                  .querySelector<HTMLInputElement>('input[type="file"]')
                  ?.click()
              }
            >
              Procurar arquivo
            </Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
