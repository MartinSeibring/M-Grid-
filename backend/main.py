from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import Optional
import models
import crud
import schemas
from database import engine, get_db

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="M-Grid API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/aktivitaeten", response_model=list[schemas.AktivitaetOut])
def list_aktivitaeten(typ: Optional[str] = None, status: Optional[str] = None, db: Session = Depends(get_db)):
    return crud.get_aktivitaeten(db, typ=typ, status=status)


@app.post("/api/aktivitaeten", response_model=schemas.AktivitaetOut, status_code=201)
def create_aktivitaet(data: schemas.AktivitaetCreate, db: Session = Depends(get_db)):
    return crud.create_aktivitaet(db, data)


@app.get("/api/aktivitaeten/{aktivitaet_id}", response_model=schemas.AktivitaetOut)
def get_aktivitaet(aktivitaet_id: str, db: Session = Depends(get_db)):
    obj = crud.get_aktivitaet(db, aktivitaet_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Nicht gefunden")
    return obj


@app.put("/api/aktivitaeten/{aktivitaet_id}", response_model=schemas.AktivitaetOut)
def update_aktivitaet(aktivitaet_id: str, data: schemas.AktivitaetUpdate, db: Session = Depends(get_db)):
    obj = crud.update_aktivitaet(db, aktivitaet_id, data)
    if not obj:
        raise HTTPException(status_code=404, detail="Nicht gefunden")
    return obj


@app.delete("/api/aktivitaeten/{aktivitaet_id}")
def delete_aktivitaet(aktivitaet_id: str, db: Session = Depends(get_db)):
    obj = crud.delete_aktivitaet(db, aktivitaet_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Nicht gefunden")
    return {"ok": True}


@app.get("/api/abhaengigkeiten", response_model=list[schemas.AbhaengigkeitOut])
def list_abhaengigkeiten(db: Session = Depends(get_db)):
    items = crud.get_abhaengigkeiten(db)
    result = []
    for item in items:
        result.append(schemas.AbhaengigkeitOut(
            id=item.id,
            quelle_id=item.quelle_id,
            ziel_id=item.ziel_id,
            typ=item.typ,
            notiz=item.notiz,
            quelle_name=item.quelle.name if item.quelle else None,
            ziel_name=item.ziel.name if item.ziel else None,
        ))
    return result


@app.post("/api/abhaengigkeiten", response_model=schemas.AbhaengigkeitOut, status_code=201)
def create_abhaengigkeit(data: schemas.AbhaengigkeitCreate, db: Session = Depends(get_db)):
    obj = crud.create_abhaengigkeit(db, data)
    return schemas.AbhaengigkeitOut(
        id=obj.id,
        quelle_id=obj.quelle_id,
        ziel_id=obj.ziel_id,
        typ=obj.typ,
        notiz=obj.notiz,
        quelle_name=obj.quelle.name if obj.quelle else None,
        ziel_name=obj.ziel.name if obj.ziel else None,
    )


@app.delete("/api/abhaengigkeiten/{abhaengigkeit_id}")
def delete_abhaengigkeit(abhaengigkeit_id: str, db: Session = Depends(get_db)):
    obj = crud.delete_abhaengigkeit(db, abhaengigkeit_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Nicht gefunden")
    return {"ok": True}


@app.get("/api/analytics/summary", response_model=schemas.AnalyticsSummary)
def analytics_summary(db: Session = Depends(get_db)):
    return crud.get_analytics_summary(db)
