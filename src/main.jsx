import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { initTracking, loadPixel } from './utils/tracking.js';
import './styles.css';

// Capture attribution BEFORE first render so no route change can lose it.
initTracking();
loadPixel();

createRoot(document.getElementById('root')).render(
  <BrowserRouter><App /></BrowserRouter>
);
