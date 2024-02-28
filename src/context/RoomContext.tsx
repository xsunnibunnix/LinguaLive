import { useRouter } from 'next/router';
import { createContext, useEffect, useState, useContext } from 'react';
import { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';


const RoomContext = createContext<Socket | null>(null);
const SERVER_URL = 'http://localhost:4000';

// const ws = new WebSocket('ws://localhost:4000');

export const RoomProvider = ({ children }: { children: React.ReactNode }) => {
  // const router = useRouter();
  
  // ws.addEventListener('message', (event) => {
    //   const {type, room} = JSON.parse(event.data);
    //   switch (type) {
      //     case 'room-created':
      //       router.push(`/chatroom/${room}`)
      //       break;
      //     default:
      //       console.warn('Unknown message type:', type);
      //   }
      // });
      
  const [socket, setSocket] = useState<Socket | null>(null);
      
  useEffect(() => {
    const connection = io(SERVER_URL);
    setSocket(connection);
  }, []);

  socket?.on('connect', () => console.log('Client socket connected to server'));
  socket?.on('connect_error', () => console.log('Error connecting socket'));

  return (
    <RoomContext.Provider value={ socket }>{ children }</RoomContext.Provider>
  )
};

export const useRoomContext = () => {
  const socket = useContext(RoomContext);
  if (socket) return socket;
}
