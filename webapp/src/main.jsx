import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import Test from './Test.jsx'

// TEMPORARY: Testing if React renders
const USE_TEST = false;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {USE_TEST ? <Test /> : <App />}
  </React.StrictMode>,
)
