import React, { useState, useEffect } from 'react';
import './Table.css'; // Assurez-vous que le fichier CSS est correctement importé
import Image from './Image.png';
import CheckIcon from '@material-ui/icons/Check'; // Importez l'icône de succès depuis Material-UI

function BrqForTodayPage() {
  const [brqData, setBrqData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false); // State pour afficher l'alerte de succès

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/get-brq-consolide/');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const jsonData = await response.json();
        setBrqData(jsonData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Error fetching data. Please try again later.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleValidation = async () => {
    try {
      const userState = JSON.parse(localStorage.getItem('user'));
      const date = new Date().toLocaleDateString();
      const site = userState ? userState.site : null;
      const userName = userState ? userState.username : null;

      const requestBody = {
        date: date,
        site: site,
        validated_by: userName
      };

      const response = await fetch('http://127.0.0.1:8000/api/valider-brq/', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${userState.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error('Validation failed');
      }

      fetchData(); // Rechargez les données après la validation réussie

      // Afficher l'alerte de succès
      setShowSuccessAlert(true);
      setTimeout(() => {
        setShowSuccessAlert(false);
      }, 5000); // 5000 millisecondes = 5 secondes
    } catch (error) {
      console.error('Error validating BRQs:', error);
    }
  };


  return (
    <div className="table-container">
     
      <div className="header-container">
      
        <img className="image" src={Image} alt="Your Image" />
        <h1 className="activite">Bulletin de Reporting Quotidien (BRQ)</h1>
      </div>
      {showSuccessAlert && (
        <div className="success-alert">
          <p><CheckIcon fontSize="inherit" /> Validation réussie!</p>
        </div>
      )}
      <div className="date-rectangle">
        <p>Date: {new Date().toLocaleDateString()}</p> {/* Ajoutez ici la date */}
      </div>

      <div className="activity-header">
       
        <a href="http://127.0.0.1:8000/api/PDF" target="_blank" className="print-button">Imprimer BRQ</a>
      </div>

      <div className="brq-data">
        <table>
          <thead>
          <tr>
            <th rowSpan="2">Structure</th>
            <th rowSpan="2">Date</th>
            <th rowSpan="2">Heure</th>
            <th rowSpan="2">Lieu</th>
            <th rowSpan="2">Nature</th>
            <th rowSpan="2">Description Succincte</th> 
            <th rowSpan="2">Cause de l'incident / accident</th>
            <th colSpan="4">Fatalités</th>
            <th rowSpan="2">Nombre Blessés</th>
            <th colSpan="3">Description</th>
            <th rowSpan="2">Disposition prise</th>
          </tr>
          <tr>
            <th colSpan="1">entreprise</th>
            <th colSpan="1">prestataire</th>
            <th colSpan="1">tiers</th>
            <th colSpan="1">étrangers</th>
            <th colSpan="1">corporels</th>
            <th colSpan="1">matériels</th>
            <th colSpan="1">environnementaux</th>
          </tr>
          </thead>
          <tbody>
            {brqData.length > 0 ? (
              brqData.map((item) => (
                <tr key={item.id}>
                  <td>{item.site_ai}</td>
                  <td>{item.date_ai}</td>
                  <td>{item.heure_ai}</td>
                  <td>{item.lieu_ai}</td>
                  <td>{item.nature}</td>
                  <td>{item.desc_succincte}</td>
                  <td>{item.cause_ai}</td>
                  <td>{item.fatal_entreprise}</td>
                  <td>{item.fatal_prestataire}</td>
                  <td>{item.fatal_tiers}</td>
                  <td>{item.fatal_etrangers}</td>
                  <td>{item.nbr_blesse}</td>
                  <td>{item.desc_degats_corporels}</td>
                  <td>{item.desc_degats_materiels}</td>
                  <td>{item.desc_degats_environnementaux}</td>
                  <td>{item.dispositons_prise}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="16">No data available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="submit-button-container">
        <button className="submit-button1"onClick={handleValidation} >Valider</button>
      </div>
    </div>
  );
}

export default BrqForTodayPage;
