import React, { Component } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './Navbar';
import Signin from './Signin';
import RemplissageBrqPage from './RemplissageBrqPage';
import ViewBrqPage from './ViewBrqPage';
import RemplissageEtuPage from './EtuFormPage';
import BrqByDatePage from './ViewBrqcon';
import GetBrqByDateOwnSite from './Viewbrqhis';
import BrqForTodayPage from './ViewBrqRPCcon';
import Pre from './pre';
import Dashbord from './Dashbord';
import Notif from './Notification';
import CR from './CR';
import CRRPC from './CRRPC';

export default class HomePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      showNavbar: false, // Ajoutez une propriété pour contrôler l'affichage du Navbar
    };
  }

  componentDidMount() {
    const userState = JSON.parse(localStorage.getItem('user'));
    if (userState) {
      this.setState({ user: userState });
      this.setShowNavbar(true); // Affichez le Navbar si un utilisateur est connecté
    } else {
      this.setShowNavbar(false); // Masquez le Navbar si aucun utilisateur n'est connecté
    }
  }

  setShowNavbar = (value) => {
    this.setState({ showNavbar: value });
  };

  handleLogout = () => {
    localStorage.removeItem('user');
    this.setState({ user: null });
    this.setShowNavbar(false); // Masquez le Navbar après la déconnexion
  };

  render() {
    const { user, showNavbar } = this.state;
    console.log(user);
    return (
      <BrowserRouter>
        {showNavbar && <Navbar />} {/* Affichez le Navbar uniquement si showNavbar est true */}
        <Routes>
          <Route path="/auth" element={<Signin setUser={this.setState.bind(this)} setShowNavbar={this.setShowNavbar} />} />
          <Route path="/test" element={<RemplissageBrqPage />} />
          <Route path='/viewBrq' element={< Dashbord/>} />
          <Route path='/viewBrqou' element={<Notif />} />

          <Route path='/testetu' element={<ViewBrqPage />} />
          <Route path='/history' element={<GetBrqByDateOwnSite />} />
          <Route path='/historyRpc' element={< BrqByDatePage/>} />
          <Route path='/BRQ-consolidé' element={<BrqForTodayPage/>}/>
          <Route path='/' element={<Pre />} />
          <Route path='/CompteRendu' element={<RemplissageEtuPage />} />
          <Route path='/VCR' element={<CR />} />
          <Route path='/VCRRPC' element={<CRRPC />}/>

          
        </Routes>
      </BrowserRouter>
    );
  }
}
