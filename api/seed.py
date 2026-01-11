import csv
from datetime import datetime
from database import engine, SessionLocal
from models import Base, Category, Product, Sale

Base.metadata.create_all(bind=engine)
db = SessionLocal()

def load_csv():
    with open("categories.csv") as f:
        reader = csv.DictReader(f)
        for row in reader:
            db.add(Category(**row))

    with open("products.csv") as f:
        reader = csv.DictReader(f)
        for row in reader:
            db.add(Product(**row))

    with open("sales.csv") as f:
        reader = csv.DictReader(f)
        for row in reader:
            row["date"] = datetime.strptime(row["date"], "%Y-%m-%d")
            db.add(Sale(**row))

    db.commit()

if __name__ == "__main__":
    load_csv()
