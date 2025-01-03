import { useState } from "react";
import { useDispatch } from "react-redux";
import * as sessionActions from "../../store/session";
import { useModal } from "../Context/useModal";
import "../styles/ModalBase.css";
import "./LoginFormModal.css";

const LoginFormModal = () => {
  const dispatch = useDispatch();
  const { closeModal } = useModal();
  const [credential, setCredential] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});

  const resetForm = () => {
    setCredential("");
    setPassword("");
    setErrors({});
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    try {
      await dispatch(sessionActions.loginThunk({ credential, password }));
      resetForm();
      closeModal();
    } catch (res) {
      const data = await res.json();
      if (data && data.errors) {
        setErrors(data.errors);
      } else {
        setErrors({ credential: "The provided credentials were invalid" });
      }
    }
  };

  const handleDemoLogin = (e) => {
    e.preventDefault();
    return dispatch(
      sessionActions.loginThunk({
        credential: "demo@user.io",
        password: "password",
      })
    )
      .then(closeModal)
      .catch(async (error) => {
        console.log("Login error response:", error);
        if (error instanceof Response) {
          const data = await error.json();
          console.log("Error data:", data);
          setErrors(data.errors || { credential: "Invalid credentials" });
        }
      });
  };

  const loginDisabled = credential.length < 4 || password.length < 6;

  return (
    <div className="modal-overlay" onClick={closeModal}>
      <div
        className="modal-base login-form-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <h1>Log In</h1>
        <form onSubmit={handleSubmit}>
          <label>
            Username or Email
            <input
              type="text"
              value={credential}
              onChange={(e) => setCredential(e.target.value)}
              placeholder="Username or Email"
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
            />
          </label>
          {errors.credential && <p className="error">{errors.credential}</p>}
          {errors.password && <p className="error">{errors.password}</p>}
          {errors.general && <p className="error">{errors.general}</p>}
          <button type="submit" onClick={handleSubmit} disabled={loginDisabled}>
            Log In
          </button>
          <button
            type="button"
            onClick={handleDemoLogin}
            className="demo-button"
          >
            Demo User
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginFormModal;
