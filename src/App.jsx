// App.jsx
import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Canvas from './Canvas';
import CanvasList from './CanvasList';
import useAuth from './Auth';
import MyCanvases from './MyCanvases';
import SignInSignUpComponent from './SignInSignUpComponent';

function App() {
  const { user, signIn, signUp, signOutUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const Navigation = () => {
    const navigate = useNavigate();
    return (
      <div>
        <button className='sign-out' onClick={signOutUser}>Sign Out</button>
        <button className='my-canvases' onClick={() => navigate('/my-canvases')}>My Canvases</button>
      </div>
    );
  };

  return (
    <div className="App">
      <Router>
        {user && <Navigation />}
        <Routes>
          <Route path="/canvas/:id" element={user ? <Canvas user={user} /> : <Navigate replace to="/" />} />
          <Route path="/" element={!user ? (
            <SignInSignUpComponent
              signIn={signIn}
              signUp={signUp}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
            />
          ) : <CanvasList />} />
          <Route path="/my-canvases" element={user ? <MyCanvases /> : <Navigate replace to="/" />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
