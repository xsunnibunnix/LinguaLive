import ChatBox from '@/components/chat/chatBox';
import { useRoomContext } from '@/context/RoomContext';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';

type chatBoxStateType = {
  messages: {
    user: string,
    content: string
  }[],
  activeUsers: string[];
};
// intialize chatbox state with dummy data


export default function Chatroom() {
  const router = useRouter();
  const id = router.query.id;
  console.log(id);
  const io = useRoomContext();

  // useEffect(() => {
  //   ws.addEventListener('open', () => {
  //     ws.send(JSON.stringify({type: 'join-room', roomId: id}))
  //   })
  // }, [id]);

    
  
  const chatBoxState: chatBoxStateType = {
    messages: [
      {
        user: 'Jiyoung',
        content: 'Yo!'
      },
      {
        user: 'Sunny',
        content: 'Yo'
      },
      {
        user: 'Alwin',
        content: 'wazgud'
      },
      {
        user: 'Ben',
        content: 'Sup'
      },
      {
        user: 'Waisan',
        content: 'Ni haody!'
      }
    ],
    activeUsers: ['Waisan', 'Sunny', 'Alwin', 'Jiyoung', 'Ben']
  };
  
  const [state, setState] = useState(chatBoxState);
  return (
    <div>
      <ChatBox state={state} setState={setState}></ChatBox>
    </div>
  );
}
