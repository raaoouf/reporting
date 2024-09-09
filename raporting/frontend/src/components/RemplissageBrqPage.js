import React, { Component } from 'react';
import './Remplissage.css';
import Image from './Image.png';
import Alert from '@mui/material/Alert'; // Importation du composant Alert depuis Material-UI
import CheckIcon from '@mui/icons-material/Check'; // Importation de l'icône CheckIcon depuis Material-UI
import ErrorIcon from '@mui/icons-material/Error'; // Importation de l'icône ErrorIcon depuis Material-UI

export default class RemplissageBrqPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ras: false,
            site_ai: '',
            date_ai: '',
            cause_ai: '',
            lieu_ai: '',
            temp_ai: '',
            nature_ai: '',
            desc_succincte: '',
            fatal_entre_prise: '',
            fatal_prestataire: '',
            fatal_tiers: '',
            fatal_etrangers: '',
            nbr_blesse: '',
            desc_degats_corporels: '',
            desc_degats_materiels: '',
            desc_degats_environnementaux: '',
            dispositons_prise: '',
            desc_dmg_personne: '',
            desc_dmg_env: '',
            desc_dmg_biens: '',
            desc_lieu: '',
            desc_deroulement: '',
            clas_ai: '',
            error: null,
            isLoaded: false,
            alertType: null, // Nouvelle propriété pour le type d'alerte (success ou error)
            showAlert: false, // Nouvelle propriété pour contrôler l'affichage de l'alerte
            user: JSON.parse(localStorage.getItem('user')) || {} // Correction ici
        };
    }

    handleChange = (event) => {
        this.setState({ [event.target.name]: event.target.value });
    }

    handleCheckboxChange = (event) => {
        this.setState({ ras: event.target.checked });
    }

    handleSubmit = async(event) => {
        event.preventDefault();

        // Récupération des données du formulaire
        const {
            ras, site_ai, date_ai, cause_ai, lieu_ai, temp_ai,
            nature_ai, desc_succincte, fatal_entre_prise, fatal_prestataire,
            fatal_tiers, fatal_etrangers, nbr_blesse, desc_degats_corporels,
            desc_degats_materiels, desc_degats_environnementaux, dispositons_prise,
        } = this.state;

        const { user, ...formData } = this.state;
        const apiUrl = 'http://localhost:8000/api/create-data';

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`,
                },
                body: JSON.stringify({
                    ras, site_ai, date_ai, cause_ai, lieu_ai, temp_ai,
                    nature_ai, desc_succincte, fatal_entre_prise, fatal_prestataire,
                    fatal_tiers, fatal_etrangers, nbr_blesse, desc_degats_corporels,
                    desc_degats_materiels, desc_degats_environnementaux, dispositons_prise,
                })
            });

            if (response.ok) {
                this.setState({ alertType: 'success', showAlert: true, error: null });
                setTimeout(() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    this.setState({ showAlert: false });
                    window.location.reload(); // Recharge la page après 7 secondes
                }, 7000);
            } else {
                const errorResponse = await response.json();
                console.error('Error:', errorResponse.error);
                this.setState({ alertType: 'error', showAlert: true, error: errorResponse.error });
                setTimeout(() => {
                    this.setState({ showAlert: false });
                    
                    

                    window.scrollTo({ top: 0, behavior: 'smooth' }); // Fait défiler jusqu'en haut de la page en douceur
                }, 7000);
            }
        } catch (error) {
            console.error('Error:', error);
            this.setState({ alertType: 'error', showAlert: true, error: 'An error occurred.' });
            setTimeout(() => {
                this.setState({ showAlert: false });
                window.scrollTo({ top: 0, behavior: 'smooth' }); // Fait défiler jusqu'en haut de la page en douceur
            }, 7000);
        }
    };

    render() {
        const {
            ras, site_ai, date_ai, cause_ai, lieu_ai, temp_ai,
            nature_ai, desc_succincte, fatal_entre_prise, fatal_prestataire,
            fatal_tiers, fatal_etrangers, nbr_blesse, desc_degats_corporels,
            desc_degats_materiels, desc_degats_environnementaux, dispositons_prise,
        } = this.state;
        const { showAlert, alertType, success, error } = this.state;

        return (
            <div className="form-wrapper">
                <div className="form-container">
                    {showAlert && (
                        <Alert icon={alertType === 'success' ? <CheckIcon fontSize="inherit" /> : <ErrorIcon fontSize="inherit" />} severity={alertType}>
                            {alertType === 'success' ? 'Here is a gentle confirmation that your action was successful.' : 'Oops! Something went wrong. Please try again later.'}
                        </Alert>
                    )}
            <div className="header">
            <img src={Image} alt="Your Image" />  
              <h1>Bulletin de Reporting Quotidien (BRQ)</h1>
            </div>
            <form onSubmit={this.handleSubmit}>
                
            <div className="form-row">
                    <label>RAS:</label>
                    <input type="checkbox" name="ras" checked={ras} onChange={this.handleCheckboxChange} />
                </div>
                
                <div className="form-row">
                    <label>Date AI:</label>
                    <input type="date" name="date_ai" value={date_ai} onChange={this.handleChange} required />
                </div>
                <div className="form-row">
                    <label>Temps AI:</label>
                    <input type="time" name="temp_ai" value={temp_ai} onChange={this.handleChange} required />
                </div>
                {!ras && (
                            <>
                <div className="form-row">
                    <label>Cause AI:</label>
                    <input type="text" name="cause_ai" value={cause_ai} onChange={this.handleChange} required />
                </div>
                <div className="form-row">
                    <label>Lieu AI:</label>
                    <input type="text" name="lieu_ai" value={lieu_ai} onChange={this.handleChange} required />
                </div>
                
                <div className="form-row">
                    <label>Nature AI:</label>
                    <input type="text" name="nature_ai" value={nature_ai} onChange={this.handleChange} required />
                </div>
                <div className="form-row">
                    <label>Description Succincte:</label>
                    <textarea name="desc_succincte" value={desc_succincte} onChange={this.handleChange} required></textarea>
                </div>
                <div className="form-row">
                    <label>Fatal Entreprise:</label>
                    <input type="text" name="fatal_entre_prise" value={fatal_entre_prise} onChange={this.handleChange} required />
                </div>
                <div className="form-row">
                    <label>Fatal Prestataire:</label>
                    <input type="text" name="fatal_prestataire" value={fatal_prestataire} onChange={this.handleChange} required />
                </div>
                <div className="form-row">
                    <label>Fatal Tiers:</label>
                    <input type="text" name="fatal_tiers" value={fatal_tiers} onChange={this.handleChange} required />
                </div>
                <div className="form-row">
                    <label>Fatal Étrangers:</label>
                    <input type="text" name="fatal_etrangers" value={fatal_etrangers} onChange={this.handleChange} required />
                </div>
                <div className="form-row">
                    <label>Nombre de Blessé:</label>
                    <input type="text" name="nbr_blesse" value={nbr_blesse} onChange={this.handleChange} required />
                </div>
                <div className="form-row">
                    <label>Description DéGats Corporels:</label>
                    <textarea name="desc_degats_corporels" value={desc_degats_corporels} onChange={this.handleChange} required></textarea>
                </div>
                <div className="form-row">
                    <label>Description DéGats Matériels:</label>
                    <textarea name="desc_degats_materiels" value={desc_degats_materiels} onChange={this.handleChange} required></textarea>
                </div>
                <div className="form-row">
                    <label>Description DéGats Environnementaux:</label>
                    <textarea name="desc_degats_environnementaux" value={desc_degats_environnementaux} onChange={this.handleChange} required></textarea>
                </div>
                <div className="form-row">
                    <label>Dispositons Prise:</label>
                    <textarea name="dispositons_prise" value={dispositons_prise} onChange={this.handleChange} required></textarea>
                </div>
                </>
                )}

                <div className="form-row">
                    <button type="submit">Submit</button>
                </div>
            </form>
        </div>
        </div>
        );
    }
}