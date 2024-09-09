import React, { useState, useEffect } from 'react';
import './Table.css'; // Assurez-vous que le fichier CSS est correctement importé
import Image from './Image.png';

function BrqByDatePage() {
  const [brqData, setBrqData] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSite, setSelectedSite] = useState('');
  const [user, setUser] = useState({});

  useEffect(() => {
    // Récupérer les données du localStorage pour le rôle utilisateur
    const userData = JSON.parse(localStorage.getItem('user')) || {};
    setUser(userData);
  }, []);

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  const handleSiteChange = (event) => {
    setSelectedSite(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/get-brq-con/?selected_date=${selectedDate}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const jsonData = await response.json();
      setBrqData(jsonData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  return (
    <div className="table-container">
      <div className="header-container">
        <img className="image" src={Image} alt="Your Image" />
        <h1 className="activite">Bulletin de Reporting Quotidien (BRQ)</h1>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="date-select">Select a date:</label>
          <input type="date" id="date-select" value={selectedDate} onChange={handleDateChange} />
        </div>
       
        <div style={{ display: 'flex', alignItems: 'center' }}>
  <button type="submit">GET BRQ</button>
  <div className="activity-header" style={{ marginLeft: '14px', width: '120px' }}>
    <a href={`http://127.0.0.1:8000/api/PDFBYDATE?selected_date=${selectedDate}`} target="_blank" className="print-button">Imprimer BRQ</a>
  </div>
</div>



      </form>
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
              <th>entreprise</th>
              <th>prestataire</th>
              <th>tiers</th>
              <th>étrangers</th>
              <th>corporels</th>
              <th>matériels</th>
              <th>environnementaux</th>
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
    </div>
  );
}

export default BrqByDatePage;
