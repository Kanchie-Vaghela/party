import react, {createContext} from 'react';
import {io} from 'socket.io-client';

const socket = io('http://localhost:5000', { transports: ["websocket"] }); // Adjust the URL as needed
socket.on('connect', () => {
    console.log('Connected to the server with ID:', socket.id);
});

export default socket;