import React, { createContext, useContext, useEffect, useState , useMemo} from "react";
import { io } from 'socket.io-client';

const socketContext = createContext(null);

export const useSocket = () => {
    const socket = useContext(socketContext);
    return socket;
}

export const SocketProvider = (props) => {

    const socket = useMemo(() => (io('http://localhost:5000')), []);

    return(
        <socketContext.Provider value={socket}>
            {props.children}
        </socketContext.Provider>
    )
}