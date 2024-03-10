// const ws = require('ws');
// const cors = require('cors');
// app.use(cors());

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
})

// const clients = new Map();
// const rooms: Record<string, string[]> = {}
// let offers: object;
// let answers: object = { type: 'answer', test: 'test' };
// const iceCandidates: object[] = [];






// const wss = new ws.Server({ noServer: true });

// // WebSocket connection
// wss.on('connection', (socket:any) => {
//   console.log('WebSocket connected');

//   // Event listener to handle messages received from the client
//   socket.on('message', (data: any) => {
//     try {
//       const message = JSON.parse(data);
//       // console.log('Message from client:', message);

//       switch (message.type) {
//         case 'create-room':
//           console.log(`client created room : ${message.room}`)
//           // create a new room
//           // rooms[message.room] = ;
//           // add client to room
//           clients.set(socket, message.room);
//           socket.send(JSON.stringify({ type: 'room-created', room: message.room }));
//           break;
//         case 'join-room':
//           const room = rooms[message.room]
//           if (room) {
//             // room.sockets.push(socket);
//             socket.send(JSON.stringify({ type: 'room-joined', room: message.room }));
//             console.log(`client joined room : ${message.room}`);
//           }
//           clients.set(socket, message.room);
//           break;
//         case 'new-offer':
//           console.log('received offer');
//           offers = message.offer;
//           clients.set(socket, message.room);
//           for (const [clientSocket, _] of clients.entries()) {
//             if (clientSocket !== socket) {
//               clientSocket.send({type:'offers', offers});
//             }
//             else console.log('false')
//           }

//           // if (answers) {
//           //   for (const [clientSocket, _] of clients.entries()) {
//           //     if (clientSocket !== socket) {
//           //       clientSocket.send(JSON.stringify({type: 'answers', answers}))
//           //     }
//           //     else console.log('its me')
//           //   }

//           // } else {
//           //   console.log('no answers yet');
//           // }
//           break;
//         case 'new-answer':
//           console.log('received answer');
//           answers = message.answer;
//           clients.set(socket, message.room);
//           for (const [clientSocket, _] of clients.entries()) {
//             if (clientSocket !== socket) {
//               clientSocket.send(JSON.stringify({type: 'answers', answers}))
//             }
//             else console.log('its me')
//           }
//           // socket.send(JSON.stringify({type: 'answers', answers}))
//           // if (offers) {
//           //   // socket.send(JSON.stringify({ type: 'offers', offers }))
            
//           //   // socket.send(JSON.stringify({type: 'ice-candidate', candidate:message.candidate}))
//           // } else {
//           //   console.log('no offers yet');
//           // }
//           break;
//         case 'ice-candidate':
//           console.log('received ice candidates');
//           // iceCandidates.push(message.candidate);
//           for (const [clientSocket, _] of clients.entries()) {
//             if (clientSocket !== socket) {
//               clientSocket.send(JSON.stringify({type: 'ice-candidate', candidate:message.candidate}))
//             }
//           }

//           break;
//         default:
//           console.warn('Unknown message type:', message.type);
//       }
//     } catch (err) {
//       console.error('error', err);
//     }
//   });
//   socket.on('close', () => {
//     console.log('WebSocket disconnected');
//     clients.delete(socket)
//   });
// });

// // Start server
// const server = app.listen(PORT, () => {
//   console.log(`listening on PORT ${PORT}`);
// });

// server.on('upgrade', (request: Request, socket: any, head: any) => {
//   wss.handleUpgrade(request, socket, head, (socket: any) => {
//     wss.emit('connection', socket, request);
//   });
// });