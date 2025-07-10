import React, { useEffect, useState } from 'react';
import "./Chat.css"
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';
import { arrayUnion, doc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import add from "@/components/add.png"
import Image from 'next/image';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { GitBranch } from 'lucide-react';

// current Chat ka ID -> {rootChatData.name}

function Chat(props) {
  const [rootChatData, setRootChatData] = useState(null);
  const [mode, setMode] = useState("chat");
  const [messagesArray, setMessagesArray] = useState(null);
  const [branches, setBranches] = useState(null);
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

  async function createBranch(blockNumber) {
    const el = document.getElementById("newBranchName");
    if (el) {
      toast.info("Creating branch...")
      const serverTime = new Date();
      await setDoc(doc(db, "chats", el.value), {
        name: el.value,
        chatType: "branch",
        parent: rootChatData.name,
        branch_point_index: blockNumber-1,
        messages: messagesArray.slice(0, blockNumber),
        branches: [],
        createdAt: serverTime.toString(),
        favorite: "no"
      });
      const newBranchUpdation = {
        [el.value]: blockNumber-1
      }
      await updateDoc(doc(db, "chats", rootChatData.name), {
        branches: arrayUnion(newBranchUpdation)
      });
      toast.success('Branch created! Refresh the page to load the changes!', {
        action: {
          label: 'Refresh',
          onClick: () => window.location.reload()
        },
      })
    }
  }

  useEffect(() => {
    console.log(props.chat)
    if (props.chat) {
      console.log(props.chat)
      setRootChatData(props.chat)
      setMessagesArray(props.chat.messages)
      setBranches(props.chat.branches)
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
                <React.Fragment key={index}>
                  <div
                    className={`my-4 mb-2 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} items-center gap-2`}
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
                    {msg.role=='assistant' && !(branches.some(obj => Object.values(obj)[0] === index)) && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Image className='h-11 w-13 rounded-md' alt = "" src={add}/>
                        </DialogTrigger>
                        <DialogContent className='dark border border-neutral-800'>
                          <DialogHeader>
                            <DialogTitle>Make a new branch</DialogTitle>
                            <DialogDescription>Enter the name of your new branch at position</DialogDescription>
                            <Input id="newBranchName"/>
                          </DialogHeader>
                          <DialogClose className='bg-white py-2 rounded-md text-black' onClick={() => {createBranch(index+1)}} id="dialogfooter">Create Branch</DialogClose>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                  {msg.role === "assistant" && branches.some(obj => Object.values(obj)[0] === index) && (
                    <h1 className='opacity-[70%] flex items-center gap-1.5 p-3 border border-neutral-800 w-fit rounded-xl'><GitBranch className='h-4 w-4'/> <span>Branch exists <span className='text-blue-400 font-bold'>here</span></span></h1>
                  )}
                </React.Fragment>
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