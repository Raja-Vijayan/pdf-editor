import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

import 'bootstrap/dist/css/bootstrap.min.css';
import './assets/css/material-dashboard.css'
import './assets/css/material-dashboard.min.css'
import './assets/css/nucleo-icons.css'
import './assets/css/nucleo-svg.css'
import './assets/css/material-dashboard.css.map'
import 'perfect-scrollbar/css/perfect-scrollbar.css';
import 'react-perfect-scrollbar/dist/css/styles.css';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

reportWebVitals();
