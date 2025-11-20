import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
import numpy as np

# Load CSV
data = pd.read_csv("student_data.csv")


groups = data.groupby("subject")

rows = []

for subject, group in groups:
    percentages = group["quiz_marks"].values
    
    avg_percent = np.mean(percentages)
    min_percent = np.min(percentages)
    max_percent = np.max(percentages)
    
    # result: if more than half attempts are pass = 1 else 0
    result = 1 if group["result"].mean() >= 0.5 else 0

    rows.append([avg_percent, min_percent, max_percent, result])

final_df = pd.DataFrame(rows, columns=["avg_percent", "min_percent", "max_percent", "result"])

print("\nTraining Data:")
print(final_df)

# Features & labels
X = final_df[["avg_percent", "min_percent", "max_percent"]]
y = final_df["result"]

# Scale
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(
    X_scaled, y, test_size=0.2, random_state=42
)

# Train model
model = RandomForestClassifier(n_estimators=200)
model.fit(X_train, y_train)

# Save model & scaler
joblib.dump(model, "student_model.pkl")
joblib.dump(scaler, "scaler.pkl")

print("\nTraining Complete!")
print("Training samples:", len(final_df))