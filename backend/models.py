import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Date, DateTime, Text, JSON, Enum, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from database import Base
import enum


class TypEnum(str, enum.Enum):
    projekt = "projekt"
    massnahme = "massnahme"
    linientaetigkeit = "linientaetigkeit"


class StatusEnum(str, enum.Enum):
    initiierung = "initiierung"
    planung = "planung"
    umsetzung = "umsetzung"
    abgeschlossen = "abgeschlossen"
    pausiert = "pausiert"


class PrioritaetEnum(str, enum.Enum):
    hoch = "hoch"
    mittel = "mittel"
    niedrig = "niedrig"


class AbhaengigkeitTypEnum(str, enum.Enum):
    blockiert = "blockiert"
    beeinflusst = "beeinflusst"
    benoetigt = "benoetigt"


class Aktivitaet(Base):
    __tablename__ = "aktivitaeten"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    typ = Column(Enum(TypEnum), nullable=False)
    status = Column(Enum(StatusEnum), nullable=False, default=StatusEnum.initiierung)
    start_geplant = Column(Date, nullable=True)
    end_geplant = Column(Date, nullable=True)
    start_aktuell = Column(Date, nullable=True)
    end_aktuell = Column(Date, nullable=True)
    fortschritt = Column(Integer, default=0)
    verantwortlicher = Column(String, nullable=True)
    beschreibung = Column(Text, nullable=True)
    prioritaet = Column(Enum(PrioritaetEnum), default=PrioritaetEnum.mittel)
    metadaten = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    abhaengigkeiten_quelle = relationship(
        "Abhaengigkeit", foreign_keys="Abhaengigkeit.quelle_id", back_populates="quelle", cascade="all, delete-orphan"
    )
    abhaengigkeiten_ziel = relationship(
        "Abhaengigkeit", foreign_keys="Abhaengigkeit.ziel_id", back_populates="ziel", cascade="all, delete-orphan"
    )


class Abhaengigkeit(Base):
    __tablename__ = "abhaengigkeiten"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    quelle_id = Column(String, ForeignKey("aktivitaeten.id"), nullable=False)
    ziel_id = Column(String, ForeignKey("aktivitaeten.id"), nullable=False)
    typ = Column(Enum(AbhaengigkeitTypEnum), nullable=False)
    notiz = Column(Text, nullable=True)

    quelle = relationship("Aktivitaet", foreign_keys=[quelle_id], back_populates="abhaengigkeiten_quelle")
    ziel = relationship("Aktivitaet", foreign_keys=[ziel_id], back_populates="abhaengigkeiten_ziel")


class StationsStatusEnum(str, enum.Enum):
    nicht_ausgestattet = "nicht_ausgestattet"
    ausgestattet = "ausgestattet"
    aktiv = "aktiv"


class Netztrafostation(Base):
    __tablename__ = "netztrafostationen"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    adresse = Column(String, nullable=True)
    stadtteil = Column(String, nullable=True)
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    status = Column(Enum(StationsStatusEnum), nullable=False, default=StationsStatusEnum.nicht_ausgestattet)
    ausgestattet_am = Column(Date, nullable=True)
    aktiv_seit = Column(Date, nullable=True)
    letztes_auslesen = Column(Date, nullable=True)
    anmerkungen = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
