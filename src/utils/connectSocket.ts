// hooks/useSocket.ts
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const useSocket = (url: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const socketIO = io(url);

    setSocket(socketIO);

    return () => {
      if (socketIO) {
        socketIO.disconnect();
      }
    };
  }, [url]);

  return socket;
};

export default useSocket;
