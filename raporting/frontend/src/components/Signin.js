import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Signin.css'; // Importez le fichier CSS spécifique à la page de connexion
import Image from './Image.png';

const Signin = ({ setUser }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8000/api/token/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('user', JSON.stringify(data));
        setUser(data);

        // Redirect based on the user's site
        if (data.site === 'DCRPC') {
          window.location.href = '/viewBrq';
        } else {
          if (data.role === 'inj-ui') {
            window.location.href = '/test';
          } else {
            window.location.href = '/testetu';
          }
        }
      } else {
        // Handle login error
        setErrorMessage('Nom d\'utilisateur ou mot de passe incorrect.');
        console.error('Erreur lors de la connexion:', response.statusText);
      }
    } catch (error) {
      console.error('Erreur de requête:', error.message);
    }
  };

  return (
    <div className="signin-page">
      <div className="signin-container">
        <div className="form-container">
          <img src={Image} alt="Photo" className="header-photo" />
          {/* Display the error message if there is one */}
          {errorMessage && <div className="error-message">{errorMessage}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button type="submit">Se connecter</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signin;
