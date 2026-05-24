import React, { useContext, useState } from "react";
import "./LoginPopup.css";
import { assets } from "../../assets/frontend_assets/assets";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";
import { toast } from "react-toastify";

const LoginPopup = ({ setShowLogin }) => {
  const { url, setToken } = useContext(StoreContext);
  const [currentState, setCurrentState] = useState("Login");
  const [showPassword, setShowPassword] = useState(false);

  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const onLogin = async (event) => {
    event.preventDefault();
    let newUrl = url;
    if (currentState === "Login") {
      newUrl += "/api/user/login";
    } else {
      newUrl += "/api/user/register";
    }
    const response = await axios.post(newUrl, data);
    if (response.data.success) {
      setToken(response.data.token);
      localStorage.setItem("token", response.data.token);
      toast.success("Login Successfully");
      setShowLogin(false);
    } else {
      toast.error(response.data.message);
    }
  };

  return (
    <div className="login-popup" role="dialog" aria-modal="true">
      <form onSubmit={onLogin} className="login-popup-container">
        <button
          type="button"
          className="login-popup-close"
          onClick={() => setShowLogin(false)}
          aria-label="Close"
        >
          <img src={assets.cross_icon} alt="" />
        </button>

        <div className="login-popup-tabs" role="tablist" aria-label="Auth tabs">
          <button
            type="button"
            className={currentState === "Login" ? "active" : ""}
            onClick={() => setCurrentState("Login")}
          >
            Login
          </button>
          <button
            type="button"
            className={currentState === "Sign Up" ? "active" : ""}
            onClick={() => setCurrentState("Sign Up")}
          >
            Sign Up
          </button>
          <div
            className="login-popup-tab-indicator"
            style={{ transform: currentState === "Login" ? "translateX(0)" : "translateX(100%)" }}
          />
        </div>

        <div className="login-popup-title">
          <h2>{currentState}</h2>
          <p>Welcome back. Let’s get you ordering fast.</p>
        </div>

        <div className="login-popup-inputs">
          {currentState === "Sign Up" ? (
            <div className="login-popup-field">
              <span className="login-popup-icon" aria-hidden="true">👤</span>
              <input
                name="name"
                onChange={onChangeHandler}
                value={data.name}
                type="text"
                placeholder="Your name"
                required
              />
            </div>
          ) : null}

          <div className="login-popup-field">
            <span className="login-popup-icon" aria-hidden="true">📧</span>
            <input
              name="email"
              onChange={onChangeHandler}
              value={data.email}
              type="email"
              placeholder="Email"
              required
            />
          </div>

          <div className="login-popup-field login-popup-field-password">
            <span className="login-popup-icon" aria-hidden="true">🔒</span>
            <input
              name="password"
              onChange={onChangeHandler}
              value={data.password}
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              required
            />

            <button
              type="button"
              className="login-popup-password-toggle"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <div className="login-popup-forgot">
            <a href="#" onClick={(e) => e.preventDefault()}>
              Forgot Password?
            </a>
          </div>
        </div>

        <button type="submit" className="login-popup-submit">
          {currentState === "Sign Up" ? "Create Account" : "Login"}
        </button>

        <label className="login-popup-condition">
          <input type="checkbox" required />
          <span>
            By continuing, i agree to the terms of use & privacy policy.
          </span>
        </label>

        {currentState === "Login" ? (
          <p className="login-popup-switch">
            Create new account?{" "}
            <span onClick={() => setCurrentState("Sign Up")}>Click here</span>
          </p>
        ) : (
          <p className="login-popup-switch">
            Already have an account?{" "}
            <span onClick={() => setCurrentState("Login")}>Login here</span>
          </p>
        )}
      </form>
    </div>
  );
};

export default LoginPopup;

