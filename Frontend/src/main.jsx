import { Provider } from 'react-redux'
import React from 'react'
import * as ReactDOM from 'react-dom/client'

// import 'antd/dist/antd.css';

import App from './App.jsx';
import configureStore from './config/configureStore'
import * as serviceWorker from './serviceWorker'

import './index.css'; 
import SignIn from './pages/auth/SignIn.jsx';

const store = configureStore()
const container = document.getElementById('root')
const root = ReactDOM.createRoot(container) // Create a root.

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()