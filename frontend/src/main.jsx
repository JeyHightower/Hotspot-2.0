import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import App from './App';
import Modal  from './components/Context/Modal';
import ModalProvider from './components/Context/ModalContext';
import configureStore from './store/store';

const store = configureStore();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <ModalProvider>
        <App />
        <Modal />
      </ModalProvider>
    </Provider>
  </React.StrictMode>
);
