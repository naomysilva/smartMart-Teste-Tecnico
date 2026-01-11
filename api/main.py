from http.client import HTTPException
from fastapi import FastAPI, Depends, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import date
import csv
import io

from database import SessionLocal
from models import Product, Sale

# =====================
# APP
# =====================
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # didático
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =====================
# DATABASE DEPENDENCY
# =====================
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# =====================
# SCHEMAS (Pydantic)
# =====================
class ProductCreate(BaseModel):
    name: str
    description: str
    price: float
    brand: str
    category_id: int


class SaleCreate(BaseModel):
    product_id: int
    quantity: int
    total_price: float
    date: date

# =====================
# PRODUCTS
# =====================
@app.get("/products")
def list_products(db: Session = Depends(get_db)):
    return db.query(Product).all()


@app.post("/products")
def create_product(product: ProductCreate, db: Session = Depends(get_db)):
    p = Product(**product.dict())
    db.add(p)
    db.commit()
    db.refresh(p)
    return p



@app.post("/products/upload")
async def upload_products(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Arquivo inválido")

    content = await file.read()
    decoded = content.decode("utf-8")

    reader = csv.DictReader(io.StringIO(decoded))

    required_fields = {"name", "brand", "price", "category_id", "description"}
    created_products = []

    for i, row in enumerate(reader, start=1):
        if not required_fields.issubset(row.keys()):
            raise HTTPException(
                status_code=400,
                detail=f"CSV inválido. Campos obrigatórios: {required_fields}"
            )

        try:
            product = Product(
                name=row["name"].strip(),
                brand=row["brand"].strip(),
                description=row.get("description", "").strip(),
                price=float(row["price"]),
                category_id=int(row["category_id"])
            )

            db.add(product)
            created_products.append(product)

        except ValueError:
            raise HTTPException(
                status_code=400,
                detail=f"Erro na linha {i}: valores inválidos"
            )

    db.commit()

    for product in created_products:
        db.refresh(product)

    return created_products

# =====================
# SALES
# =====================
@app.get("/sales")
def list_sales(
    start: str | None = None,
    end: str | None = None,
    db: Session = Depends(get_db)
):
    query = db.query(Sale)

    if start:
        query = query.filter(Sale.date >= start)
    if end:
        query = query.filter(Sale.date <= end)

    return query.all()


@app.post("/sales")
def create_sale(sale: SaleCreate, db: Session = Depends(get_db)):
    s = Sale(**sale.dict())
    db.add(s)
    db.commit()
    db.refresh(s)
    return s


@app.get("/sales/total")
def total_sales(db: Session = Depends(get_db)):
    total = sum(s.total_price for s in db.query(Sale).all())
    return {"total": total}

@app.put("/products/{product_id}")
def update_product(product_id: int, product: ProductCreate, db: Session = Depends(get_db)):
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    
    for key, value in product.dict().items():
        setattr(db_product, key, value)
    
    db.commit()
    db.refresh(db_product)
    return db_product

@app.delete("/products/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    
    db.delete(db_product)
    db.commit()
    return {"message": "Produto deletado com sucesso"}