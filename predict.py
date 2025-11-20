#!/usr/bin/env python3
# predict.py
# Usage:
#   python predict.py '[{"subject":"python","percent":20}, {"subject":"c++","percent":40}]'
# or, if called without args, it can read JSON from stdin.

import sys
import json
import os
import traceback

# Optional: try to import joblib only if model loading is attempted
try:
    import joblib
except Exception:
    joblib = None

def safe_print_prediction(val):
    # Print exactly "1" or "0" (no newline quirks) and flush
    s = "1" if val else "0"
    sys.stdout.write(s)
    sys.stdout.flush()

def load_input():
    # Accept JSON array either as first argument or from stdin
    if len(sys.argv) > 1:
        raw = sys.argv[1]
    else:
        raw = sys.stdin.read()
    try:
        data = json.loads(raw)
        # Expecting a list of { subject, percent }
        if isinstance(data, dict) and "all_scores" in data:
            data = data["all_scores"]
        if not isinstance(data, list):
            raise ValueError("Input JSON is not a list")
        return data
    except Exception as e:
        # If parsing fails, print error to stderr and exit with default
        sys.stderr.write("Failed to parse input JSON: " + str(e) + "\n")
        sys.stderr.write("Raw input was: " + (raw[:1000] if isinstance(raw, str) else str(raw)) + "\n")
        return None

def heuristic_predict(all_scores):
    """
    Simple fallback heuristic:
      - compute average percent
      - if avg >= 50 => PASS (1)
      - else => FAIL (0)
    This is safe and deterministic.
    """
    try:
        if not all_scores or len(all_scores) == 0:
            return 0
        percents = []
        for item in all_scores:
            # accept keys 'percent' or 'percent_score' or numeric values
            p = None
            if isinstance(item, dict):
                p = item.get("percent") or item.get("percent_score") or item.get("pct")
            else:
                # if item is number treat as percent
                p = item
            try:
                p = float(p)
            except Exception:
                p = None
            if p is not None:
                percents.append(p)
        if len(percents) == 0:
            return 0
        avg = sum(percents) / len(percents)
        # simple threshold (50%) - you can change as needed
        return 1 if avg >= 50.0 else 0
    except Exception as e:
        sys.stderr.write("Heuristic predict error: " + str(e) + "\n")
        return 0

def model_predict(all_scores, model_path):
    """
    Load a joblib model and call predict. The model must accept a vector representation.
    This example expects the model to accept a list of percents or other features.
    You may need to adapt to your trained model's expected feature vector.
    """
    if joblib is None:
        raise RuntimeError("joblib is not installed")

    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model file not found at {model_path}")

    model = joblib.load(model_path)

    # Convert all_scores to a simple feature vector: average, max, min
    percents = []
    for item in all_scores:
        try:
            p = float(item.get("percent") if isinstance(item, dict) else float(item))
            percents.append(p)
        except Exception:
            continue

    if len(percents) == 0:
        raise ValueError("No percent values to build features")

    features = [[sum(percents)/len(percents), max(percents), min(percents)]]
    # If your model expects different features, change above accordingly.

    # Predict: model.predict returns array-like
    pred = model.predict(features)
    # Normalize to 0 or 1
    try:
        p = int(pred[0])
        return 1 if p == 1 else 0
    except Exception:
        # fallback if prediction returns probability
        try:
            p0 = float(pred[0])
            return 1 if p0 >= 0.5 else 0
        except Exception:
            raise

def main():
    all_scores = load_input()  # list of {subject, percent}
    if all_scores is None:
        # parse failed; exit with 0
        safe_print_prediction(0)
        return

    # Model path - default uses "student_model.pkl" in current directory
    model_path = os.environ.get("MODEL_PATH") or "student_model.pkl"

    # Try to use the trained model if available
    try:
        if os.path.exists(model_path) and joblib is not None:
            # attempt model prediction
            try:
                result = model_predict(all_scores, model_path)
                safe_print_prediction(result)
                return
            except Exception as e:
                # Log model error but continue to heuristic fallback
                sys.stderr.write("Model prediction failed: " + str(e) + "\n")
                traceback.print_exc(file=sys.stderr)
        else:
            if not os.path.exists(model_path):
                sys.stderr.write(f"Model file not found at {model_path} - falling back to heuristic\n")
            elif joblib is None:
                sys.stderr.write("joblib not available - falling back to heuristic\n")
    except Exception as e:
        sys.stderr.write("Unexpected error when trying model: " + str(e) + "\n")
        traceback.print_exc(file=sys.stderr)

    # Fallback heuristic
    try:
        result = heuristic_predict(all_scores)
        safe_print_prediction(result)
        return
    except Exception as e:
        sys.stderr.write("Heuristic failed: " + str(e) + "\n")
        traceback.print_exc(file=sys.stderr)
        # final fallback
        safe_print_prediction(0)
        return

if __name__ == "__main__":
    main()
