import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react'
import "./AllChats.css";
import Image from 'next/image';
import avatar from "@/components/avatar.jpg"
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from '@/components/ui/input';
import { updateDoc, arrayUnion, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { GitBranch, Heart, Share, Calendar } from 'lucide-react';
import Chat from "./Chat";
import { toast } from "sonner"
import Liked from './Liked';

const AllChats = forwardRef(function AllChats(props, ref) {
  const [userData, setUserData] = useState(null);
  const [allChats, setAllChats] = useState(null);
  const [reload, setReload] = useState(false);
  const [chatLoaded, setChatLoaded] = useState(null);
  const [favorites, setFavorites] = useState({});
  const [sortByDate, setSortByDate] = useState(true); // Default to timeline view
  const [sortedChats, setSortedChats] = useState(null);
  
  // Function to categorize chats by date
  const categorizeChatsByDate = (chats) => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const categorized = {
      today: [],
      thisWeek: [],
      thisMonth: [],
      other: []
    };

    chats.forEach(chat => {
      const chatDate = new Date(chat.createdAt);
      if (chatDate >= todayStart) {
        categorized.today.push(chat);
      } else if (chatDate >= oneWeekAgo) {
        categorized.thisWeek.push(chat);
      } else if (chatDate >= oneMonthAgo) {
        categorized.thisMonth.push(chat);
      } else {
        categorized.other.push(chat);
      }
    });

    return categorized;
  };

  // Function to format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  async function createDoc() {
    const el = document.getElementById("newChat");
    if(el) {
      const serverTime = new Date();
      const chatId = `${userData.email}__${el.value}`;
      await setDoc(doc(db, "chats", chatId), {
        name: el.value,
        chatType: "root",
        parent: null,
        branch_point_index: null,
        messages: [],
        branches: [],
        createdAt: serverTime.toString(),
        favorite: "no",
        owner: userData.email
      });

      await updateDoc(doc(db, "users", userData.email), {
        root_chats: arrayUnion(chatId)
      });

      window.location.reload();
    }
  }

  function openChat() {
    const el1 = document.getElementById("justDisplayChats");
    const el3 = document.getElementById("ask-user");
    const el2 = document.getElementById("realChat");
    const allChatsMain = document.getElementById("allchats-main");
    const likedSection = document.getElementById("liked");
    
    if(el1 && el2 && el3) {
      el1.style.display="none";
      el3.style.display="none";
      el2.style.display="block";
      
      // Set width to 100% and hide favorites section
      if(allChatsMain) {
        allChatsMain.style.width = "100%";
      }
      if(likedSection) {
        likedSection.style.display = "none";
      }
    }
  }

  async function fetchChatsData(chatIDs) {
    const chatPromises = chatIDs.map(async (element) => {
      const docRef = doc(db, "chats", element);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        if(docSnap.data().chatType=="root") {
          return {
            ...docSnap.data(),
            name: element
          };
        }
      } else {
        console.log("No such data!");
        return null;
      }
    });

    const arr = await Promise.all(chatPromises);
    setAllChats(arr.filter(Boolean)); // Remove any nulls
  }
  
  useEffect(() => {
    setUserData(props.userData);
    if (props.userData?.root_chats?.length > 0) {   
      fetchChatsData(props.userData.root_chats);
    }
  }, [props.userData]);

  // Update sorted chats when allChats changes
  useEffect(() => {
    if (allChats) {
      setSortedChats(categorizeChatsByDate(allChats));
    }
  }, [allChats]);

  useImperativeHandle(ref, () => ({
    closeChat: () => {
      setChatLoaded(null);
      // Reset UI to show chat list
      const el1 = document.getElementById("justDisplayChats");
      const el3 = document.getElementById("ask-user");
      const el2 = document.getElementById("realChat");
      const allChatsMain = document.getElementById("allchats-main");
      const likedSection = document.getElementById("liked");
      if(el1 && el2 && el3) {
        el1.style.display="block";
        el3.style.display="flex";
        el2.style.display="none";
        if(allChatsMain) {
          allChatsMain.style.width = "60%";
        }
        if(likedSection) {
          likedSection.style.display = "block";
        }
      }
    }
  }));
  
  // Helper to get display name from chat ID
  function getDisplayChatName(chat) {
    if (!chat) return '';
    if (chat.name && chat.name.includes('__')) {
      return chat.name.split('__').slice(1).join('__');
    }
    return chat.name || '';
  }

  // Helper to get chat doc ID safely (avoids double email)
  function getChatDocId(owner, name) {
    if (name && name.includes('__')) return name;
    return `${owner}__${name}`;
  }
  
  return (
    <div className='allchats-main' id="allchats-main">
      {userData && (
        <div className='w-full' id="scrollToIndicatorChats">
          <div className='ask-user' id="ask-user">
            <Image alt='' className='h-20 w-20 rounded-full' src={userData.avatar ? userData.avatar : avatar}/>
            <div>
              <h1>What's on your mind today?</h1>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className='dark'>Start a conversation</Button>
                </DialogTrigger>
                <DialogContent className='w-[30vw] dark border border-neutral-800'>
                  <DialogHeader>
                    <DialogTitle>Enter name of new chat</DialogTitle>
                    <DialogDescription>
                    </DialogDescription>
                    <Input placeholder='Ex: Vibe coding queries' id="newChat"/>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className='mt-2' onClick={() => {createDoc()}}>Create</Button>
                      </DialogTrigger>
                      <DialogContent className='dark border border-neutral-800'>
                        <DialogHeader>
                          <DialogTitle>Wait for it....</DialogTitle>
                          <DialogDescription>We're cooking up that chat for you</DialogDescription>
                        </DialogHeader>
                      </DialogContent>
                    </Dialog>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div id="allchats" className='w-full'>
            {!userData ? (
              <div>Loading...</div>
            ) : allChats && allChats.length>0 && userData.root_chats ? (
              <>
                <div id="justDisplayChats">
                  {/* Sort Toggle Button */}
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">Your Chats</h2>
                    <Button 
                      onClick={() => setSortByDate(!sortByDate)} 
                      className='dark border-neutral-800' 
                      variant={'outline'}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      {sortByDate ? 'Show All' : 'Sort by Date'}
                    </Button>
                  </div>

                  {sortByDate ? (
                    // Sorted view
                    <div>
                      {sortedChats?.today && sortedChats.today.length > 0 && (
                        <div className="mb-8">
                          <h3 className="text-lg font-medium mb-4">Today</h3>
                          {sortedChats.today.map((rootChat) => (
                            <div key={rootChat.name} className='root-chat-display w-full p-6 rounded-xl mb-4'>
                              <div className="flex justify-between items-start">
                                <div>
                                  <h1 className='text-xl'>{getDisplayChatName(rootChat)}</h1>
                                  <p className="text-sm text-gray-400 mt-1">Created: {formatDate(rootChat.createdAt)}</p>
                                </div>
                              </div>
                              <div className='flex justify-between items-center mt-4'>
                                <div className='flex items-center gap-5'>
                                  {rootChat.favorite=="yes" ? (
                                    <h3 className='flex items-center gap-2'><span className='text-[#FA2C37]'>Favorited</span><Heart fill='#FA2C30' strokeWidth={0}/></h3>
                                  ):(
                                    <Button onClick={async () => {
                                      toast("You favorited it! Changes will be made the next time you visit this page")
                                      await updateDoc(doc(db, "chats", getChatDocId(userData.email, rootChat.name)), {
                                        favorite: "yes"
                                      })
                                    }} className='dark border-neutral-800' variant={'outline'}>Favorite this {'<3'}</Button>
                                  )}
                                  <Share className='h-5 w-5'/>
                                </div>
                                <div className='flex items-center gap-4'>
                                  <span className='p-2 px-4 rounded-lg border border-neutral-800'>
                                    {rootChat.branches.length != 1 ? (
                                      <h3 className='flex items-center gap-1'><GitBranch className='h-4 w-4'/>{rootChat.branches.length} branches</h3>
                                    ):(
                                      <h3 className='flex items-center gap-1'><GitBranch className='h-4 w-4'/>{rootChat.branches.length} branch</h3>
                                    )}
                                  </span>
                                  <Button onClick={() => {
                                    setChatLoaded(rootChat);
                                    setTimeout(() => {
                                      openChat();
                                    }, 0);
                                  }} className='dark'>Enter Chat</Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {sortedChats?.thisWeek && sortedChats.thisWeek.length > 0 && (
                        <div className="mb-8">
                          <h3 className="text-lg font-medium mb-4">Past 7 Days</h3>
                          {sortedChats.thisWeek.map((rootChat) => (
                            <div key={rootChat.name} className='root-chat-display w-full p-6 rounded-xl mb-4'>
                              <div className="flex justify-between items-start">
                                <div>
                                  <h1 className='text-xl'>{getDisplayChatName(rootChat)}</h1>
                                  <p className="text-sm text-gray-400 mt-1">Created: {formatDate(rootChat.createdAt)}</p>
                                </div>
                              </div>
                              <div className='flex justify-between items-center mt-4'>
                                <div className='flex items-center gap-5'>
                                  {rootChat.favorite=="yes" ? (
                                    <h3 className='flex items-center gap-2'><span className='text-[#FA2C37]'>Favorited</span><Heart fill='#FA2C30' strokeWidth={0}/></h3>
                                  ):(
                                    <Button onClick={async () => {
                                      toast("You favorited it! Changes will be made the next time you visit this page")
                                      await updateDoc(doc(db, "chats", getChatDocId(userData.email, rootChat.name)), {
                                        favorite: "yes"
                                      })
                                    }} className='dark border-neutral-800' variant={'outline'}>Favorite this {'<3'}</Button>
                                  )}
                                  <Share className='h-5 w-5'/>
                                </div>
                                <div className='flex items-center gap-4'>
                                  <span className='p-2 px-4 rounded-lg border border-neutral-800'>
                                    {rootChat.branches.length != 1 ? (
                                      <h3 className='flex items-center gap-1'><GitBranch className='h-4 w-4'/>{rootChat.branches.length} branches</h3>
                                    ):(
                                      <h3 className='flex items-center gap-1'><GitBranch className='h-4 w-4'/>{rootChat.branches.length} branch</h3>
                                    )}
                                  </span>
                                  <Button onClick={() => {
                                    setChatLoaded(rootChat);
                                    // Use setTimeout to ensure state update happens before openChat
                                    setTimeout(() => {
                                      openChat();
                                    }, 0);
                                  }} className='dark'>Enter Chat</Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {sortedChats?.thisMonth && sortedChats.thisMonth.length > 0 && (
                        <div className="mb-8">
                          <h3 className="text-lg font-medium mb-4">This Month</h3>
                          {sortedChats.thisMonth.map((rootChat) => (
                            <div key={rootChat.name} className='root-chat-display w-full p-6 rounded-xl mb-4'>
                              <div className="flex justify-between items-start">
                                <div>
                                  <h1 className='text-xl'>{getDisplayChatName(rootChat)}</h1>
                                  <p className="text-sm text-gray-400 mt-1">Created: {formatDate(rootChat.createdAt)}</p>
                                </div>
                              </div>
                              <div className='flex justify-between items-center mt-4'>
                                <div className='flex items-center gap-5'>
                                  {rootChat.favorite=="yes" ? (
                                    <h3 className='flex items-center gap-2'><span className='text-[#FA2C37]'>Favorited</span><Heart fill='#FA2C30' strokeWidth={0}/></h3>
                                  ):(
                                    <Button onClick={async () => {
                                      toast("You favorited it! Changes will be made the next time you visit this page")
                                      await updateDoc(doc(db, "chats", getChatDocId(userData.email, rootChat.name)), {
                                        favorite: "yes"
                                      })
                                    }} className='dark border-neutral-800' variant={'outline'}>Favorite this {'<3'}</Button>
                                  )}
                                  <Share className='h-5 w-5'/>
                                </div>
                                <div className='flex items-center gap-4'>
                                  <span className='p-2 px-4 rounded-lg border border-neutral-800'>
                                    {rootChat.branches.length != 1 ? (
                                      <h3 className='flex items-center gap-1'><GitBranch className='h-4 w-4'/>{rootChat.branches.length} branches</h3>
                                    ):(
                                      <h3 className='flex items-center gap-1'><GitBranch className='h-4 w-4'/>{rootChat.branches.length} branch</h3>
                                    )}
                                  </span>
                                  <Button onClick={() => {
                                    setChatLoaded(rootChat);
                                    // Use setTimeout to ensure state update happens before openChat
                                    setTimeout(() => {
                                      openChat();
                                    }, 0);
                                  }} className='dark'>Enter Chat</Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {sortedChats?.other && sortedChats.other.length > 0 && (
                        <div className="mb-8">
                          <h3 className="text-lg font-medium mb-4">Other</h3>
                          {sortedChats.other.map((rootChat) => (
                            <div key={rootChat.name} className='root-chat-display w-full p-6 rounded-xl mb-4'>
                              <div className="flex justify-between items-start">
                                <div>
                                  <h1 className='text-xl'>{getDisplayChatName(rootChat)}</h1>
                                  <p className="text-sm text-gray-400 mt-1">Created: {formatDate(rootChat.createdAt)}</p>
                                </div>
                              </div>
                              <div className='flex justify-between items-center mt-4'>
                                <div className='flex items-center gap-5'>
                                  {rootChat.favorite=="yes" ? (
                                    <h3 className='flex items-center gap-2'><span className='text-[#FA2C37]'>Favorited</span><Heart fill='#FA2C30' strokeWidth={0}/></h3>
                                  ):(
                                    <Button onClick={async () => {
                                      toast("You favorited it! Changes will be made the next time you visit this page")
                                      await updateDoc(doc(db, "chats", getChatDocId(userData.email, rootChat.name)), {
                                        favorite: "yes"
                                      })
                                    }} className='dark border-neutral-800' variant={'outline'}>Favorite this {'<3'}</Button>
                                  )}
                                  <Share className='h-5 w-5'/>
                                </div>
                                <div className='flex items-center gap-4'>
                                  <span className='p-2 px-4 rounded-lg border border-neutral-800'>
                                    {rootChat.branches.length != 1 ? (
                                      <h3 className='flex items-center gap-1'><GitBranch className='h-4 w-4'/>{rootChat.branches.length} branches</h3>
                                    ):(
                                      <h3 className='flex items-center gap-1'><GitBranch className='h-4 w-4'/>{rootChat.branches.length} branch</h3>
                                    )}
                                  </span>
                                  <Button onClick={() => {
                                    setChatLoaded(rootChat);
                                    // Use setTimeout to ensure state update happens before openChat
                                    setTimeout(() => {
                                      openChat();
                                    }, 0);
                                  }} className='dark'>Enter Chat</Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    // Original unsorted view
                    allChats.map((rootChat) => (
                      <div key={rootChat.name} className='root-chat-display w-full p-6 rounded-xl mb-4'>
                        <h1 className=' text-xl'>{getDisplayChatName(rootChat)}</h1>
                        <div className='flex justify-between items-center mt-4'>
                          <div className='flex items-center gap-5'>
                            {rootChat.favorite=="yes" ? (
                              <h3 className='flex items-center gap-2'><span className='text-[#FA2C37]'>Favorited</span><Heart fill='#FA2C30' strokeWidth={0}/></h3>
                            ):(
                              <Button onClick={async () => {
                                toast("You favorited it! Changes will be made the next time you visit this page")
                                await updateDoc(doc(db, "chats", getChatDocId(userData.email, rootChat.name)), {
                                  favorite: "yes"
                                })
                              }} className='dark border-neutral-800' variant={'outline'}>Favorite this {'<3'}</Button>
                            )}
                            <Share className='h-5 w-5'/>
                          </div>
                          <div className='flex items-center gap-4'>
                            <span className='p-2 px-4 rounded-lg border border-neutral-800'>
                              {rootChat.branches.length != 1 ? (
                                <h3 className='flex items-center gap-1'><GitBranch className='h-4 w-4'/>{rootChat.branches.length} branches</h3>
                              ):(
                                <h3 className='flex items-center gap-1'><GitBranch className='h-4 w-4'/>{rootChat.branches.length} branch</h3>
                              )}
                            </span>
                            <Button onClick={() => {
                              setChatLoaded(rootChat);
                              // Use setTimeout to ensure state update happens before openChat
                              setTimeout(() => {
                                openChat();
                              }, 0);
                            }} className='dark'>Enter Chat</Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  <br/>
                </div>
                <div id="realChat">
                  {chatLoaded && (
                    <Chat chat={chatLoaded} userData={userData} onCloseChat={() => setChatLoaded(null)}/>
                  )}
                </div>
              </>
            ) : (
              <div>No chats yet</div>
            )}
          </div>
          <div id="liked">
            <Liked userData={userData}/>
          </div>
          <br/><br/>
        </div>
      )}
    </div>
  )
});

export default AllChats;