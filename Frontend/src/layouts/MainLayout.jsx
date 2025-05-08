import * as React from 'react'
import { Outlet } from 'react-router-dom'

import Header from './header/header'

export default function MainLayout(props) { 
 // Render
  return (
    <>
        <Header />
        <Outlet />
    </>
  )
}
