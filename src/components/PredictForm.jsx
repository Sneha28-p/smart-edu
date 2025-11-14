import React, { useState } from "react";

export default function PredictForm() {
  const [quiz_marks, setQuizMarks] = useState("");
  const [attendance, setAttendance] = useState("");
  const [study_hours, setStudyHours] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("http://localhost:5000/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quiz_marks: Number(quiz_marks),
          attendance: Number(attendance),
          study_hours: Number(study_hours),
        }),
      });

      if (!res.ok) throw new Error("Server returned an error");

      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error("Fetch error:", err);
      setResult({ error: "Server connection error!" });
    } finally {
      setLoading(false);
    }
  };

  const handleFocus = (e) => e.target.style.borderColor = "#07728b";
  const handleBlur = (e) => e.target.style.borderColor = "#ccc";

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h2 style={styles.heading}>Student Performance Prediction</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="number"
            className="custome-number-input"
            placeholder="Quiz Marks (0-100)"
            value={quiz_marks}
            onChange={(e) => setQuizMarks(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            required
            style={styles.input}
          />
          <input
            type="number"
            placeholder="Attendance (%)"
            value={attendance}
            onChange={(e) => setAttendance(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            required
            style={styles.input}
          />
          <input
            type="number"
            placeholder="Study Hours (per day)"
            value={study_hours}
            onChange={(e) => setStudyHours(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            required
            style={styles.input}
          />
          <button
            type="submit"
            disabled={loading}
            style={styles.button}
            onMouseEnter={(e) => e.target.style.backgroundColor = "#14a0b3ff"}
            onMouseLeave={(e) => e.target.style.backgroundColor = "#07728b"}
          >
            {loading ? "Predicting..." : "Predict"}
          </button>
        </form>

        {result && (
          <div style={styles.result}>
            {result.error ? (
              <p style={styles.resultError}>{result.error}</p>
            ) : (
              <>
                <h3>Result:</h3>
                <p>
                  <strong>Prediction:</strong>{" "}
                  {result.predicted === 1 ? "Pass" : "Fail"}
                </p>
                <p>
                  <strong>Probability:</strong>{" "}
                  {(result.probability * 100).toFixed(2)}%
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  
  page: {
    minHeight: "100vh",
    width: "100vw",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor:"#f6f8fb",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    padding: "0",
  },
  container: {
    width: "90%",
    maxWidth: "800px",
    padding: "40px",
    borderRadius: "20px",
    boxShadow: "0 12px 40px rgba(0, 0, 0, 0.2)",
    backgroundColor: "#ffffff",
    textAlign: "center",
    transition: "all 0.3s ease",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "25px",
    marginTop: "30px",
  },
  input: {
    height: "60px",
    width: "100%",
    borderRadius: "12px",
    border: "1px solid #d0d7de",
    fontSize: "1.3rem",
    color: "#1e293b",
    backgroundColor: "#ffffff",
    padding: "0 15px",
    outline: "none",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  },

  inputFocus: {
    borderColor: "#07728b",
    boxShadow: "0 0 8px rgba(67, 170, 193, 0.4)",
  },
  button: {
    height: "60px",          
    borderRadius: "12px",
    border: "none",
    backgroundColor: "#07728b",
    color: "#fff",
    fontWeight: "700",
    fontSize: "1.3rem",
    cursor: "pointer",
    transition: "background-color 0.3s ease, transform 0.2s ease",
  },
  buttonHover: {
    backgroundColor: "#055d69",
    transform: "translateY(-3px)",
  },
  result: {
    marginTop: "30px",
    padding: "20px",
    borderRadius: "15px",
    backgroundColor: "#e6f0ff",
    boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
    color: "#07728b",
    fontSize: "1.2rem",
  },
  resultError: {
    color: "#d93025",
    fontWeight: "700",
    fontSize: "1.2rem",
  },
  heading: {
    fontSize: "2rem",
    fontWeight: "700",
    color: "#07728b",
  },
};

