// src/components/quiz.jsx
import React, { useState } from 'react';
import axios from 'axios';
import './quiz.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function Quiz() {
  const [topic, setTopic] = useState('');
  const [quizData, setQuizData] = useState(null);
  const [userAnswers, setUserAnswers] = useState(null);
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerateQuiz = async () => {
    if (!topic.trim()) { setError('Please enter a topic.'); return; }
    setIsLoading(true); setError(''); setQuizData(null); setResults(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/generate-quiz`, { topic });
      const quizArray = response.data?.questions;
      if (quizArray && quizArray.length > 0) {
        setQuizData(quizArray);
        setUserAnswers(new Array(quizArray.length).fill(null));
      } else {
        setError('Failed to generate quiz. The data format was incorrect.');
      }
    } catch (err) {
      console.error('Error generating quiz:', err);
      const serverError = err.response?.data?.error || 'An error occurred while generating the quiz. Please try again.';
      setError(serverError);
    } finally { setIsLoading(false); }
  };

  const handleSubmitQuiz = async () => {
    if (!userAnswers || userAnswers.some(answer => answer === null)) {
      setError('Please answer all questions before submitting.');
      return;
    }
    setIsLoading(true); setError('');
    try {
      const response = await axios.post(`${API_BASE_URL}/api/evaluate-quiz`, {
        quizData: { questions: quizData }, userAnswers,
      });
      setResults(response.data);
      setQuizData(null);
    } catch (err) {
      console.error('Error submitting quiz:', err);
      setError('An error occurred while submitting the quiz. Please try again.');
    } finally { setIsLoading(false); }
  };

  const handleAnswerSelect = (questionIndex, optionIndex) => {
    const newAnswers = [...userAnswers]; newAnswers[questionIndex] = optionIndex; setUserAnswers(newAnswers); setError('');
  };

  const resetApp = () => {
    setTopic(''); setQuizData(null); setUserAnswers(null); setResults(null); setError(''); setIsLoading(false);
  };

  const renderInputScreen = () => (
    <div className="input-container">
      <h1>Smart Quiz Generator</h1>
      <p>Enter any topic to generate a 10-question multiple-choice quiz!</p>
      <input
        type="text"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        placeholder="e.g., Photosynthesis"
        disabled={isLoading}
      />
      <button onClick={handleGenerateQuiz} disabled={isLoading || !topic.trim()}>
        {isLoading ? 'Generating...' : 'Generate 10-Question Quiz'}
      </button>
      {error && <p className="error-message">{error}</p>}
    </div>
  );

  const renderQuizScreen = () => (
    <div className="quiz-container">
      <h2>Quiz on: {topic}</h2>
      {quizData.map((question, qIndex) => (
        <div key={qIndex} className="question-card">
          <h3>{qIndex + 1}. {question.question}</h3>
          <div className="options-container">
            {question.options.map((option, oIndex) => (
              <label key={oIndex} className={`option-label ${userAnswers[qIndex] === oIndex ? 'selected' : ''}`}>
                <input type="radio" name={`question-${qIndex}`} checked={userAnswers[qIndex] === oIndex}
                       onChange={() => handleAnswerSelect(qIndex, oIndex)} disabled={isLoading} />
                {option}
              </label>
            ))}
          </div>
        </div>
      ))}
      <button onClick={handleSubmitQuiz} disabled={isLoading || !userAnswers || userAnswers.some(a => a === null)}>
        {isLoading ? 'Submitting...' : 'Submit Quiz'}
      </button>
      {error && <p className="error-message">{error}</p>}
    </div>
  );

  const renderResultsScreen = () => (
    <div className="results-container">
      <h2>Quiz Results</h2>
      <h3 className="score">Your Score: {results.score} / {results.total}</h3>
      <div className="feedback-list">
        {results.feedback.map((item, index) => (
          <div key={index} className={`feedback-card ${item.isCorrect ? 'correct' : 'incorrect'}`}>
            <h4>{index + 1}. {item.question}</h4>
            <p>Your answer: {item.userAnswer}</p>
            {!item.isCorrect && <p className="correct-answer">Correct answer: {item.correctAnswer}</p>}
            <p className="explanation"><strong>Explanation:</strong> {item.explanation}</p>
          </div>
        ))}
      </div>
      <button onClick={resetApp}>Generate Another Quiz</button>
    </div>
  );

  return (
    <div className="quiz-page" id="quiz-page-debug">
      <div className="App">
        <div className="app-container">
          {isLoading && !results && (
            <div className="loading-container">
              <h2>Generating quiz for "{topic}"...</h2>
              <p>(This may take a moment)</p>
            </div>
          )}

          {!isLoading && results && renderResultsScreen()}
          {!isLoading && !results && quizData && renderQuizScreen()}
          {!isLoading && !results && !quizData && renderInputScreen()}
        </div>
      </div>
    </div>
  );
}
