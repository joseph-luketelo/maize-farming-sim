import { Route, Routes, createBrowserRouter, createRoutesFromElements, RouterProvider } from 'react-router-dom';
import React from 'react';
import HomePage from './pages/HomePage';
import LoginPage from './pages/login/login';
const router = createBrowserRouter(
    createRoutesFromElements(
        <Route>
    <Route index element={<LoginPage />} />
    <Route path='/home' element={<HomePage />} />
    </Route>
)
    
);

function App() {
    return (
        <RouterProvider router={router} />
    );
}


export default App;
