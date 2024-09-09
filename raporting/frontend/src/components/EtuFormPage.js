import React, { useState, useEffect } from 'react';
import './Etu.css';
import Image from './Image.png';

const RemplissageEtuPage = () => {
    const [formData, setFormData] = useState({
        desc_dmg_personne: '',
        desc_dmg_env: '',
        desc_dmg_biens: '',
        desc_lieu: '',
        desc_deroulement: '',
        clas_ai: '',
        heure_ai: '',
        user: JSON.parse(localStorage.getItem('user')) || {} 
    });

    const [selectedDate, setSelectedDate] = useState('');
    const [site, setSite] = useState(formData.user.site || '');
    const [brqData, setBrqData] = useState([]);
    const [selectedBrq, setSelectedBrq] = useState('');
    const [error, setError] = useState(null);
    const [showAlert, setShowAlert] = useState(false); // Ajout de l'état pour contrôler l'affichage de l'alerte

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData({ ...formData, [name]: value });
    }

    const handleDateChange = (event) => {
        setSelectedDate(event.target.value);
        convertDate(event.target.value);
    }

    const handleBrqChange = (event) => {
        setSelectedBrq(event.target.value);
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        const item = {
            ...formData,
            site_ai: site,
            date_ai: selectedDate,
            temp_ai: selectedBrq
        };
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/update-brq/${site}/${selectedDate}/${selectedBrq}/`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${formData.user.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(item)
            });
            if (!response.ok) {
                throw new Error('F');
            }
            setFormData({
                desc_dmg_personne: '',
                desc_dmg_env: '',
                desc_dmg_biens: '',
                desc_lieu: '',
                desc_deroulement: '',
                clas_ai: '',
                heure_ai: '',
                user: formData.user
            });
            setSelectedDate('');
            setSelectedBrq('');
            setBrqData([]);
        } catch (error) {
            console.error('Error updating BRQ:', error);
            setError('');
            setShowAlert(true); // Afficher l'alerte en cas d'erreur
            setTimeout(() => {
                setShowAlert(false); // Masquer l'alerte après 8 secondes
            }, 8000);
        }   
    };

    const convertDate = (selection) => {
        const today = new Date();
        console.log('Today:', today);
    
        switch (selection) {
            case 'today':
                return setSelectedDate(today.toISOString().split('T')[0]);
            case 'yesterday':
                const yesterday = new Date(today);
                yesterday.setDate(today.getDate() - 1);
                console.log('Yesterday:', yesterday);
                return setSelectedDate(yesterday.toISOString().split('T')[0]);
            case 'day_before_yesterday':
                const dayBeforeYesterday = new Date(today);
                dayBeforeYesterday.setDate(today.getDate() - 2);
                console.log('Day before yesterday:', dayBeforeYesterday);
                return setSelectedDate(dayBeforeYesterday.toISOString().split('T')[0]);
            default:
                return '';
        }
    }
    

    const fetchBrqData = async () => {
        if (!selectedDate || !site || !formData.user.token) {
            setError('');
            return;
        }
    
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/gethis/?selected_date=${selectedDate}&site=${site}`, {
                method: "GET",
                headers: {
                    'Authorization': `Bearer ${formData.user.token}`,
                },
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setBrqData(data);
            if(data.length > 0 && data[0].temp_ai){
                setFormData({ ...formData, heure_ai: data[0].temp_ai });
            }
        } catch (error) {
            console.error('Error fetching BRQ data:', error);
            setError('Error fetching BRQ data');
        }
    };

    useEffect(() => {
        fetchBrqData();
    }, [selectedDate, site]);
    return (
        <div className="form-wrapper">
            <div className="header">
                <img src={Image} alt="Your Image" />  
                <h1>Bulletin de Reporting Quotidien (BRQ)</h1>
            </div>
            <form onSubmit={handleSubmit}>
                <div className="form-row">
                    <label>Date:</label>
                    <select value={selectedDate} onChange={handleDateChange}>
                        <option value="">Sélectionner la date</option>
                        <option value="today">Aujourd'hui</option>
                        <option value="yesterday">Hier</option>
                        <option value="day_before_yesterday">Avant-hier</option>
                    </select>
                </div>
                {brqData.length > 0 && (
                    <div className="form-row">
                        <label>BRQ:</label>
                        <select value={selectedBrq} onChange={handleBrqChange}>
                            <option value="">Sélectionner le BRQ</option>
                            {brqData.map(brq => (
                                <option key={brq.temp_ai} value={brq.temp_ai}>{brq.temp_ai}</option>
                            ))}
                        </select>
                    </div>
                )}
                <div className="form-row">
                    <label>Description Dommages Personne:</label>
                    <textarea name="desc_dmg_personne" value={formData.desc_dmg_personne} onChange={handleChange} required></textarea>
                </div>
                <div className="form-row">
                    <label>Description Dommages Environnementaux:</label>
                    <textarea name="desc_dmg_env" value={formData.desc_dmg_env} onChange={handleChange} required></textarea>
                </div>
                <div className="form-row">
                    <label>Description Dommages Biens:</label>
                    <textarea name="desc_dmg_biens" value={formData.desc_dmg_biens} onChange={handleChange} required></textarea>
                </div>
                <div className="form-row">
                    <label>Description Lieu:</label>
                    <textarea name="desc_lieu" value={formData.desc_lieu} onChange={handleChange} required></textarea>
                </div>
                <div className="form-row">
                    <label>Description Déroulement:</label>
                    <textarea name="desc_deroulement" value={formData.desc_deroulement} onChange={handleChange} required></textarea>
                </div>
                <div className="form-row">
                    <label>Clas AI:</label>
                    <input type="text" name="clas_ai" value={formData.clas_ai} onChange={handleChange} required />
                </div>
                <div className="form-row">
                    <label>Heure AI:</label>
                    <input type="time" name="heure_ai" value={formData.heure_ai} onChange={handleChange} required />
                </div>
                {showAlert && <div className="alert">Failed to update BRQ</div>} {/* Affichage de l'alerte */}
                <button type="submit">Submit</button>
                {error && <div className="error">{error}</div>}
            </form>
        </div>
    );
}

export default RemplissageEtuPage;
