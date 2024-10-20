import React from 'react';
import {Link} from "react-router-dom";
import {API} from "../utility/apihandler";

const SignedOutElements = () => {
    return <span><Link to={"/login"}>Log In</Link><span> </span> <Link to={"/register"}>Register</Link></span>
}

const SignedInElements = () => {
    return <span>
        <Link to={"/"}>Home</Link><span> </span>
        <Link to={"/logout"}>Log Out</Link><span> </span>
        <Link to={"/edit/page/new"}>Create Page</Link>
    </span>
}

const NavBar = () => {
    return (
        <div >
            {API.Authenticated() ? SignedInElements() : SignedOutElements()}
        </div>
    )
}

export default NavBar;