# predict.py
# Called from server.js with:
#   python predict.py "<json-string>"
#
# The JSON looks like:
# [
#   {"subject": "python", "percent": 50.0},
#   {"subject": "c++", "percent": 40.0},
#   ...
# ]
#
# This script prints a HUMAN-READABLE prediction string:
#   - strongest subject
#   - weakest subject
#   - short career path suggestion

import json
import sys

def main():
  # If no argument passed, print generic message
  if len(sys.argv) < 2:
    print("Not enough score data to make a prediction yet. Try taking a few quizzes first.")
    return

  try:
    scores = json.loads(sys.argv[1])
  except Exception:
    print("Could not read your scores. Please try again after some more quizzes.")
    return

  if not scores:
    print("No quiz scores found yet. Take a few quizzes to get a personalized prediction.")
    return

  # Ensure each item has subject & percent
  valid_scores = [
    s for s in scores
    if isinstance(s, dict) and "subject" in s and "percent" in s
  ]
  if not valid_scores:
    print("Your scores are not in the right format for prediction.")
    return

  # Find strongest & weakest subject
  strongest = max(valid_scores, key=lambda x: x["percent"])
  weakest  = min(valid_scores, key=lambda x: x["percent"])

  strong_subj = str(strongest["subject"]).lower()
  weak_subj   = str(weakest["subject"]).lower()
  strong_pct  = round(float(strongest["percent"]), 1)
  weak_pct    = round(float(weakest["percent"]), 1)

  # -----------------------------
  # Career suggestion based on strongest subject
  # -----------------------------
  suggestion = ""

  # Normalize for simple keyword checks
  s = strong_subj.replace(" ", "")

  if any(k in s for k in ["python", "ml", "machinelearning", "ai", "data"]):
    suggestion = (
      "You have good potential for Data Science / Machine Learning or AI-related roles. "
      "Consider exploring projects in data analysis, ML models, or AI applications."
    )
  elif any(k in s for k in ["c++", "cpp", "cp", "dsa", "datastructures", "algorithms"]):
    suggestion = (
      "Your strengths are suited for Software Development and competitive programming. "
      "You could focus on roles like Software Engineer, Systems Programmer, or Game Developer."
    )
  elif any(k in s for k in ["java", "oop"]):
    suggestion = (
      "You have a solid base for backend or enterprise development. "
      "Careers in Java backend, Android development, or large-scale enterprise systems may fit you well."
    )
  elif any(k in s for k in ["dbms", "database", "sql"]):
    suggestion = (
      "You show strength in database concepts. "
      "You might enjoy roles like Backend Developer, Database Administrator, or Data Engineer."
    )
  elif any(k in s for k in ["network", "cn", "computerNetworks", "os", "operatingsystem"]):
    suggestion = (
      "You have a good base in low-level and network concepts. "
      "Consider exploring careers in Networking, DevOps, Cloud, or Cybersecurity."
    )
  else:
    suggestion = (
      "You have a clear strength in this subject. "
      "Try building small projects and exploring internships or courses in areas related to your strongest subject."
    )

  # -----------------------------
  # Final message combining D + A
  # -----------------------------
  message = (
    f"Strongest subject: {strong_subj} ({strong_pct}%). "
    f"Weakest subject: {weak_subj} ({weak_pct}%). "
    f"{suggestion}"
  )

  print(message)


if __name__ == "__main__":
  main()
