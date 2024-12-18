import { useState } from 'react';
import { useDispatch } from 'react-redux';
import * as sessionActions from '../../store/session';
import { useModal } from '../Context/useModal';
import './LoginFormModal.css';
import '../styles/ModalBase.css';

const LoginFormModal = () => {
  const dispatch = useDispatch();
  const { closeModal } = useModal();
  const [credential, setCredential] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  const resetForm = () => {
    setCredential('');
    setPassword('');
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
        setErrors({ credential: 'The provided credentials were invalid' });
      }
    }
  };

  const handleDemoLogin = (e) => {
    e.preventDefault();
    return dispatch(sessionActions.loginThunk({ 
      credential: "demo@user.io",
      password: "password"
    }))
    .then(closeModal)
    .catch((error) => {
      if (error instanceof Response) {
        error.json().then(data => {
          console.log("Error data:", data);
          if (data?.errors) setErrors(data.errors);
        });
      } else {
        console.log("Login error:", error);
        setErrors({ credential: 'An error occurred during login' });
      }
    });
  };

  const loginDisabled = credential.length < 4 || password.length < 6;

  return (
    <div className="login-modal">
      <h1>Log In</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Username or Email
          <input
            type="text"
            value={credential}
            onChange={(e) => setCredential(e.target.value)}
            placeholder='Username or Email'
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder='Password'
            required
          />
        </label>
        {errors.credential && <p className="error">{errors.credential}</p>}
        {errors.password && <p className="error">{errors.password}</p>}
        {errors.general && <p className="error">{errors.general}</p>}
        <button type="submit" onClick={handleSubmit} disabled={loginDisabled}>
          Log In
        </button>
        <button type="button" onClick={handleDemoLogin} className="demo-button">
          Demo User
        </button>
      </form>
    </div>
  );
};

export default LoginFormModal;
