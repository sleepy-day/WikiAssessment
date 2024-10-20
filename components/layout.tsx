import React from 'react';
import { Outlet } from 'react-router-dom'
import NavBar from "./navbar";

function Layout() {
    return (
        <div>
            <NavBar />
            <Outlet />
        </div>
    )
}

export default Layout;