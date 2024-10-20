import {API} from "../utility/apihandler";
import {useNavigate} from "react-router-dom";
import React, {useState} from "react";

const RegisterPage = () => {
    let navigate = useNavigate();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [message, setMessage] = useState('');

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setMessage("");

        if (username === '' || password === '' || passwordConfirm === '') {
            setMessage("Username or Password isn't set");
            return;
        }

        if (password !== passwordConfirm) {
            setMessage("Passwords do not match");
            return;
        }

        let result = await API.Register(username, password);
        if (!result) {
            setMessage("Error creating an account, try another username.");
            return;
        }

        navigate("/login");
    }

    function handleUsernameChange(e: React.ChangeEvent<HTMLInputElement>) {
        setUsername(e.target.value);
    }

    function handlePasswordChange(e: React.ChangeEvent<HTMLInputElement>) {
        setPassword(e.target.value);
    }

    function handlePasswordConfirmChange(e: React.ChangeEvent<HTMLInputElement>) {
        setPasswordConfirm(e.target.value);
    }

    return (
        <form onSubmit={handleSubmit}>
            <label>
                Username:
                <input onChange={handleUsernameChange} type="text" />
            </label>
            <label>
                Password:
                <input onChange={handlePasswordChange} type="password" />
            </label>
            <label>
                Confirm Password:
                <input onChange={handlePasswordConfirmChange} type="password" />
            </label>
            <button type="submit" value="submit">Log In</button>
            <div>{message}</div>
        </form>
    )
}

export default RegisterPage;