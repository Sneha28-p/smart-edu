import os
import pickle
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.neighbors import NearestNeighbors
from pymongo import MongoClient

# Define paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "dataset.csv")
MODEL_PATH = os.path.join(BASE_DIR, "model.pkl")

#Read dataset
df = pd.read_csv(DATA_PATH)

# Ensure correct column names
if not {"topic", "steps"}.issubset(df.columns):
    raise ValueError("dataset.csv must have columns: topic, steps")

#Connect to MongoDB
client = MongoClient("mongodb://127.0.0.1:27017/")
db = client["roadmapdb"]
collection = db["roadmaps"]

collection.delete_many({})  # clear old data

#Process and insert each roadmap
for _, row in df.iterrows():
    topic = str(row["topic"]).strip()
    steps_raw = str(row["steps"]).split(",")  # Split by comma
    steps = [s.strip() for s in steps_raw if s.strip()]  # Clean extra spaces
    
    collection.insert_one({
        "topic": topic,
        "steps": steps
    })

print(f"Inserted {collection.count_documents({})} topics into MongoDB")

#rain TF-IDF + NearestNeighbors Model
vectorizer = TfidfVectorizer(stop_words="english")
X = vectorizer.fit_transform(df["topic"])

model = NearestNeighbors(n_neighbors=1, metric="cosine")
model.fit(X)

#Save model and vectorizer
with open(MODEL_PATH, "wb") as f:
    pickle.dump((model, vectorizer, df), f)

print("Model trained and saved as model.pkl")
