from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.schemas.types import Material

router = APIRouter(prefix="/api/materials", tags=["materials"])

MATERIALS_DB: dict[str, Material] = {
    "mp-153": Material(
        id="mp-153",
        symbol="Mg",
        formula="Mg",
        name="Magnesium",
        category="metal",
        crystalSystem="Hexagonal",
        spaceGroup={"number": 194, "symbol": "P63/mmc", "name": "Hexagonal close-packed (hcp)"},
        density=1.738,
        volume=22.9,
        lattice={"a": 3.209, "b": 3.209, "c": 5.211, "alpha": 90, "beta": 90, "gamma": 120},
        composition=[{"element": "Mg", "fraction": 1.0}],
        elements=[
            {
                "symbol": "Mg",
                "name": "Magnesium",
                "atomicNumber": 12,
                "atomicMass": 24.305,
                "group": "2 (alkaline earth)",
                "period": 3,
                "block": "s",
                "electronConfiguration": "[Ne] 3s²",
            }
        ],
        thermodynamic={
            "formationEnergyPerAtom": 0.0,
            "energyAboveHull": 0.0,
            "isStable": True,
            "decompositionEnergy": 0.0,
        },
        mechanical={
            "bulkModulus": 45.2,
            "shearModulus": 17.0,
            "poissonRatio": 0.29,
            "universalAnisotropy": 0.35,
        },
        electronic={"bandGap": 0.0, "isMetal": True, "valenceElectrons": 2},
        surface={
            "facets": [
                {"miller": "(0001)", "energy": 0.56},
                {"miller": "(10-10)", "energy": 0.68},
                {"miller": "(11-20)", "energy": 0.71},
            ],
            "workFunction": 3.66,
            "notes": "Low-index surface energies; values are representative demo estimates.",
        },
        source={
            "provider": "Materials Project (mock)",
            "note": "Demo record — connect GET /api/materials/mp-153 for verified data.",
        },
    )
}


@router.get("", response_model=list[Material])
async def list_materials() -> list[Material]:
    return list(MATERIALS_DB.values())


@router.get("/{material_id}", response_model=Material)
async def get_material(material_id: str) -> Material:
    material = MATERIALS_DB.get(material_id)
    if material is None:
        raise HTTPException(status_code=404, detail=f"Material '{material_id}' not found")
    return material
