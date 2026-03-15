import React from 'react';
import { useNavigate } from 'react-router-dom';

const TestPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '50px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '20px' }}>Button Test Page</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => {
            console.log('Test button clicked!');
            alert('Button clicked! Navigating to /login');
            navigate('/login');
          }}
          style={{
            padding: '15px 30px',
            fontSize: '18px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Test Login Navigation
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => {
            console.log('Register button clicked!');
            alert('Button clicked! Navigating to /patient-register');
            navigate('/patient-register');
          }}
          style={{
            padding: '15px 30px',
            fontSize: '18px',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Test Register Navigation
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => {
            console.log('Home button clicked!');
            alert('Button clicked! Navigating to /home');
            navigate('/home');
          }}
          style={{
            padding: '15px 30px',
            fontSize: '18px',
            backgroundColor: '#6366f1',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Back to Home
        </button>
      </div>

      <div style={{ marginTop: '40px', padding: '20px', backgroundColor: 'white', borderRadius: '8px' }}>
        <h2>Instructions:</h2>
        <ol>
          <li>Click each button above</li>
          <li>You should see an alert popup</li>
          <li>Then the page should navigate</li>
          <li>Check browser console for logs</li>
        </ol>
        <p style={{ marginTop: '20px', color: '#666' }}>
          If buttons don't work here, there's a React Router or browser issue.
          If they work here but not on Home page, it's a CSS/styling issue.
        </p>
      </div>
    </div>
  );
};

export default TestPage;
