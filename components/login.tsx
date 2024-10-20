import {API} from "../utility/apihandler";
import {useNavigate} from "react-router-dom";
import React, {useEffect, useState} from "react";

const LoginPage = ({logout}: {logout: boolean}) => {
    let navigate = useNavigate();


    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (API.Authenticated()) {
            navigate("/");
        }

        if (logout) {
            API.Logout();
            navigate("/login");
        }
    }, []);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setMessage("");

        if (username === '' || password === '') {
            setMessage("Username or Password isn't set");
            return;
        }

        let result = await API.Login(username, password);
        if (!result) {
            setMessage("Invalid Username or Password");
            return;
        }

        navigate("/");
    }

    function handleUsernameChange(e: React.ChangeEvent<HTMLInputElement>) {
        setUsername(e.target.value);
    }

    function handlePasswordChange(e: React.ChangeEvent<HTMLInputElement>) {
        setPassword(e.target.value);
    }

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <label>
                    Username:
                    <input onChange={handleUsernameChange} type="text"/>
                </label>
                <label>
                    Password:
                    <input onChange={handlePasswordChange} type="password"/>
                </label>
                <button type="submit" value="submit">Log In</button>
                <div>{message}</div>
            </form>
        </div>
    )
}

export default LoginPage;