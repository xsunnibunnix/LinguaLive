import { createServer } from "http";
import { Server, Socket } from 'socket.io';
const express = require('express');
const app = express();

const PORT = 4000;

const expressServer = createServer(app);
const io = new Server(expressServer, {
  cors: {
    origin: [
        "http://localhost:3000",
        // 'http://LOCAL-DEV-IP-HERE' //if using a phone or another computer
    ],
    methods: ["GET", "POST"]
}
});

expressServer.listen(PORT, () => console.log(`Listening on port ${PORT}`));

// TODO Save as object with room ID as key
// TODO Refactor to save to database instead of on server
let offers:any[] = [];
// const connectedSockets: any = [];


io.on('connection', (socket) => {
  const user = socket.handshake.auth.user;
  console.log(`Received new socket connection from ${user}`);

  // TODO emit a new user joined the room

  // connectedSockets.push({
  //   id: socket.id,
  //   user
  // });
  // console.log(connectedSockets)

  if (offers.length) {
    socket.emit('availableOffers', offers);
  }

  socket.on('newOffer', newOffer => {
    const alreadyOffered = offers.find(o => o.offererUser === user);
    if (alreadyOffered) {
      console.log('already offered')
      alreadyOffered.offer = newOffer;
    } else {
      console.log('Received new offer from ', user);
      offers.push({
        offererUser: user,
        offer: newOffer,
        offerIceCandidates: [],
        answererUser: null,
        answer: null,
        answererIceCandidates: []
      });
    }

    socket.broadcast.emit('newOfferAwaiting', offers.slice(-1));
  });

  socket.on('newAnswer', ({ answeredOffer, answer }, ackFunc) => {
    console.log('Received an answer from', user);
    const foundOffer = offers.find(o => o.offererUser === answeredOffer);
    if (foundOffer) {
      foundOffer.answererUser = user;
      foundOffer.answer = answer;
    };
    ackFunc(foundOffer.offerIceCandidates);
    socket.broadcast.emit('answerResponse', { user, answer });
  });

  socket.on('sendIceCandidate', ({ iceCandidate, iceUser, didIOffer }) => {
    console.log('received ice candidate on server')
    // console.log(`didIOffer on server from ${user}: `, didIOffer.current)
    if (didIOffer.current) {
      console.log('Receiving ice candidates from offerer')
      const foundOffer = offers.find(o => o.offererUser === iceUser);
      if (foundOffer) {
        foundOffer.offerIceCandidates.push(iceCandidate);
      }
      socket.broadcast.emit('receivedIceCandidateFromServer', iceCandidate);
    } else {
      console.log('Receiving ice candidates from answerer')
      const foundOffer = offers.find(o => o.answererUser === iceUser);
      if (foundOffer) {
        foundOffer.answererIceCandidates.push(iceCandidate);
      };
      socket.broadcast.emit('receivedIceCandidateFromServer', iceCandidate);
    }
  });
});



io.off('connection', () => {
  offers = [];
  console.log(offers)
});