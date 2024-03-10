import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { Socket } from "socket.io-client";

const servers = {
  iceServers: [
    {
      urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302']
    }
  ],
  iceCandidatePoolSize: 10,
};


const usePeer = (socket: Socket) => {
  const { data } = useSession();
  const myId = data?.user.id;
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
  const didIOffer = useRef(false);
  const isPeerSet = useRef(false);

  const stateChangeListener = (e: Event) => {
    console.log('signaling stage change', peerConnection?.signalingState);
    console.log(e);
  };

  const iceCandidateListener = (e: RTCPeerConnectionIceEvent) => {
    if (!socket) return;

    console.log('in iceCandidate listener', e)
    if (e.candidate) {
      socket?.emit('sendIceCandidate', {
        iceCandidate: e.candidate,
        iceUser: myId,
        didIOffer
      })
    }
  };

  useEffect(() => {
    if (isPeerSet.current) return;
    isPeerSet.current = true;
    const connection = new RTCPeerConnection(servers);
    setPeerConnection(connection);
  }, []);

  return { peerConnection, setPeerConnection, myId, didIOffer, iceCandidateListener, stateChangeListener };
};

export default usePeer;