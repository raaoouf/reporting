import React, { useState, useEffect } from 'react';
import * as FaIcons from 'react-icons/fa';
import * as AiIcons from 'react-icons/ai';
import * as IoIcons from 'react-icons/io';
import { Link } from 'react-router-dom';
import { IoIosLogOut } from 'react-icons/io';

function Navbar() {
  const [sidebar, setSidebar] = useState(false);
  const [site, setSite] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const userState = JSON.parse(localStorage.getItem('user'));
    const site = userState ? userState.site : null;
    setSite(site);

    fetchNotifications(userState.token);
  }, []);

  const fetchNotifications = async (token) => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/notifications', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const jsonData = await response.json();
      setNotifications(jsonData);

      const unreadNotifications = jsonData.filter(notification => !notification.read);
      setUnreadCount(unreadNotifications.length);

      if (unreadNotifications.length > 0) {
        const updatedNotifications = jsonData.map((notification, index) => {
          if (index === jsonData.indexOf(unreadNotifications[0])) {
            return { ...notification, isNew: true };
          }
          return notification;
        });
        setNotifications(updatedNotifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const togglePopup = () => {
    setShowPopup(!showPopup);
    setUnreadCount(0);
  };

  const showSidebar = () => {
    setSidebar(!sidebar);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/auth';
  };

  const navMenuStyle = {
    backgroundColor: '#0055A5',
    width: sidebar ? '250px' : '70px',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    top: 0,
    left: 0,
    transition: 'width 350ms ease',
  };

  const navTextLinkStyle = {
    textDecoration: 'none',
    color: '#f5f5f5',
    fontSize: '18px',
    width: '80%',
    display: 'flex',
    alignItems: 'center',
    padding: '0 16px',
    borderRadius: '4px',
  };

  const sectionNameStyle = {
    marginLeft: '8px',
  };

  const notificationBadgeStyle = {
    position: 'absolute',
    top: '-5px',
    right: '-5px',
    backgroundColor: 'red',
    color: 'white',
    borderRadius: '50%',
    padding: '5px 10px',
    fontSize: '12px',
  };

  return (
    <>
      <nav style={navMenuStyle} className={sidebar ? 'nav-menu active' : 'nav-menu'}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '38px', padding: '12px 20px' }}>
          <Link to='#' className='menu-bars' style={{ fontSize: '2rem', background: 'none', color: '#fff' }}>
            {sidebar ? <AiIcons.AiOutlineClose onClick={showSidebar} /> : <FaIcons.FaBars onClick={showSidebar} />}
          </Link>
          {sidebar && (
            <div style={{ position: 'relative' }} onClick={togglePopup}>
              <FaIcons.FaBell style={{ fontSize: '1.5rem', color: '#fff' }} />
              {unreadCount > 0 && (
                <span style={notificationBadgeStyle}>{unreadCount}</span>
              )}
            </div>
          )}
        </div>
        {sidebar && (
          <>
            {site !== 'DCRPC' && (
              <div>
                <Link to='/test' style={navTextLinkStyle}>
                  <AiIcons.AiFillHome />
                  <span className="section-name" style={sectionNameStyle}><p>BRQ</p></span>
                </Link>
              </div>
            )}
            {site === 'DCRPC' && (
              <div>
                <Link to='/ViewBrq/' style={navTextLinkStyle}>
                  <AiIcons.AiFillHome />
                  <span className="section-name" style={sectionNameStyle}><p>Dashboard</p></span>
                </Link>
              </div>
            )}
            {site !== 'DCRPC' && (
              <div>
                <Link to='/testetu' style={navTextLinkStyle}>
                  <IoIcons.IoIosPaper />
                  <span className="section-name" style={sectionNameStyle}><p>Table</p></span>
                </Link>
              </div>
            )}
            {site !== 'DCRPC' && (
              <>
                <div>
                  <Link to='/CompteRendu' style={navTextLinkStyle}>
                    <FaIcons.FaCartPlus />
                    <span className="section-name" style={sectionNameStyle}><p>Remplissage CR</p></span>
                  </Link>
                </div>
                <div>
                  <Link to='/VCR' style={navTextLinkStyle}>
                    <IoIcons.IoMdPeople />
                    <span className="section-name" style={sectionNameStyle}><p>View CR</p></span>
                  </Link>
                </div>
                <div>
                  <Link to='/history' style={navTextLinkStyle}>
                    <IoIcons.IoMdPeople />
                    <span className="section-name" style={sectionNameStyle}><p>Historique</p></span>
                  </Link>
                </div>
              </>
            )}
            {site === 'DCRPC' && (
              <div>
                <Link to='/historyRpc' style={navTextLinkStyle}>
                  <FaIcons.FaEnvelopeOpenText />
                  <span className="section-name" style={sectionNameStyle}><p>historyRpc</p></span>
                </Link>
              </div>
            )}
            {site === 'DCRPC' && (
              <div>
                <Link to='/BRQ-consolidé' style={navTextLinkStyle}>
                  <IoIcons.IoMdPeople />
                  <span className="section-name" style={sectionNameStyle}><p>BRQRPC</p></span>
                </Link>
              </div>
            )}
            {site === 'DCRPC' && (
              <div>
                <Link to='/VCRRPC' style={navTextLinkStyle}>
                  <IoIcons.IoMdPeople />
                  <span className="section-name" style={sectionNameStyle}><p>VCRRPC</p></span>
                </Link>
              </div>
            )}
            <div>
              <div style={navTextLinkStyle} onClick={handleLogout}>
                <IoIosLogOut />
                <span className="section-name" style={sectionNameStyle}><p>Log out</p></span>
              </div>
            </div>
          </>
        )}
      </nav>
      {showPopup && (
        <div style={{
          position: 'absolute',
          top: '50px',
          right: '20px',
          backgroundColor: 'white',
          border: '1px solid #ccc',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
          width: '300px',
          maxHeight: '400px',
          overflowY: 'auto',
          padding: '16px',
          boxSizing: 'border-box',
        }}>
          <h2 style={{ color: 'orange', textAlign: 'center', marginBottom: '20px', borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>Notifications</h2>
          {notifications.length > 0 ? (
            notifications.map((notification, index) => (
              <div key={index} style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <p style={{ fontSize: '12px', color: '#888' }}>{notification.date}</p>
                  {notification.isNew && (
                    <span style={{ backgroundColor: 'red', color: 'white', padding: '2px 8px', borderRadius: '20px', fontSize: '12px' }}>Nouveau</span>
                  )}
                </div>
                <p style={{ fontSize: '14px', lineHeight: '1.4' }}>{notification.message}</p>
                <hr style={{ borderTop: '1px solid #eee', margin: '12px 0' }} />
              </div>
            ))
          ) : (
            <p style={{ textAlign: 'center' }}>Aucune notification</p>
          )}
        </div>
      )}
    </>
  );
}

export default Navbar;
