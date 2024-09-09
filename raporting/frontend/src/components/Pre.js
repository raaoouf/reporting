import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignInAlt } from '@fortawesome/free-solid-svg-icons';
import './Pre.css'; // Importer le fichier CSS
import Image from './Image.png'
function Pre() {
  return (
    <div className="background">
      <div className="contact">
      <img src={Image} alt="Your Image" />  
      <a href="http://127.0.0.1:8000/auth" className="button">Connexion <FontAwesomeIcon icon={faSignInAlt} /></a>
        <div className="content">
          <h2>HSE</h2>
          <p>
            La santé, la sécurité et l'environnement (HSE) est un domaine qui concerne la protection de la santé,
          </p>
          <p>
            la sécurité et l'environnement des individus au travail et dans la société en général.
          </p>
          <p>
            Il comprend la prévention des accidents, des maladies professionnelles et des incidents environnementaux,
            ainsi que la promotion de pratiques durables et responsables.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Pre;
