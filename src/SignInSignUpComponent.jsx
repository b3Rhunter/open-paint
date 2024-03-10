import PropTypes from 'prop-types';

const SignInSignUpComponent = ({ signIn, signUp, email, setEmail, password, setPassword }) => (
    <div className='signIn'>
      <h1>Open Paint</h1>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={() => signIn(email, password)}>Sign In</button>
      <button onClick={() => signUp(email, password)}>Sign Up</button>
    </div>
  );

SignInSignUpComponent.propTypes = {
   signIn: PropTypes.func.isRequired,
   signUp: PropTypes.func.isRequired,
   email: PropTypes.string.isRequired,
   setEmail: PropTypes.func.isRequired,
   password: PropTypes.string.isRequired,
   setPassword: PropTypes.func.isRequired,
};
  export default SignInSignUpComponent;