import { createContext, useEffect, useState, useContext } from 'react';
import { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';
import { useSession } from 'next-auth/react';


const RoomContext = createContext<Socket | null>(null);
const SERVER_URL = 'http://localhost:4000';
// TODO replace this with a real userId from MongoDB database and/or create sessions and implement a sessionId


export const RoomProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { data } = useSession();
  const user = data?.user.id;
  
  useEffect(() => {
    // console.log('in RoomProvider - user: ', user);
    if (!user) return;
    const connection = io(SERVER_URL, {
      auth: { user }
    });
    setSocket(connection);
  }, [data]);

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
