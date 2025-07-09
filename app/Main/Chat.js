import React, { useEffect, useState } from 'react';
import "./Chat.css"
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase';


function Chat(props) {
  const [rootChatData, setRootChatData] = useState(null);
  const [mode, setMode] = useState("chat");
  const [messagesArray, setMessagesArray] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!message.trim()) return;
    setMessage("");
  
    const newMessage = { role: "user", content: message };
    const updatedMessages = [...(messagesArray || []), newMessage];
    setMessagesArray(updatedMessages);
  
    setLoading(true); // Start loading
  
    const res = await fetch('/api/ask', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages: updatedMessages }),
    });

    await updateDoc(doc(db, "chats", rootChatData.name), {
      messages: updatedMessages
    });
  
    const data = await res.json();
    console.log(data);
    const newAssistantMessage = { role: "assistant", content: data.answer };
    const finalMessages = [...updatedMessages, newAssistantMessage];
    setMessagesArray(finalMessages);
    
    // Update Firebase with both user message and assistant response
    await updateDoc(doc(db, "chats", rootChatData.name), {
      messages: finalMessages
    });
  
    setLoading(false); // Stop loading
  };  

  function closeChat() {
    const el1 = document.getElementById("justDisplayChats");
    const el3 = document.getElementById("ask-user");
    const el2 = document.getElementById("realChat");
    if(el1 && el2 && el3) {
      el1.style.display="block";
      el3.style.display="flex";
      el2.style.display="none";
    }
  }

  useEffect(() => {
    console.log(props.chat)
    if (props.chat) {
      console.log(props.chat)
      setRootChatData(props.chat)
      setMessagesArray(props.chat.messages)
      const el = document.getElementById("allchats-main");
      if(el) {
        el.style.paddingTop = "1vh"
      }
    }
  }, [])
  
  return (
    <div className='chat-main'>
      {rootChatData && (
        <div>
          <div className='chat-title-etc'>
            <h1>{rootChatData.name}</h1>
            <div>
              <h3 className='mb-3'>{rootChatData.branches.length} branches</h3>
              <Button className='dark w-full mb-2' variant={'outline'}>Switch to {mode=="chat" ? "block" : "chat"} mode</Button>
              <Button onClick={() => {closeChat()}} className='dark w-full' variant={'secondary'}>Back to Chats</Button>
            </div>
          </div>
          <div className='mainchat'>
            <div className='px-4' id="allmessages">
              {messagesArray?.map((msg, index) => (
                <div
                  key={index}
                  className={`my-4 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] px-4 py-3 rounded-xl text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-[#2e2e2e] text-white'
                        : 'border border-[#444] text-white'
                    }`}
                  >
                    <ReactMarkdown>{msg.message || msg.content}</ReactMarkdown>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="loading-indicator">Loading</div>
              )}
            </div>
            <div className='user-input rounded-xl'>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder='Type here...'
                id="userInputMessage"
              />
              <div className='flex items-center justify-between'>
                <h3></h3>
                <Button onClick={sendMessage} className='dark mt-3'>Send</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Chat