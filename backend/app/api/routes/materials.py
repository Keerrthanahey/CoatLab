from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.schemas.types import Material

router = APIRouter(prefix="/api/materials", tags=["materials"])

MATERIALS_DB: dict[str, Material] = {
    "mp-mg": Material(
        id="mp-mg",
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
            "note": "Demo record — connect backend for verified data.",
        },
    ),
    "mp-al": Material(
        id="mp-al",
        symbol="Al",
        formula="Al",
        name="Aluminum",
        category="metal",
        crystalSystem="Cubic",
        spaceGroup={"number": 225, "symbol": "Fm-3m", "name": "Face-centered cubic (fcc)"},
        density=2.70,
        volume=15.5,
        lattice={"a": 4.049, "b": 4.049, "c": 4.049, "alpha": 90, "beta": 90, "gamma": 90},
        composition=[{"element": "Al", "fraction": 1.0}],
        elements=[
            {
                "symbol": "Al",
                "name": "Aluminum",
                "atomicNumber": 13,
                "atomicMass": 26.982,
                "group": "13 (boron group)",
                "period": 3,
                "block": "p",
                "electronConfiguration": "[Ne] 3s² 3p¹",
            }
        ],
        thermodynamic={
            "formationEnergyPerAtom": 0.0,
            "energyAboveHull": 0.0,
            "isStable": True,
            "decompositionEnergy": 0.0,
        },
        mechanical={
            "bulkModulus": 76.0,
            "shearModulus": 26.0,
            "poissonRatio": 0.35,
            "universalAnisotropy": 1.2,
        },
        electronic={"bandGap": 0.0, "isMetal": True, "valenceElectrons": 3},
        surface={
            "facets": [
                {"miller": "(100)", "energy": 0.96},
                {"miller": "(110)", "energy": 1.03},
                {"miller": "(111)", "energy": 0.89},
            ],
            "workFunction": 4.28,
            "notes": "Representative demo estimates.",
        },
        source={
            "provider": "Materials Project (mock)",
            "note": "Demo record — connect backend for verified data.",
        },
    ),
    "mp-zr": Material(
        id="mp-zr",
        symbol="Zr",
        formula="Zr",
        name="Zirconium",
        category="metal",
        crystalSystem="Hexagonal",
        spaceGroup={"number": 194, "symbol": "P63/mmc", "name": "Hexagonal close-packed (hcp)"},
        density=6.511,
        volume=23.1,
        lattice={"a": 3.232, "b": 3.232, "c": 5.148, "alpha": 90, "beta": 90, "gamma": 120},
        composition=[{"element": "Zr", "fraction": 1.0}],
        elements=[
            {
                "symbol": "Zr",
                "name": "Zirconium",
                "atomicNumber": 40,
                "atomicMass": 91.224,
                "group": "4 (transition metal)",
                "period": 5,
                "block": "d",
                "electronConfiguration": "[Kr] 4d² 5s²",
            }
        ],
        thermodynamic={
            "formationEnergyPerAtom": 0.0,
            "energyAboveHull": 0.0,
            "isStable": True,
            "decompositionEnergy": 0.0,
        },
        mechanical={
            "bulkModulus": 91.0,
            "shearModulus": 33.0,
            "poissonRatio": 0.34,
            "universalAnisotropy": 0.7,
        },
        electronic={"bandGap": 0.0, "isMetal": True, "valenceElectrons": 4},
        surface={
            "facets": [
                {"miller": "(0001)", "energy": 1.4},
                {"miller": "(10-10)", "energy": 1.7},
                {"miller": "(11-20)", "energy": 1.8},
            ],
            "workFunction": 4.05,
            "notes": "Representative demo estimates.",
        },
        source={
            "provider": "Materials Project (mock)",
            "note": "Demo record — connect backend for verified data.",
        },
    ),
    "mp-ta": Material(
        id="mp-ta",
        symbol="Ta",
        formula="Ta",
        name="Tantalum",
        category="metal",
        crystalSystem="Cubic",
        spaceGroup={"number": 229, "symbol": "Im-3m", "name": "Body-centered cubic (bcc)"},
        density=16.654,
        volume=10.9,
        lattice={"a": 3.303, "b": 3.303, "c": 3.303, "alpha": 90, "beta": 90, "gamma": 90},
        composition=[{"element": "Ta", "fraction": 1.0}],
        elements=[
            {
                "symbol": "Ta",
                "name": "Tantalum",
                "atomicNumber": 73,
                "atomicMass": 180.948,
                "group": "5 (transition metal)",
                "period": 6,
                "block": "d",
                "electronConfiguration": "[Xe] 4f14 5d3 6s2",
            }
        ],
        thermodynamic={
            "formationEnergyPerAtom": 0.0,
            "energyAboveHull": 0.0,
            "isStable": True,
            "decompositionEnergy": 0.0,
        },
        mechanical={
            "bulkModulus": 196.0,
            "shearModulus": 69.0,
            "poissonRatio": 0.34,
            "universalAnisotropy": 3.4,
        },
        electronic={"bandGap": 0.0, "isMetal": True, "valenceElectrons": 5},
        surface={
            "facets": [
                {"miller": "(100)", "energy": 2.1},
                {"miller": "(110)", "energy": 2.0},
                {"miller": "(111)", "energy": 2.3},
            ],
            "workFunction": 4.25,
            "notes": "Representative demo estimates.",
        },
        source={
            "provider": "Materials Project (mock)",
            "note": "Demo record — connect backend for verified data.",
        },
    ),
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
