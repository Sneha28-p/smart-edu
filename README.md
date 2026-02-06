# 📘 Smart-Edu — AI-Powered Learning & Quiz System

Smart-Edu is an intelligent education assistant that helps students learn using **AI-generated quizzes**, **performance prediction**, and **weak-subject analysis**.  
It combines **React**, **Node.js**, **Python ML**, and **Google Gemini AI** to create a personalized and smart learning experience.

---

## 🚀 Features

### 🔹 AI Quiz Generator
- Generates **10-question MCQ quizzes** using **Gemini AI**
- Each question includes explanations  
- Clean UI for answering quizzes  

### 🔹 Score Saving (db.json)
- Every quiz attempt is saved automatically  
- Stored inside `db.json` for ML analysis  
- Past attempts are shown in the UI  

### 🔹 Machine Learning Prediction (Python)
- Predicts whether a student will **PASS** or **NEEDS IMPROVEMENT**
- Uses trained model: `student_model.pkl`
- Runs via `predict.py`

### 🔹 Weak Subject Analysis
- Automatically identifies lowest-scored subject  
- Helps students understand where improvement is needed  

### 🔹 AI-Generated Study Roadmap
- Generates a personalized learning roadmap based on user input  
- With perviously stored roadmaps using MongoDB 

---

## 🛠️ Tech Stack

### **Frontend**
- React (Vite)
- JavaScript
- Axios
- Plain CSS

### **Backend**
- Node.js  
- Express.js  
- File-based JSON database (`db.json`)
- MongoDB (required)

### **AI & ML**
- Google Gemini API  
- Python  
- Scikit-Learn  
- Joblib  

---

## 📁 Project Structure
smart-edu/
│
├── client/
│ ├── src/
│ │ ├── components/
│ │ │ ├── Quiz.jsx
│ │ │ ├── PredictForm.jsx
│ │ ├── App.jsx
│ │ └── main.jsx
│ └── index.html
│
├── server.js
├── routes/
│ ├── predict.js
│ └── roadmap.js
│
├── db.json
├── predict.py
├── student_model.pkl
└── package.json

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the repository
```sh
git clone https://github.com/Sneha28-p/smart-edu
cd smart-edu
```

---

### 2️⃣ Backend Setup
```
npm install
```

## Create .env

```
PORT=5000
GEMINI_API_KEY=your_google_api_key
SCORES_DB_PATH=./db.json
```

## Start backend

```
npm start
or
node server.js

```

### 3️⃣ Python ML Setup
```
pip install joblib scikit-learn numpy
```
Ensure files exist:
 predict.py
 student_model.pkl

 ### Install bcrypto 
 ```
   npm install bcrypto
 ```

### 4️⃣ Frontend Setup
```
npm install
npm run dev
```
## API Endpoints
Quiz

| Method | Route                | Description                |
| ------ | -------------------- | -------------------------- |
| POST   | `/api/generate-quiz` | Generate quiz using Gemini |
| POST   | `/api/evaluate-quiz` | Evaluate quiz submission   |
| POST   | `/api/save-score`    | Save quiz score to db.json |
| GET    | `/api/get-scores`    | Get all quiz attempts      |

Prediction

| Method | Route                  | Description                          |
| ------ | ---------------------- | ------------------------------------ |
| GET    | `/api/predict-from-db` | Run ML prediction using saved scores |
| GET    | `/api/weak-subject`    | Identify lowest-performing subject   |

Roadmap

| Method | Route          | Description                         |
| ------ | -------------- | ----------------------------------- |
| POST   | `/api/roadmap` | Gives study roadmap based on topic entered using already stored data |

🌱 Future Improvements

Add charts for score visualization

Optional user authentication

Full migration to MongoDB

Enhanced ML model with more training data

## 👥 Project Work

This project was developed as a group effort.  
Here are the contributors:

### **Team Members**
- **Sneha Patted** — Frontend development, UI/UX, Backend integration  
- **H Siri** — Prediction system  
- **Supraja** — genrating roadmaps  
- **Manya H B** — Quiz Module 

We worked together on requirements, architecture, coding, and project documentation.
