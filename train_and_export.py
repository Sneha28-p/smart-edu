import json
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler

X = np.array([
    [50, 70, 1],
    [65, 80, 2],
    [80, 90, 3],
    [90, 95, 4],
    [30, 50, 1],
    [45, 60, 1],
    [85, 85, 3],
    [60, 70, 2],
    [75, 90, 3],
    [40, 55, 1],
])

y = np.array([0, 0, 1, 1, 0, 0, 1, 0, 1, 0])

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

model = LogisticRegression()
model.fit(X_scaled, y)

export = {
    "coefficients": model.coef_[0].tolist(),
    "intercept": model.intercept_[0],
    "scaler_mean": scaler.mean_.tolist(),
    "scaler_scale": scaler.scale_.tolist(),
    "feature_order": ["quiz_marks", "attendance", "study_hours"]
}

with open("model.json", "w") as f:
    json.dump(export, f, indent=4)

print("✅ model.json generated successfully!")


