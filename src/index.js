import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

const path = window.location.pathname;

let App;
if (path.startsWith('/admin')) {
  App = React.lazy(() => import('./admin-radar-da-bola'));
} else if (path.startsWith('/instagram')) {
  App = React.lazy(() => import('./instagram-radar-da-bola'));
} else {
  App = React.lazy(() => import('./portal-radar-da-bola'));
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.Suspense fallback={<div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',fontFamily:'Arial',color:'#888'}}>Carregando...</div>}>
    <App />
  </React.Suspense>
);
