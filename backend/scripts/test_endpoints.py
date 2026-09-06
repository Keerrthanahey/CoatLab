import json, base64
from pathlib import Path
import requests

BASE = "http://127.0.0.1:8000"
results = []

def check(name, ok, detail=""):
    results.append((name, ok, detail))
    print(f"{'PASS' if ok else 'FAIL'}  {name}  {detail}")

# 1. health
r = requests.get(f"{BASE}/api/health")
check("GET /api/health", r.status_code == 200, f"{r.status_code} {r.text[:80]}")

# 2. ml/predict - Magnesium substrate, Zirconium coating, Constant Current, DC
payload = {
    "substrate_material": "Magnesium",
    "coating_material": "Zirconium",
    "reinforcement": "none",
    "reinforcement_percentage": 0.0,
    "particle_size": 0.0,
    "coating_method": "PEO",
    "electrolyte_composition": "NaOH",
    "current_voltage_mode": "constant_current",
    "ac_dc_mode": "DC",
    "current_density": 20.0,
    "voltage": 350.0,
    "frequency": 0.0,
    "duty_cycle": 50.0,
    "treatment_time": 30.0,
    "temperature": 25.0,
    "pressure": 2.0,
    "spray_distance": 150.0,
    "speed": 0.0,
    "num_passes": 1,
    "heat_treatment_temperature": 25.0,
    "heat_treatment_time": 0.0,
    "cooling_method": "air",
    "surface_roughness": 1.2,
    "surface_preparation": "ground",
    "surface_hardness": 80.0,
}
r = requests.post(f"{BASE}/api/ml/predict", json=payload)
ok = r.status_code == 200
body = r.json()
needed = ["predictions", "prediction_status", "data_status", "demo_status", "model_name"]
ok = ok and all(k in body for k in needed) and all(t in body["predictions"] for t in ["corrosion_resistance","corrosion_rate","coating_thickness","porosity","pore_size","wear_resistance"])
check("POST /api/ml/predict (Mg|Zr|CC|DC)", ok, f"{sorted(body.get('predictions', {}).keys())}")

# 3. validation - duty_cycle out of range
bad = dict(payload)
bad["duty_cycle"] = 150
r = requests.post(f"{BASE}/api/ml/predict", json=bad)
check("predict rejects duty_cycle>100", r.status_code == 422, f"{r.status_code}")

# 4. optimization
opt = {
    "ranges": {
        "substrate_material": ["Magnesium"],
        "coating_material": ["Zirconium", "Tantalum", "Al2O3"],
        "current_voltage_mode": ["constant_current"],
        "ac_dc_mode": ["DC"],
        "current_density": [5, 10, 20],
        "voltage": [150, 350],
        "duty_cycle": [30, 50],
        "treatment_time": [15, 30],
    },
    "weights": {
        "corrosion_resistance": 0.30,
        "wear_resistance": 0.25,
        "corrosion_rate": 0.20,
        "porosity": 0.15,
        "coating_thickness": 0.05,
        "pore_size": 0.05,
    },
    "max_combinations": 1000,
}
r = requests.post(f"{BASE}/api/ml/optimize", json=opt)
body = r.json()
need = ["total_evaluated", "best_combination", "top_10_combinations", "predicted_outputs", "score", "objective_weights", "data_status", "demo_status"]
ok = r.status_code == 200 and all(k in body for k in need) and body["total_evaluated"] > 0 and "DEMO" in body["demo_status"]
check("POST /api/ml/optimize", ok, f"evaluated={body.get('total_evaluated')} score={body.get('score')}")

# 5. model-info
r = requests.get(f"{BASE}/api/ml/model-info")
body = r.json()
ok = body.get("trained") is True and len(body.get("supported_substrates", [])) == 4
check("GET /api/ml/model-info", ok, f"trained={body.get('trained')} features={body.get('feature_count')} subs={body.get('supported_substrates')}")

# 6. feature-info
r = requests.get(f"{BASE}/api/ml/feature-info")
body = r.json()
ok = "current_density" in body.get("numeric", []) and "units" in body and "electrolyte_composition" in body.get("categorical", [])
check("GET /api/ml/feature-info", ok, f"cat={len(body.get('categorical',[]))} num={len(body.get('numeric',[]))}")

# 7. morphology
with open("data/test_pores.png", "rb") as f:
    r = requests.post(f"{BASE}/api/morphology/analyze", files={"file": ("pores.png", f, "image/png")})
body = r.json()
ok = r.status_code == 200 and body.get("pore_count", 0) >= 1 and "calibration" in body
check("POST /api/morphology/analyze", ok, f"pores={body.get('pore_count')} calib={body.get('calibration')}")

# 8. figure
with open("data/test_figure.png", "rb") as f:
    r = requests.post(f"{BASE}/api/figure/analyze", files={"file": ("figure.png", f, "image/png")})
body = r.json()
ok = r.status_code == 200 and "approximate_values" in body and "notes" in body
check("POST /api/figure/analyze", ok, f"axes={body.get('axes_detected')} points={len(body.get('data_points', []))}")

# 9. agent
r = requests.post(f"{BASE}/api/agent/chat", json={"message": "Predict coating for Magnesium substrate with Zirconium coating at 20 A/dm2"})
body = r.json()
check("POST /api/agent/chat", r.status_code == 200, f"demo={body.get('demo')} error={body.get('error')}")

# 10. materials
r = requests.get(f"{BASE}/api/materials")
body = r.json()
names = [m["name"] for m in body]
ok = all(x in names for x in ["Magnesium", "Aluminum", "Zirconium", "Tantalum"])
check("GET /api/materials (Mg/Al/Zr/Ta)", ok, f"{names}")

print()
failed = [n for n, ok, _ in results if not ok]
print(f"{len(results)-len(failed)}/{len(results)} passed", "FAILED: " + ", ".join(failed) if failed else "")