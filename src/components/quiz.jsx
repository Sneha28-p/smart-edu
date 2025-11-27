// src/components/Quiz.jsx
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "./quiz.css";

const API_BASE_URL = import.meta?.env?.VITE_API_BASE || "https://smart-edu-backend-cwyi.onrender.com";

export default function Quiz() {
  const [topic, setTopic] = useState("");
  const [quizData, setQuizData] = useState(null);
  const [userAnswers, setUserAnswers] = useState(null);
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");


  const fetchScores = useCallback(async () => {
    try {
      setLoadingScores(true);
      const res = await axios.get(`${API_BASE_URL}/api/get-scores`);
      const data = Array.isArray(res.data) ? res.data : [];
      const sorted = data.sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );
      setPastScores(sorted);
    } catch (err) {
      console.error("Failed to load past scores:", err);
      setPastScores([]);
    } finally {
      setLoadingScores(false);
    }
  }, []);

  useEffect(() => {
    fetchScores();
  }, [fetchScores]);

  const handleGenerateQuiz = async () => {
    if (!topic.trim()) {
      setError("Please enter a topic.");
      return;
    }
    setError("");
    setIsLoading(true);
    setQuizData(null);
    setResults(null);

    try {
      const res = await axios.post(`${API_BASE_URL}/api/generate-quiz`, {
        topic,
      });

      const quizArray = res.data?.questions;
      if (!quizArray || !Array.isArray(quizArray) || quizArray.length === 0) {
        setError(
          "Failed to generate quiz. The server returned unexpected data."
        );
        setIsLoading(false);
        return;
      }

      setQuizData(quizArray);
      setUserAnswers(new Array(quizArray.length).fill(null));
    } catch (err) {
      console.error("Error generating quiz:", err);
      const serverMsg = err?.response?.data?.error;
      setError(serverMsg || "Error generating quiz. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!userAnswers || userAnswers.some((answer) => answer === null)) {
      setError("Please answer all questions before submitting.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/evaluate-quiz`,
        {
          quizData: { questions: quizData },
          userAnswers,
        }
      );

      const evalData = response.data;
      setResults(evalData);

      const storedUser=localStorage.getItem("smartEduUser");
      let user=null;
      try{
        if(storedUser){
          user=JSON.parse(storedUser);
        }
      }catch(e){
        console.warn("Could not parse smartEduUser from localStorage:",e);
      }

      const scoreToSave = {
        topic,
        score: evalData.score,
        total: evalData.total,
        timestamp: new Date().toISOString(),
        userEmail:user?.email||null,
        userName:user?.name||null,
      };

      try {
        await axios.post(`${API_BASE_URL}/api/save-score`, scoreToSave);
        console.log("Saved score to server db.json:", scoreToSave);
      } catch (saveErr) {
        console.warn(
          "Failed to save score to server:",
          saveErr?.response?.data || saveErr.message || saveErr
        );
      }

      try {
        await fetchScores();
      } catch (refreshErr) {
        console.warn("Could not refresh past scores:", refreshErr);
      }

      setQuizData(null);
      setUserAnswers(null);
    } catch (err) {
      console.error("Error submitting quiz:", err);
      setError(
        "An error occurred while submitting the quiz. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (questionIndex, optionIndex) => {
    const copy = [...userAnswers];
    copy[questionIndex] = optionIndex;
    setUserAnswers(copy);
    setError("");
  };

  const resetApp = () => {
    setTopic("");
    setQuizData(null);
    setUserAnswers(null);
    setResults(null);
    setError("");
    setIsLoading(false);
  };

const renderInputScreen = () => (
  <div className="input-container">
    <h1>Smart Quiz Generator</h1>
    <p>Enter a topic to generate a 10-question multiple-choice quiz!</p>
    <input
      type="text"
      value={topic}
      onChange={(e) => setTopic(e.target.value)}
      placeholder="e.g., Photosynthesis"
      disabled={isLoading}
    />
    <button onClick={handleGenerateQuiz} disabled={isLoading || !topic.trim()}>
      {isLoading ? "Generating..." : "Generate Quiz"}
    </button>
    {error && <p className="error-message">{error}</p>}
  </div>
);


  const renderQuizScreen = () => (
    <div className="quiz-container">
      <h2>Quiz on: {topic}</h2>

      {console.log("Sample question:", quizData?.[0])}

      {quizData.map((q, qi) => (
        <div key={qi} className="question-card">
          <h3>
            {qi + 1}.{" "}
            {q.question && q.question.trim()
              ? q.question
              : "Question text missing"}
          </h3>

          <div className="options-container">
            {Array.isArray(q.options) && q.options.length > 0 ? (
              q.options.map((opt, oi) => (
                <label
                  key={oi}
                  className={`option-label ${
                    userAnswers[qi] === oi ? "selected" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${qi}`}
                    checked={userAnswers[qi] === oi}
                    onChange={() => handleAnswerSelect(qi, oi)}
                  />

                  <span className="option-text">
                    {opt && String(opt).trim()
                      ? opt
                      : `Option ${String.fromCharCode(65 + oi)}`}
                  </span>
                </label>
              ))
            ) : (
              <p className="error-message">
                No options available for this question.
              </p>
            )}
          </div>
        </div>
      ))}

      <button
        onClick={handleSubmitQuiz}
        disabled={
          isLoading ||
          !userAnswers ||
          userAnswers.some((a) => a === null)
        }
      >
        {isLoading ? "Submitting..." : "Submit Quiz"}
      </button>

      {error && <p className="error-message">{error}</p>}
    </div>
  );

  const renderResultsScreen = () => (
    <div className="results-container">
      <h2>Quiz Results</h2>
      <h3 className="score">
        Your Score: {results.score} / {results.total}
      </h3>

      <div className="feedback-list">
        {results.feedback.map((fb, idx) => (
          <div
            key={idx}
            className={`feedback-card ${
              fb.isCorrect ? "correct" : "incorrect"
            }`}
          >
            <h4>
              {idx + 1}. {fb.question}
            </h4>
            <p>Your answer: {fb.userAnswer}</p>
            {!fb.isCorrect && (
              <p className="correct-answer">Correct: {fb.correctAnswer}</p>
            )}
            <p className="explanation">
              <strong>Explanation:</strong> {fb.explanation}
            </p>
          </div>
        ))}
      </div>

      <button onClick={resetApp}>Generate Another Quiz</button>
    </div>
  );

  return (
    <div className="App">
      <div className="app-container">
        {isLoading && !results && (
          <div className="loading-container">Working…</div>
        )}

        {!isLoading && results && renderResultsScreen()}

        {!isLoading && !results && quizData && renderQuizScreen()}

        {!isLoading && !results && !quizData && renderInputScreen()}
      </div>
    </div>
  );
}
