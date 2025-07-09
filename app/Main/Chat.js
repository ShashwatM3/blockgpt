import React, { useEffect, useState } from 'react';
import "./Chat.css"

function Chat(props) {
  const [rootChatData, setRootChatData] = useState(null);

  useEffect(() => {
    console.log(props.chat)
    if (props.chat) {
      setRootChatData(props.chat)
      const el = document.getElementById("allchats-main");
      if(el) {
        el.style.paddingTop = "1vh"
      }
    }
  }, [])
  
  return (
    <div className='chat-main'>
      {rootChatData && (
        <div>{rootChatData.name}</div>
      )}
    </div>
  )
}

export default Chat