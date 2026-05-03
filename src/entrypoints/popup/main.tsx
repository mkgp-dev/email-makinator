import React from 'react';
import ReactDOM from 'react-dom/client';
import '@/assets/tailwind.css';
import './style.css';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Popup root element #root was not found.');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
