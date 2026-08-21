from __future__ import annotations

from fastapi import APIRouter

from app.schemas.types import DatasetSummary, DatasetRecord

router = APIRouter(prefix="/api/dataset", tags=["dataset"])


def _generate_sample_rows(count: int = 48) -> list[DatasetRecord]:
    electrolytes = ["Na2SiO3", "Na3PO4", "KOH", "KF", "NaAlO2", "MgO suspension"]
    materials = ["Mg", "AZ31", "AZ91", "WE43", "Mg-Li"]
    rows: list[DatasetRecord] = []
    for i in range(count):
        material = materials[i % len(materials)]
        electrolyte = electrolytes[(i * 7) % len(electrolytes)]
        current_density = round(0.5 + ((i * 3.1) % 19), 2)
        voltage = round(80 + ((i * 23) % 400), 2)
        frequency = [0, 500, 1000, 2000, 3000][i % 5]
        duty_cycle = None if i % 4 == 0 else round(20 + ((i * 11) % 80), 2)
        time_val = round(2 + ((i * 5.3) % 58), 1)
        temperature = round(10 + ((i * 9) % 60), 2)
        thickness = round(5 + ((i * 7.7) % 90), 1)
        porosity = round(1.5 + ((i * 2.1) % 8), 2)
        pore_size = round(0.4 + ((i * 0.83) % 8), 2)
        rows.append(DatasetRecord(
            paperId=f"202{(i % 3) + 1}-{100 + ((i * 13) % 899):03d}",
            material=material,
            electrolyte=electrolyte,
            concentration=round(0.1 + ((i * 1.7) % 2.4), 2),
            currentDensity=current_density,
            voltage=voltage,
            frequency=frequency,
            dutyCycle=duty_cycle,
            time=time_val,
            temperature=temperature,
            coatingThickness=thickness,
            porosity=porosity,
            poreSize=pore_size,
            corrosionResistance=round(40 + ((i * 5.3) % 55), 2),
            wearResistance=round(30 + ((i * 6.1) % 65), 2),
            fractureParameter=round(3 + ((i * 1.9) % 22), 2),
        ))
    return rows


@router.get("/summary", response_model=DatasetSummary)
async def dataset_summary() -> DatasetSummary:
    return DatasetSummary(totalRecords=0, status="awaiting_literature", lastUpdated=None)


@router.get("/records", response_model=list[DatasetRecord])
async def dataset_records() -> list[DatasetRecord]:
    return _generate_sample_rows()
