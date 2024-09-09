// import React, { useState, useEffect } from 'react';


// function Notif() {
//   const [messages, setMessages] = useState([]);
//   const [newMessage, setNewMessage] = useState('');
//   const [notification, setNotification] = useState('');

//   useEffect(() => {
//     // Ecouter les messages entrants
//     socket.on('message', message => {
//       setMessages([...messages, message]);
//       setNotification('Nouveau message reçu !');
//       setTimeout(() => {
//         setNotification('');
//       }, 3000); // Efface la notification après 3 secondes
//     });

//     // Nettoyage de l'écouteur à la déconnexion
//     return () => socket.disconnect();
//   }, [messages]);

//   const sendMessage = () => {
//     socket.emit('message', newMessage);
//     setNewMessage('');
//   };

//   return (
//     <div>
//       <h1>Messagerie</h1>
//       <div>
//         {messages.map((message, index) => (
//           <div key={index}>{message}</div>
//         ))}
//       </div>
//       <input
//         type="text"
//         value={newMessage}
//         onChange={e => setNewMessage(e.target.value)}
//       />
//       <button onClick={sendMessage}>Envoyer</button>
//       {notification && <div>{notification}</div>}
//     </div>
//   );
// }

// export default Notif;
