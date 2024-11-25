import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import * as sessionActions from '../../store/session';
import './SignupFormPage.css';
const SignupFormPage = () => {
    const sessionUser = useSelector((state) => state.session.user);
    const navigate = useNavigate();
     const dispatch = useDispatch();

  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});

  //!redirect if user is already logged in (works when commented out it but breaks when commented in).
//   if (sessionUser) {
//     navigate('/', { replace: true });
//   }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === confirmPassword) {
      setErrors({});
      return dispatch(
        sessionActions.signupThunk({
          email,
          username,
          firstName,
          lastName,
          password,
        }),
      ).catch(async (res) => {
        const data = await res.json();
        if (data?.errors) {
          setErrors(data.errors);
        }
      });
    }
    return setErrors({
      confirmPassword:
        'Confirm Password field must be the same as the Password field',
    });
  };

  return (
    <>
      <h1>Sign Up</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="username">
          Username
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </label>
        {errors.username && <p>{errors.username}</p>}
        <label htmlFor="firstName">
          First Name
          <input
            id="firstName"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </label>
        {errors.firstName && <p>{errors.firstName}</p>}
        <label htmlFor="lastName">
          Last Name
          <input
            id="lastName"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </label>
        {errors.lastName && <p>{errors.lastName}</p>}
        <label htmlFor="email">
          E-mail
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        {errors.email && <p>{errors.email}</p>}
        <label htmlFor="password">
          Password
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {errors.password && <p>{errors.password}</p>}
        <label htmlFor="confirmPassword">
          Confirm Password
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </label>
        {errors.confirmPassword && <p>{errors.confirmPassword}</p>}
        <button type="submit">Sign Up</button>
      </form>
    </>
  );
}

export default SignupFormPage;
