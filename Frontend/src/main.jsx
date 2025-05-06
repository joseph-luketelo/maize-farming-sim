import React from 'react'; // Import the core React library
import ReactDOM from 'react-dom/client'; // Import ReactDOM for web rendering
import App from './App.jsx'; // Import your main App component (assuming it's in App.jsx in the same directory)
import './index.css'; // Import your main CSS file (assuming it's in index.css in the same directory)

// Find the HTML element where the React app will be mounted.
// In a typical Vite project, this is a div with the ID 'root' in index.html.
const rootElement = document.getElementById('root');

// Create a React root for the DOM element.
// This is the modern way to render React applications.
ReactDOM.createRoot(rootElement).render(
    // React.StrictMode is a helper component that activates additional checks
    // and warnings for its descendants during development.
    <React.StrictMode>
        {/* Render your main App component */}
        <App />
    </React.StrictMode>,
);
