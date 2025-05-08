import { Route, createBrowserRouter, createRoutesFromElements, RouterProvider } from 'react-router-dom';
import React from 'react';
import Home from './pages/Home';
import SignIn from './pages/auth/SignIn';
import MainLayout from './layouts/MainLayout';

const router = createBrowserRouter(
    createRoutesFromElements(
        <Route path='/' element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path='/login' element={<SignIn />} />
        </Route>
    )
);

function App() {
    return (
        <RouterProvider router={router} />
    );
}
export default App;
