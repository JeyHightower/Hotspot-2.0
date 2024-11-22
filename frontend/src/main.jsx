import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import configureStore from './store/store';
import { Provider } from 'react-redux';
import './index.css';

const store = configureStore();

if (process.env.NODE_ENV !== 'production') {
  window.store = store;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
