import { useEffect, useState, useRef } from "react";
import { useRoomContext } from '@/context/RoomContext';
import useMediaStream from "@/lib/getUserMedia";
import usePeer from "@/hooks/usePeer";
import VideoPlayer from "@/components/video/VideoPlayer";


const webrtc = () => {
  const socket = useRoomContext();
  const [callStarted, setCallStarted] = useState(false);
  const [callAnswered, setCallAnswered] = useState(false);
  const [offers, setOffers] = useState<any[]>([]);
  const [remoteStreams, setRemoteStreams] = useState<MediaStream[]>([]);
  const [myStream, setMyStream] = useState<MediaStream | null>(null);
  const { peerConnection, myId, didIOffer, iceCandidateListener, stateChangeListener } = usePeer(socket!);


  // Peer Connection and Socket listeners
  useEffect(() => {
    peerConnection?.addEventListener('signalingstatechange', stateChangeListener);
    peerConnection?.addEventListener('icecandidate', iceCandidateListener);
    peerConnection?.addEventListener('track', e => {
      console.log('Received track from other peer')
      console.log(e);
      setRemoteStreams(prev => {
        const newState = prev.concat(e.streams[0]);
        return newState;
      })
    })

    socket?.on('newOfferAwaiting', offer => {
      if (!callStarted) setCallStarted(true);
      setOffers(offer);
    })

    socket?.on('availableOffers', receivedOffers => {
      console.log('in AvailableOffers listener')
      if (!callStarted) setCallStarted(true);
      setOffers(receivedOffers);
    });

    socket?.on('answerResponse', ({ user, answer }) => {
      console.log(`Received an answer from ${user}`);
      peerConnection?.setRemoteDescription(answer);
    });

    return () => {
      socket?.removeAllListeners('newOfferAwaiting');
      socket?.removeAllListeners('availableOffers');
      socket?.removeAllListeners('answerResponse');
    }
  }, [socket]);


  // TODO Need to edit handleStartCall to emit a Room ID to id the socket instead of userID
  // Initiate the call, get my user media, add tracks to the peer connection
  const handleStartCall = async () => {
    if (!socket) return;
    setCallStarted(true);

    try {
      const stream = await useMediaStream();
      if (stream) {
        setMyStream(stream);
        stream.getTracks().forEach(track => peerConnection?.addTrack(track, stream));
      }

      console.log("Creating offer...")
      const offer = await peerConnection?.createOffer();
      peerConnection?.setLocalDescription(offer);
      didIOffer.current = true;
      socket?.emit('newOffer', offer);
      socket?.on('receivedIceCandidateFromServer', (iceCandidate: RTCIceCandidate) => {
        peerConnection?.addIceCandidate(iceCandidate);
        console.log('Adding ice candidate');
      });
    } catch (error) {
      console.log(error);
    }
  }

  // Answer the call
  const handleAnswerCall = async ({ offererUser, offer }: any) => {
    if (!socket) return;
    setCallAnswered(true);
    console.log(offers);
    try {
      const stream = await useMediaStream();
      if (stream) {
        setMyStream(stream);
        stream.getTracks().forEach(track => peerConnection?.addTrack(track, stream));
      }
    } catch (error) {
      console.log(error);
    }

    try {
      await peerConnection?.setRemoteDescription(offer);
      console.log('Creating answer...');
      const answer = await peerConnection?.createAnswer();
      await peerConnection?.setLocalDescription(answer);
      const offerIceCandidates: RTCIceCandidate[] = await socket?.emitWithAck('newAnswer', { answeredOffer: offererUser, answer });
      offerIceCandidates.forEach(c => {
        peerConnection?.addIceCandidate(c);
        console.log("Adding offerer ice candidates");
      });
      socket?.on('receivedIceCandidateFromServer', (iceCandidate: RTCIceCandidate) => {
        peerConnection?.addIceCandidate(iceCandidate);
        console.log('Adding ice candidate');
      });
    } catch (error) {
      console.log(error);
    }

  }

  // TODO Emit mute or camera off event to room with user id
  // TODO Implement a hangup button and figure out how to close connection if browser tab or window closes. Need to remove user's stream from state
  const handleMute = () => {
    myStream?.getAudioTracks().forEach(track => {
      track.enabled = !track.enabled
    })
  }
  const handleCamOff = () => {
    myStream?.getVideoTracks().forEach(track => {
      track.enabled = !track.enabled
    })
  }

  // TODO Edit styling so user's own stream is small at top right and active video is large in center
  // TODO How can you tell which user is speaking and highlight them as the active speaker?
  return (
    <div className="flex flex-col items-center justify-center w-full h-full">

      { (!callStarted && !offers.length) &&
        <div className="flex items-center justify-center w-full h-full">
          <button onClick={ handleStartCall } className='btn btn-primary btn-lg m-5'>Start Call</button>
        </div>
      }
      { (callStarted && !callAnswered) &&
        offers.map((offer: any) => {
          if (offer.offererUser === myId) return;
          return <button key={ `offer-${offer.offererUser}` } onClick={ () => handleAnswerCall(offer) } className="btn btn-accent">{ `Answer ${offer.offererUser}` }</button>
        })
      }

      { (callStarted && myStream) &&
        <>
          <video id="myVideo" className='border-4 border-primary' ref={ video => {
            if (video) video.srcObject = myStream as MediaProvider
          } } autoPlay playsInline />
          <div>
            <button onClick={ handleMute } className='btn btn-sm btn-error m-2' >Mute</button>
            <button onClick={ handleCamOff } className="btn btn-sm btn-info m-2" >Turn Off Cam</button>
          </div>

          { remoteStreams.map(stream => {
            return (
              <video className='border-4 border-white' ref={ video => {
                if (video) video.srcObject = stream as MediaProvider
              } } autoPlay playsInline />
            )
          }) }
        </>
      }

    </div>
  )
}

export default webrtc;