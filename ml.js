import fs from "fs";
import path from "path";

const modelPath = path.join(process.cwd(), "model.json");

if (!fs.existsSync(modelPath)) {
  throw new Error("model.json not found in project root!");
}

const model = JSON.parse(fs.readFileSync(modelPath, "utf8"));

function sigmoid(z) {
  return 1 / (1 + Math.exp(-z));
}


export function predict(input) {
  const order = model.feature_order || ["quiz_marks", "attendance", "study_hours"];
  const x = order.map((k) => Number(input[k] || 0));

  const scaled = x.map(
    (value, i) => (value - model.scaler_mean[i]) / model.scaler_scale[i]
  );

  let z = model.intercept;
  for (let i = 0; i < model.coefficients.length; i++) {
    z += scaled[i] * model.coefficients[i];
  }

  const prob = sigmoid(z);
  const predicted = prob >= 0.5 ? 1 : 0;

  return { predicted, probability: prob };
}
