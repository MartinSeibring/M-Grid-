from datetime import date
from sqlalchemy.orm import Session
from models import Aktivitaet, Abhaengigkeit, StatusEnum, Netztrafostation, StationsStatusEnum
from schemas import AktivitaetCreate, AktivitaetUpdate, AbhaengigkeitCreate, NetztrafoCreate, NetztrafoUpdate


def get_aktivitaeten(db: Session, typ: str = None, status: str = None):
    q = db.query(Aktivitaet)
    if typ:
        q = q.filter(Aktivitaet.typ == typ)
    if status:
        q = q.filter(Aktivitaet.status == status)
    return q.order_by(Aktivitaet.created_at.desc()).all()


def get_aktivitaet(db: Session, aktivitaet_id: str):
    return db.query(Aktivitaet).filter(Aktivitaet.id == aktivitaet_id).first()


def create_aktivitaet(db: Session, data: AktivitaetCreate):
    obj = Aktivitaet(**data.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def update_aktivitaet(db: Session, aktivitaet_id: str, data: AktivitaetUpdate):
    obj = get_aktivitaet(db, aktivitaet_id)
    if not obj:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(obj, field, value)
    db.commit()
    db.refresh(obj)
    return obj


def delete_aktivitaet(db: Session, aktivitaet_id: str):
    obj = get_aktivitaet(db, aktivitaet_id)
    if obj:
        db.delete(obj)
        db.commit()
    return obj


def get_abhaengigkeiten(db: Session):
    return db.query(Abhaengigkeit).all()


def create_abhaengigkeit(db: Session, data: AbhaengigkeitCreate):
    obj = Abhaengigkeit(**data.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def delete_abhaengigkeit(db: Session, abhaengigkeit_id: str):
    obj = db.query(Abhaengigkeit).filter(Abhaengigkeit.id == abhaengigkeit_id).first()
    if obj:
        db.delete(obj)
        db.commit()
    return obj


def get_analytics_summary(db: Session):
    alle = db.query(Aktivitaet).all()
    heute = date.today()

    nach_status = {}
    nach_typ = {}
    in_verzug = 0
    gesamt_fortschritt = 0

    for a in alle:
        nach_status[a.status.value] = nach_status.get(a.status.value, 0) + 1
        nach_typ[a.typ.value] = nach_typ.get(a.typ.value, 0) + 1
        gesamt_fortschritt += a.fortschritt or 0
        if (
            a.status not in (StatusEnum.abgeschlossen, StatusEnum.pausiert)
            and a.end_geplant
            and a.end_geplant < heute
            and (a.fortschritt or 0) < 100
        ):
            in_verzug += 1

    return {
        "gesamt": len(alle),
        "nach_status": nach_status,
        "nach_typ": nach_typ,
        "in_verzug": in_verzug,
        "durchschnitt_fortschritt": round(gesamt_fortschritt / len(alle), 1) if alle else 0.0,
    }


# ── Netztrafostation ──────────────────────────────────────────────────────────

def get_stationen(db: Session, status: str = None):
    q = db.query(Netztrafostation)
    if status:
        q = q.filter(Netztrafostation.status == status)
    return q.order_by(Netztrafostation.name).all()


def get_station(db: Session, station_id: str):
    return db.query(Netztrafostation).filter(Netztrafostation.id == station_id).first()


def create_station(db: Session, data: NetztrafoCreate):
    obj = Netztrafostation(**data.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def update_station(db: Session, station_id: str, data: NetztrafoUpdate):
    obj = get_station(db, station_id)
    if not obj:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(obj, field, value)
    db.commit()
    db.refresh(obj)
    return obj


def delete_station(db: Session, station_id: str):
    obj = get_station(db, station_id)
    if obj:
        db.delete(obj)
        db.commit()
    return obj


def get_stationen_summary(db: Session):
    alle = db.query(Netztrafostation).all()
    counts = {s.value: 0 for s in StationsStatusEnum}
    for s in alle:
        counts[s.status.value] += 1
    gesamt = len(alle)
    return {
        "gesamt": gesamt,
        "nicht_ausgestattet": counts["nicht_ausgestattet"],
        "ausgestattet": counts["ausgestattet"],
        "aktiv": counts["aktiv"],
        "quote_aktiv": round(counts["aktiv"] / gesamt * 100, 1) if gesamt else 0.0,
    }
