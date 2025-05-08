import { Provider } from 'react-redux'
import React from 'react'
import * as ReactDOM from 'react-dom/client'
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './config/configureStore';
import App from './App.jsx';
import * as serviceWorker from './serviceWorker'
import './index.css'; 

const container = document.getElementById('root')
const root = ReactDOM.createRoot(container) // Create a root.

root.render(
  <React.StrictMode>
    <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <App />
      </PersistGate>
    </Provider>
  </React.StrictMode>
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()