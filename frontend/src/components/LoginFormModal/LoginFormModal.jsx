import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useModal } from '../Context/ModalContext';
import * as sessionActions from '../../store/session';
import './LoginFormModal.css';

const LoginFormModal = () => {
  const dispatch = useDispatch();
  const [credential, setCredential] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const { closeModal } = useModal();

  const resetForm = () => {
    setCredential('');
    setPassword('');
    setErrors({});
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});
  
    return dispatch(sessionActions.loginThunk({ credential, password }))
      .then(closeModal)
      .catch(async (res) => {
        const data = await res.json();
        if (data && data.errors) {
          setErrors(data.errors);
        } else {
          setErrors({ credential: "The provided credentials were invalid" });
        }
      });
  };

  const handleDemoLogin = (e) => {
    e.preventDefault();
    return dispatch(sessionActions.loginThunk({credential: 'demo@user.io', password: 'password1'}))
    .then(() => {
      resetForm();
      closeModal();
    });
  };

       const loginDisabled = credential.length < 4 || password.length < 6;

  return (
    <>
      <h1>Log In</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Username or Email
          <input
            type="text"
            value={credential}
            onChange={(e) => setCredential(e.target.value)}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {errors.credential && <p className="error">{errors.credential}</p>}
        {errors.password && <p className="error">{errors.password}</p>}
        {errors.general && <p className="error">{errors.general}</p>}
        <button type="submit" disabled={loginDisabled}>Log In</button>
        <button type="button" onClick={handleDemoLogin} className="demo-button">
          Demo User
        </button>
      </form>
    </>
  );
};

export default LoginFormModal;
