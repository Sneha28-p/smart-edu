import os
import sys
import pickle
from sklearn.metrics.pairwise import cosine_similarity

# Get absolute path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

query = sys.argv[1].strip().lower()

# Load model.pkl
with open(os.path.join(BASE_DIR, "model.pkl"), "rb") as f:
    model, vectorizer, df = pickle.load(f)

# Transform query and dataset
query_vec = vectorizer.transform([query])
X = vectorizer.transform(df["topic"])

# Calculate cosine similarity
similarities = cosine_similarity(query_vec, X).flatten()

# Get the most similar topic and its similarity score
index = similarities.argmax()
score = similarities[index]

# Only accept if similarity is strong enough (> 0.5)
if score > 0.5:
    print(df.iloc[index]["topic"])
else:
    print("NO_MATCH")