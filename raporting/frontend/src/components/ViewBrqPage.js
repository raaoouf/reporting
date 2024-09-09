import React, { useState, useEffect } from 'react';
import './Table.css';
import Image from './Image.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import Modal from 'react-modal';
import { AiOutlineBgColors } from 'react-icons/ai';
// Importez le CSS de la bibliothèque de modal, si nécessaire
import CheckIcon from '@material-ui/icons/Check'; // Importez l'icône de succès depuis Material-UI





// Utilisez les styles personnalisés dans votre modal


function ViewBrqPage() {
  const [tableData, setTableData] = useState([]);
  const [userRole, setUserRole] = useState('');
  const [showClaimInput, setShowClaimInput] = useState(false);
  const [claimText, setClaimText] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const user = JSON.parse(localStorage.getItem('user'));
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
// Définissez les styles du modal
const customModalStyles = {
  content: {
    width: '60%', // Réduisez la largeur du modal à 60% de la fenêtre
    margin: 'auto', // Centrez le modal horizontalement
    top: '50%', // Placez-le à 50% du haut de la fenêtre
    left: '50%', // Placez-le à 50% de la gauche de la fenêtre
    transform: 'translate(-50%, -50%)', // Centrez le modal verticalement
    padding: '20px', // Ajoutez un peu de rembourrage
    border: '1px solid rgba(0, 0, 0, 0.4)', // Ajoutez une bordure noire légère
    borderRadius: '8px', // Ajoutez un peu de bordure arrondie
    backgroundColor: '#f5f5f5', // Couleur blanche avec 80% d'opacité
  },
};

const showSuccessMessage = () => {
  setShowSuccessAlert(true);
  setTimeout(() => {
    setShowSuccessAlert(false);
  }, 5000); // 5000 millisecondes = 5 secondes
};
  const fetchData = async () => {
    try {
      const userState = JSON.parse(localStorage.getItem('user'));
      const site = userState ? userState.site : null;
      const userRole = userState ? userState.role : null;
      setUserRole(userRole);

      if (!site || !userRole) {
        console.error('Site information or user role not found in local storage');
        return;
      }

      const response = await fetch(`http://127.0.0.1:8000/api/sitej/`, {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const jsonData = await response.json();
      setTableData(jsonData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleEditSubmit = async (item) => {
    try {
      const { site_ai, date_ai, temp_ai } = item;
      const response = await fetch(`http://127.0.0.1:8000/api/update-brq/${site_ai}/${date_ai}/${temp_ai}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(item)
      });
      if (!response.ok) {
        throw new Error('Failed to update BRQ');
      }
      fetchData();
      closeModal();
      window.location.reload();
    } catch (error) {
      console.error('Error updating BRQ:', error);
    }
  };

  const handleDelete = async (item) => {
    try {
      const { site_ai, date_ai, temp_ai } = item;
      const response = await fetch(`http://127.0.0.1:8000/api/delete-brq/${site_ai}/${date_ai}/${temp_ai}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to delete BRQ');
      }
      window.location.reload();
    } catch (error) {
      console.error('Error deleting BRQ:', error);
    }
  };

  const handleClaimClick = () => {
    setShowClaimInput(!showClaimInput);
  };

  const handleClaimInputChange = (event) => {
    setClaimText(event.target.value);
  };

  const handleCancelClaim = () => {
    setShowClaimInput(false);
    setClaimText('');
  };

  const handleConfirmClaim = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/report-problem', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ brq_text: claimText })
      });

      if (!response.ok) {
        throw new Error('Failed to report problem');
      }

      const result = await response.json();
      console.log('Problem reported:', result);
      setShowClaimInput(false);
      setClaimText('');
    } catch (error) {
      console.error('Error reporting problem:', error);
    }
  };

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

      fetchData();
      showSuccessMessage();
    } catch (error) {
      console.error('Error validating BRQs:', error);
    }
  };

  const openModal = (item) => {
    setSelectedItem(item);
    setModalOpen(true);
  };

  const closeModal = () => {
    setSelectedItem(null);
    setModalOpen(false);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setSelectedItem(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  useEffect(() => {
    fetchData();
  }, []);
  useEffect(() => {
    if (modalOpen) {
      // Définir le fond de la page sur rgba(0, 0, 0, 0.5) lorsque le modal est ouvert
      document.body.style.backgroundColor = 'rgba(0, 0, 0, 0.75 )';
    } else {
      // Réinitialiser le fond de la page lorsque le modal est fermé
      document.body.style.backgroundColor = ''; // Ou vous pouvez spécifier une autre couleur de fond par défaut
    }
  }, [modalOpen]);
  return (
    <div className="table-container">
      <div>
      {showSuccessAlert && (
  <div className="success-alert">
    <p><CheckIcon fontSize="inherit" /> Validation réussie!</p>
  </div>
)}

        <img className="image" src={Image} alt="Your Image" />
        <h1 className="activite">Bulletin de Reporting Quotidien (BRQ)</h1>
      </div>
      <div className="data">
        <div className="date-rectangle">
          <p>Date: {new Date().toLocaleDateString()}</p>
        </div>
        <div className="claim-button-container">
          <button className="claim-button" onClick={handleClaimClick}>
            <FontAwesomeIcon icon={faExclamationCircle} />
          </button>
          {showClaimInput && (
            <div className="claim-input-container">
              <textarea
                placeholder="Entrez votre réclamation ici..."
                value={claimText}
                onChange={handleClaimInputChange}
                rows={4}
                cols={50}
              />
              <div>
                <button onClick={handleConfirmClaim} className="small-button">Confirmer</button>
                <button onClick={handleCancelClaim} style={{ marginLeft: '4px' }}  className="small-button">Annuler</button>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="activite">
        <h1>Activite raffinage et petrochimie</h1>
      </div>
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
            <th>Entreprise</th>
            <th>Prestataire</th>
            <th>Tiers</th>
            <th>Étrangers</th>
            <th>Corporels</th>
            <th>Matériels</th>
            <th>Environnementaux</th>
          </tr>
        </thead>
        <tbody>
          {tableData.map(item => (
            <tr key={item.id}>
              <td>{item.site_ai}</td>
              <td>{item.date_ai}</td>
              <td>{item.temp_ai}</td>
              <td>{item.lieu_ai}</td>
              <td>{item.nature_ai}</td>
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
              <td>
                <button className="submit-button" onClick={() => openModal(item)}>Modifier</button>
                <button className="submit-button" onClick={() => handleDelete(item)}>Supprimer</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className="submit-button1" onClick={handleValidation}>Valider</button>

      <Modal isOpen={modalOpen} onRequestClose={closeModal} style={customModalStyles} contentLabel="Edit Modal">  
            {selectedItem && (
          <div>
            <h2>Modifier votre BRQ</h2>
            <form>
              <label>
                Structure:
                <input type="text" name="site_ai" value={selectedItem.site_ai} onChange={handleEditChange} />
              </label>
              <br />
              <label>
                Date:
                <input type="date" name="date_ai" value={selectedItem.date_ai} onChange={handleEditChange} />
              </label>
              <br />
              <label>
                Heure:
                <input type="time" name="temps_ai" value={selectedItem.temp_ai} onChange={handleEditChange} />
              </label>
              <br />
              <label>
                Lieu:
                <input type="text" name="lieu_ai" value={selectedItem.lieu_ai} onChange={handleEditChange} />
              </label>
              <br />
              <label>
                Nature:
                <input type="text" name="nature" value={selectedItem.nature_ai} onChange={handleEditChange} />
              </label>
              <br />
              <label>
                Description Succincte:
                <textarea name="desc_succincte" value={selectedItem.desc_succincte} onChange={handleEditChange} rows={4} />
              </label>
              <br />
              <label>
                Cause de l'incident / accident:
                <input type="text" name="cause_ai" value={selectedItem.cause_ai} onChange={handleEditChange} />
              </label>
              <br />
              <label>
                Fatalités - Entreprise:
                <input type="text" name="fatal_entreprise" value={selectedItem.fatal_entreprise} onChange={handleEditChange} />
              </label>
              <br />
              <label>
                Fatalités - Prestataire:
                <input type="text" name="fatal_prestataire" value={selectedItem.fatal_prestataire} onChange={handleEditChange} />
              </label>
              <br />
              <label>
                Fatalités - Tiers:
                <input type="text" name="fatal_tiers" value={selectedItem.fatal_tiers} onChange={handleEditChange} />
              </label>
              <br />
              <label>
                Fatalités - Étrangers:
                <input type="text" name="fatal_etrangers" value={selectedItem.fatal_etrangers} onChange={handleEditChange} />
              </label>
              <br />
              <label>
                Nombre Blessés:
                <input type="text" name="nbr_blesse" value={selectedItem.nbr_blesse} onChange={handleEditChange} />
              </label>
              <br />
              <label>
                Description - Corporels:
                <input type="text" name="desc_degats_corporels" value={selectedItem.desc_degats_corporels} onChange={handleEditChange} />
              </label>
              <br />
              <label>
                Description - Matériels:
                <input type="text" name="desc_degats_materiels" value={selectedItem.desc_degats_materiels} onChange={handleEditChange} />
              </label>
              <br />
              <label>
                Description - Environnementaux:
                <input type="text" name="desc_degats_environnementaux" value={selectedItem.desc_degats_environnementaux} onChange={handleEditChange} />
              </label>
              <br />
              <label>
                Disposition prise:
                <input type="text" name="dispositons_prise" value={selectedItem.dispositons_prise} onChange={handleEditChange} />
              </label>
              <br />
              <button type="button" onClick={() => handleEditSubmit(selectedItem)}>Enregistrer</button>
              <button type="button" style={{ marginLeft: '4px' }}  onClick={closeModal}>Annuler</button>
            </form>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default ViewBrqPage;
