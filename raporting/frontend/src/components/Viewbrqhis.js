import React, { useState } from 'react';
import './Table.css';
import Image from './Image.png';

function GetBrqByDateOwnSite() {
  const [selectedDate, setSelectedDate] = useState('');
  const [brqData, setBrqData] = useState(null);
  const userState = JSON.parse(localStorage.getItem('user'));
  const site = userState ? userState.site : null;
  const token = userState ? userState.token : null;

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  const fetchBrqData = async () => {
    if (!selectedDate || !site || !token) {
      alert('Please select a valid date and ensure that the site and token are available.');
      return;
    }

    try {
      console.log("Fetching BRQ data...");
      console.log('Site:', site);

      const response = await fetch(`http://127.0.0.1:8000/api/gethis/?selected_date=${selectedDate}&site=${site}`, {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      console.log("BRQ Data:", data);
      setBrqData(data);
    } catch (error) {
      console.error('Error fetching BRQ data:', error);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    fetchBrqData();
  };

  return (
    <div className="table-container">
      <div className="header-container">
        <img className="image" src={Image} alt="Your Image" />
        <h1 className="activite">Bulletin de Reporting Quotidien (BRQ)</h1>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="date-select1">
          <label htmlFor="date-select">Select a date:</label>
          <input type="date" id="date-select" value={selectedDate} onChange={handleDateChange} />
        </div>
        <button type="submit">GET BRQ</button>
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
            {brqData ? (
              brqData.map(item => (
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

export default GetBrqByDateOwnSite;
