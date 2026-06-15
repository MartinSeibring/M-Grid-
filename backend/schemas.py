from pydantic import BaseModel
from typing import Optional, Any
from datetime import date, datetime
from models import TypEnum, StatusEnum, PrioritaetEnum, AbhaengigkeitTypEnum


class AktivitaetBase(BaseModel):
    name: str
    typ: TypEnum
    status: StatusEnum = StatusEnum.initiierung
    start_geplant: Optional[date] = None
    end_geplant: Optional[date] = None
    start_aktuell: Optional[date] = None
    end_aktuell: Optional[date] = None
    fortschritt: int = 0
    verantwortlicher: Optional[str] = None
    beschreibung: Optional[str] = None
    prioritaet: PrioritaetEnum = PrioritaetEnum.mittel
    metadaten: Optional[dict[str, Any]] = {}


class AktivitaetCreate(AktivitaetBase):
    pass


class AktivitaetUpdate(BaseModel):
    name: Optional[str] = None
    typ: Optional[TypEnum] = None
    status: Optional[StatusEnum] = None
    start_geplant: Optional[date] = None
    end_geplant: Optional[date] = None
    start_aktuell: Optional[date] = None
    end_aktuell: Optional[date] = None
    fortschritt: Optional[int] = None
    verantwortlicher: Optional[str] = None
    beschreibung: Optional[str] = None
    prioritaet: Optional[PrioritaetEnum] = None
    metadaten: Optional[dict[str, Any]] = None


class AktivitaetOut(AktivitaetBase):
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class AbhaengigkeitBase(BaseModel):
    quelle_id: str
    ziel_id: str
    typ: AbhaengigkeitTypEnum
    notiz: Optional[str] = None


class AbhaengigkeitCreate(AbhaengigkeitBase):
    pass


class AbhaengigkeitOut(AbhaengigkeitBase):
    id: str
    quelle_name: Optional[str] = None
    ziel_name: Optional[str] = None

    model_config = {"from_attributes": True}


class AnalyticsSummary(BaseModel):
    gesamt: int
    nach_status: dict[str, int]
    nach_typ: dict[str, int]
    in_verzug: int
    durchschnitt_fortschritt: float
