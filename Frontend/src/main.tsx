import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';

// import './assets/css/bootstrap.min.css';
// import './assets/css/animate.min.css';
// import './assets/css/fontawesome-all.min.css';
// import './assets/css/react-odometer-theme.css';
// import './assets/css/default.css';
// import './assets/css/style.css';
// import './assets/css/responsive.css';
// import 'bootstrap/dist/js/bootstrap.bundle.min.js'

// import "bootstrap/dist/js/bootstrap.bundle.min";
import 'react-toastify/dist/ReactToastify.css'


// import './index.css'


const rootElement = document.getElementById('root') as HTMLElement;


const root = createRoot(rootElement);
root.render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);






