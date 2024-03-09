// App.jsx
import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Canvas from './Canvas';
import CanvasList from './CanvasList';
import useAuth from './Auth';

function App() {
  const { user, signIn, signUp, signOutUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const SignInSignUpComponent = () => (
    <div className='signIn'>
      <h1>Open Paint</h1>
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button onClick={() => signIn(email, password)}>Sign In</button>
      <button onClick={() => signUp(email, password)}>Sign Up</button>
    </div>
  );

  return (
    <div className="App">
      <Router>
        {user && <button className='sign-out' onClick={signOutUser}>Sign Out</button>}
        <Routes>
          <Route path="/canvas/:id" element={user ? <Canvas user={user} /> : <Navigate replace to="/" />} />
          <Route path="/" element={!user ? <SignInSignUpComponent /> : <CanvasList />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
