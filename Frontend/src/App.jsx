import { useState, useEffect } from 'react'
import "prismjs/themes/prism-tomorrow.css"
import Editor from "react-simple-code-editor"
import prism from "prismjs"
import Markdown from "react-markdown"
import rehypeHighlight from "rehype-highlight"
import "highlight.js/styles/github-dark.css"
import axios from 'axios'
import './App.css'

function App() {
  const [code, setCode] = useState(`function sum() {\n  return 1 + 1\n}`)
  const [review, setReview] = useState(``)
  const [theme, setTheme] = useState('dark')

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark'
    setTheme(savedTheme)
    document.documentElement.className = savedTheme 
  }, [])

  useEffect(() => {
    prism.highlightAll()
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.className = newTheme
  }

  async function reviewCode() {
  try {
    const response = await axios.post('https://code-review-main-backend.onrender.com/ai/get-review', { code });
    setReview(response.data); // Now stores reviewText, score, metrics
  } catch (err) {
    console.error("Error generating review:", err);
    alert("Failed to generate review. Check server logs.");
  }
}
function getScoreColor(score) {
  if (score >= 80) return '#4CAF50'; // Green
  if (score >= 60) return '#8BC34A'; // Light green
  if (score >= 40) return '#FFC107'; // Yellow
  if (score >= 20) return '#FF9800'; // Orange
  return '#F44336'; // Red
}

function getScoreDescription(score) {
  if (score >= 90) return 'Excellent code quality!';
  if (score >= 75) return 'Good code with minor improvements needed';
  if (score >= 60) return 'Fair code with several suggestions';
  if (score >= 40) return 'Needs significant improvements';
  return 'Poor quality - major revisions needed';
}
function MetricBadge({ theme, title, value, icon, small }) {
  return (
    <div style={{
      background: theme === 'dark' ? '#333' : '#eaeaea',
      padding: small ? '0.25rem' : '0.5rem',
      borderRadius: '4px',
      textAlign: 'center',
      fontSize: small ? '0.8rem' : '0.9rem'
    }}>
      <div style={{ fontSize: small ? '1rem' : '1.2rem' }}>{icon}</div>
      <div style={{ fontWeight: 'bold' }}>{value}</div>
      <div>{title}</div>
    </div>
  );
}

  return (
    <>
      <header style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', background: theme === 'light' ? '#f8f8f8' : '#222', color: theme === 'light' ? '#000' : '#fff' }}>
        <h2>Code Reviewer</h2>
        <button onClick={toggleTheme} style={{ cursor: 'pointer', padding: '0.5rem 1rem' }}>
          {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
        </button>
      </header>

      <main className={theme}>
        <div className="left">
          <div className="code">
            <Editor
              value={code}
              onValueChange={code => setCode(code)}
              highlight={code => prism.highlight(code, prism.languages.javascript, "javascript")}
              padding={10}
              style={{
                fontFamily: '"Fira code", "Fira Mono", monospace',
                fontSize: 16,
                border: "1px solid #ddd",
                borderRadius: "5px",
                height: "100%",
                width: "100%",
                background: theme === 'dark' ? '#1e1e1e' : '#fff',
                color: theme === 'dark' ? '#f8f8f2' : '#000'
              }}
            />
          </div>
          <div
            onClick={reviewCode}
            className="review"
          >Review</div>
        </div>
<div className="right" style={{ background: theme === 'dark' ? '#111' : '#fafafa', color: theme === 'dark' ? '#eee' : '#000' }}>
  {review?.reviewText ? (
    <>
      <div className="score-display" style={{
        background: theme === 'dark' ? '#222' : '#f0f0f0',
        padding: '0.5rem',
        borderRadius: '4px',
        marginBottom: '1rem'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: window.innerWidth < 768 ? 'column' : 'row',
          alignItems: 'center',
          gap: '1rem',
          padding: '0.5rem'
        }}>
          {/* Score Circle */}
          <div style={{
            width: window.innerWidth < 768 ? '50px' : '60px',
            height: window.innerWidth < 768 ? '50px' : '60px',
            borderRadius: '50%',
            background: `conic-gradient(
              ${getScoreColor(review.score)} ${review.score * 3.6}deg, 
              ${theme === 'dark' ? '#444' : '#ddd'} 0deg
            )`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <div style={{
              width: window.innerWidth < 768 ? '40px' : '50px',
              height: window.innerWidth < 768 ? '40px' : '50px',
              borderRadius: '50%',
              background: theme === 'dark' ? '#111' : '#fafafa',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: window.innerWidth < 768 ? '0.9rem' : '1rem'
            }}>
              {review.score}
            </div>
          </div>
          
          {/* Score Text */}
          <div style={{
            textAlign: window.innerWidth < 768 ? 'center' : 'left',
            flexGrow: 1
          }}>
            <h3 style={{ 
              margin: 0,
              fontSize: window.innerWidth < 768 ? '1rem' : '1.2rem'
            }}>Code Review Score</h3>
            <p style={{ 
              margin: '0.25rem 0', 
              fontSize: window.innerWidth < 768 ? '0.8rem' : '0.9rem'
            }}>
              {getScoreDescription(review.score)}
            </p>
          </div>
        </div>
        
        {/* Metrics */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: window.innerWidth < 768 ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
          gap: '0.5rem',
          marginTop: '1rem'
        }}>
          <MetricBadge 
            theme={theme}
            title="Insights"
            value={review.metrics?.insights || 0}
            icon="💡"
            small={window.innerWidth < 768}
          />
          <MetricBadge 
            theme={theme}
            title="Suggestions"
            value={review.metrics?.suggestions || 0}
            icon="✅"
            small={window.innerWidth < 768}
          />
          <MetricBadge 
            theme={theme}
            title="Issues"
            value={review.metrics?.issues || 0}
            icon="❌"
            small={window.innerWidth < 768}
            style={window.innerWidth < 768 ? { gridColumn: '1 / -1' } : {}}
          />
        </div>
      </div>
      
      <Markdown rehypePlugins={[rehypeHighlight]}>
        {review.reviewText}
      </Markdown>
    </>
  ) : (
    <p>No review generated yet.</p>
  )}
</div>

      </main>
    </>
  )
}

export default App
