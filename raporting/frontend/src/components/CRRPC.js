import React, { useState, useEffect } from 'react';
import Image from './Image.png';

const CRRPC = () => {
  const [tableData, setTableData] = useState([]);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [site, setSite] = useState('');
  const [user, setUser] = useState({});

  useEffect(() => {
    // Récupérer les données du localStorage pour l'utilisateur
    const userData = JSON.parse(localStorage.getItem('user')) || {};
    setUser(userData);
  }, []);

  useEffect(() => {
    if (selectedDate && site) {
      fetchBrqData();
    }
  }, [selectedDate, site, user]);
  const handlePrintCR = () => {
    if (selectedDate && site && tableData.length > 0) {
      const tempAiFromTableData = tableData[0].temp_ai.toString();
      const url = `http://127.0.0.1:8000/api/compte_rendu/${selectedDate}/${site}/${tempAiFromTableData}`;
      window.open(url, '_blank');
    }
  };
  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  const handleSiteChange = (event) => {
    setSite(event.target.value);
  };

  const fetchBrqData = async () => {
    try {
        const response = await fetch(`http://127.0.0.1:8000/api/get-brq-con/?selected_date=${selectedDate}&site=${site}`, {
            method: 'GET',
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setTableData(data);
    } catch (error) {
      console.error('Error fetching CR data:', error);
      setError('Error fetching CR data');
    }
  };

  return (
    <div style={{ textAlign: 'center' }}>
      {/* Champ de sélection de date */}
      <label htmlFor="date" style={{ marginRight: '10px' }}>Date:</label>
      <input
        type="date"
        id="date"
        value={selectedDate}
        onChange={handleDateChange}
        style={{ width: '150px' }}
      />

      {/* Sélection du site */}
      <label htmlFor="site" style={{ marginRight: '10px', marginLeft: '20px' }}>Site:</label>
      <select id="site" value={site} onChange={handleSiteChange} style={{ width: '150px' }}>
        <option value="">Sélectionner un site</option>
        <option value="RA1K">RA1K</option>
        <option value="RA2K">RA2K</option>
        <option value="RA1G">RA1G</option>
        <option value="RA1Z">RA1Z</option>
        <option value="RA1D">RA1D</option>
        <option value="CP1K">CP1K</option>
        <option value="CP2K">CP2K</option>
      </select>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button onClick={handlePrintCR} style={{ marginLeft: '10px' }}>Imprimer le compte rendu</button>

      <table border="1" style={{ width: '50%', margin: '0 auto', tableLayout: 'fixed', wordWrap: 'break-word', backgroundColor: '#f2f2f2' }}>
        {/* Table header */}
        <thead>
          <tr>
            <th style={{ height: '100px' }}>
              <img src={Image} alt="Your Image" style={{ height: '100px', width: 'auto' }} />
            </th>
            <th colSpan="2" style={{ height: '100px' }}>Compte-rendu d’accident / incident</th>
          </tr>
        </thead>
        {/* Table body */}
        <tbody>
          {tableData.map((ligne, rowIndex) => (
            <React.Fragment key={rowIndex}>
              {/* Rows for each item in tableData */}
              {/* Replace ligne.key with appropriate keys from your data */}
              <tr>
                <td colSpan="3" style={{ height: '50px' }}><strong>1. Classe d’accident :</strong> {ligne.clas_ai}</td>
              </tr>
              <tr>
                <td colSpan="2" style={{ height: '50px' }}><strong>2. Site :</strong> {ligne.site}</td>
                <td style={{ height: '50px' }}><strong>Lieu :</strong> {ligne.lieu_ai}</td>
              </tr>
              <tr>
                <td colSpan="2" style={{ height: '50px' }}><strong>3. Date :</strong> {ligne.date_ai}</td>
                <td style={{ height: '50px' }}><strong>Heure :</strong> {ligne.temp_ai}</td>
              </tr>
              <tr>
                <td colSpan="3" style={{ height: '50px' }}><strong>4. Description du lieu et des installations impliquées :</strong> {ligne.desc_lieu}</td>
              </tr>
              <tr>
                <td colSpan="3" style={{ height: '50px' }}><strong>5. Description de l’événement déroulement des faits :</strong> {ligne.desc_deroulement}</td>
              </tr>
              <tr>
                <td colSpan="3" style={{ height: '50px' }}><strong>6. Description des dommages avérés et potentiels :</strong></td>
              </tr>
              <tr>
                <td style={{ height: '50px' }}><strong>Aux personnes:</strong> {ligne.desc_dmg_personne}</td>
                <td style={{ height: '50px' }}><strong>À l’environnement:</strong> {ligne.desc_dmg_env}</td>
                <td style={{ height: '50px' }}><strong>Aux biens:</strong> {ligne.desc_dmg_biens}</td>
              </tr>
              <tr>
                <td colSpan="3" style={{ height: '50px' }}><strong>7. Causes évidentes :</strong> {ligne.cause_ai}</td>
              </tr>
              <tr>
                <td colSpan="2" style={{ height: '180px', verticalAlign: 'top' }}>
                  <strong>Établissement du CR :</strong>
                </td>
                <td colSpan="1" style={{ height: '180px', verticalAlign: 'top' }}>
                  <strong>Validation du CR :</strong>
                </td>
              </tr>
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CRRPC;
