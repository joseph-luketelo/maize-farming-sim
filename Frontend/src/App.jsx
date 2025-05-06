import { Route, Routes, createBrowserRouter, createRoutesFromElements, RouterProvider } from 'react-router-dom';
import React from 'react';
import Home from './pages/Home';
import SignIn from './pages/auth/SignIn';
const router = createBrowserRouter(
    createRoutesFromElements(
        <Route>
    <Route index element={<SignIn />} />
    <Route path='/home' element={<Home />} />
    </Route>
)
    
);

function App() {
    return (
        <RouterProvider router={router} />
    );
}


export default App;
