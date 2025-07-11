import React, { useEffect, useState } from 'react';
import "./Chat.css"
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';
import { arrayUnion, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
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
  const [messageBranch, setMessageBranch] = useState("");
  const [loading, setLoading] = useState(false);
  const [branchChatData, setBranchChatData] = useState(null);
  const [expandedBlocks, setExpandedBlocks] = useState(new Set());

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

  const sendMessageBranch = async () => {
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
    const allChatsMain = document.getElementById("allchats-main");
    const likedSection = document.getElementById("liked");
    
    if(el1 && el2 && el3) {
      el1.style.display="block";
      el3.style.display="flex";
      el2.style.display="none";
      
      // Reset width to 60% and show favorites section
      if(allChatsMain) {
        allChatsMain.style.width = "60%";
      }
      if(likedSection) {
        likedSection.style.display = "block";
      }
      
      // Clear the chat data by calling the parent's setChatLoaded function
      if (props.onCloseChat) {
        props.onCloseChat();
      }
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

  async function settingBranchData(branchID) {
    toast.info("Loading branch data....")
    const idBranch = branchID
    const docRef = doc(db, "chats", branchID);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      setBranchChatData(docSnap.data());
      const el = document.getElementById("mainChat");
      const el2 = document.getElementById("branchChat");
      if(el && el2) {
        el.style.display="none";
        el2.style.display="block";
        toast.info("Branch successfully loaded!")
      }
    } else {
      console.log("No such chat data!");
    }
  }

  const toggleBlockExpansion = (index) => {
    setExpandedBlocks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

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
    <>
    <div className='chat-main' id="mainChat">
      {rootChatData && (
        <div>
          <div className='chat-title-etc'>
            <h1>{rootChatData.name}</h1>
            <div>
              <h3 className='mb-3'>{rootChatData.branches.length} branches</h3>
              {mode=="block" ? (
                <Button onClick={() => {
                  const el = document.getElementById("chatmode");
                  const el2 = document.getElementById("blockmode");
                  if(el && el2) {
                    el.style.display="flex";
                    el2.style.display="none"
                  }
                  setMode("chat")
                }} className='dark w-full mb-2 border-neutral-800' variant={'outline'}>Switch to chat mode</Button>
              ):(
                <Button onClick={() => {
                  const el = document.getElementById("chatmode");
                  const el2 = document.getElementById("blockmode");
                  if(el && el2) {
                    el.style.display="none";
                    el2.style.display="flex"
                  }
                  setMode("block")
                }} className='dark w-full mb-2 border-neutral-800' variant={'outline'}>Switch to block mode</Button>
              )}
              <Button onClick={() => {closeChat()}} className='dark w-full' variant={'secondary'}>Back to Chats</Button>
            </div>
          </div>
          <div className='mainchat' id="chatmode">
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
                    <h1 className='opacity-[70%] flex items-center gap-1.5 p-3 border border-neutral-800 w-fit rounded-xl'><GitBranch className='h-4 w-4'/> <span><span className='text-green-500'>Branch</span> <span className='font-bold'>"{Object.keys((branches.find(obj => Object.values(obj)[0] === index)))[0]}"</span> exists <span onClick={(e) => {
                      e.stopPropagation();
                      settingBranchData(Object.keys((branches.find(obj => Object.values(obj)[0] === index)))[0]);
                    }} className='text-blue-400 font-bold cursor-pointer hover:text-green-500 transition-all'>here</span></span></h1>
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
          <div id="blockmode" className='w-full'>
            <div className='px-4' id="allmessagesBlockMode">
              <div className="flex flex-col items-center justify-center relative px-4 pt-7 w-full">
                {messagesArray.map((msg, idx) => {
                  // Check if this index is a branch point
                  const branch = branches.find(obj => Object.values(obj)[0] === idx);
                  const isExpanded = expandedBlocks.has(idx);
                  const content = msg.content || msg.message || "";
                  const isLongContent = content.length > 100;
                  const displayContent = isExpanded ? content : (isLongContent ? content.substring(0, 100) + "..." : content);

                  return (
                    <div key={idx} className="flex flex-col items-center relative">
                      {/* Vertical connector line */}
                      {idx !== 0 && <div className="w-1 h-6 bg-gray-600" />}

                      <div className="flex items-center">
                        {/* Main Chat Block */}
                        <div
                          className={`mainChatBlock rounded-xl px-6 py-4 border text-white text-sm shadow-md z-10 transition-all duration-300 ${
                            msg.role === "user"
                              ? "bg-gray-800 border-gray-700"
                              : "bg-transparent border-gray-600"
                          }`}
                          style={{ 
                            width: isExpanded ? '40vw' : '30vw',
                            maxWidth: isExpanded ? '600px' : '450px'
                          }}
                        >
                          <div className="font-bold capitalize text-xs mb-1 opacity-60">
                            {msg.role}
                          </div>
                          <div className="whitespace-pre-wrap">
                            <ReactMarkdown>
                              {displayContent}
                            </ReactMarkdown>
                          </div>
                          {isLongContent && (
                            <button
                              onClick={() => toggleBlockExpansion(idx)}
                              className="mt-2 text-blue-400 hover:text-blue-300 text-xs font-medium transition-colors"
                            >
                              {isExpanded ? "Show less" : "Expand more"}
                            </button>
                          )}
                        </div>

                        {/* Horizontal branch connector + block */}
                        {branch && (
                          <>
                            {/* Horizontal Line */}
                            <div className="w-8 h-1 bg-gray-500 mx-2" />
                            {/* Branch Block */}
                            <div className="rounded-xl px-4 py-2 border border-blue-500 text-blue-300 bg-black w-[200px] text-sm shadow-md">
                              <div className="font-bold text-xs mb-1 opacity-70">Branch</div>
                              <div>{Object.keys((branches.find(obj => Object.values(obj)[0] === idx)))[0]}</div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* {messagesArray?.map((msg, index) => (
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
                    <h1 className='opacity-[70%] flex items-center gap-1.5 p-3 border border-neutral-800 w-fit rounded-xl'><GitBranch className='h-4 w-4'/> <span><span className='text-green-500'>Branch</span> <span className='font-bold'>"{Object.keys((branches.find(obj => Object.values(obj)[0] === index)))[0]}"</span> exists <span onClick={(e) => {
                      e.stopPropagation();
                      settingBranchData(Object.keys((branches.find(obj => Object.values(obj)[0] === index)))[0]);
                    }} className='text-blue-400 font-bold cursor-pointer hover:text-green-500 transition-all'>here</span></span></h1>
                  )}
                </React.Fragment>
              ))}
              {loading && (
                <div className="loading-indicator">Loading</div>
              )} */}
            </div>
          </div>
        </div>
      )}
    </div>
    <div className='chat-main' id="branchChat">
      {branchChatData && (
        <div>
          <div className='chat-title-etc'>
            <h1><span className='text-green-400'>Branch: </span>{branchChatData.name}</h1>
            <div>
              <h3 className='border-b border-neutral-500 pb-3 mb-3'>Chat Quick links</h3>
              <Button onClick={() => {
                const targetElement = document.getElementById('rootStartPointer');
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' }); 
              }} className='dark mb-2 border-neutral-800 bg-transparent w-full' variant={'outline'}>Start of Root Chat</Button>
              <Button onClick={() => {
                const targetElement = document.getElementById('branchOffPointer');
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' }); 
              }} className='dark border-neutral-800 bg-transparent w-full' variant={'outline'}>Branch-off point</Button>
            </div>
            <div id="metaChat">
              <h3 className='mb-3'>{branchChatData.branches.length} branches</h3>
              {/* You can add branch-specific controls here if needed */}
              <Button
                onClick={() => {
                  setBranchChatData(null);
                  document.getElementById("mainChat").style.display = "block";
                  document.getElementById("branchChat").style.display = "none";
                }}
                className='dark w-full'
                variant={'secondary'}
              >
                Back to Main Chat
              </Button>
            </div>
          </div>
          <div className='mainchat'>
            <div className='px-4' id="allmessages-branch">
              <h3 className='text-center my-5 opacity-[70%] text-sm' id="rootStartPointer">Root chat starts here</h3>
              {branchChatData.messages?.map((msg, index) => (
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
                  </div>
                  {branchChatData.branch_point_index==index && (
                    <h3 className='text-center my-5 opacity-[70%] text-sm' id="branchOffPointer">Branched off here</h3>
                  )}
                </React.Fragment>
              ))}
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
                <Button onClick={sendMessageBranch} className='dark mt-3'>Send</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  )
}

export default Chat