import { Route, Routes, createBrowserRouter, createRoutesFromElements, RouterProvider } from 'react-router-dom';
import React from 'react';
import Home from './pages/Home';
import SignIn from './pages/auth/SignIn';
import Header from './layouts/header/header';
import { useDispatch, useSelector } from 'react-redux';
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
    const dispatch = useDispatch()
    //dispatch(authActions.setAccountCreationKey(false))
    const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
    console.log(isLoggedIn)
    return (
        <RouterProvider router={router} />
    );
}
export default App;
