import React, { useEffect, useState } from 'react'
import "./AllChats.css";
import Image from 'next/image';
import avatar from "@/components/avatar.png"
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
import { Heart, Share } from 'lucide-react';
import Chat from "./Chat";

function AllChats(props) {
  const [userData, setUserData] = useState(null);
  const [allChats, setAllChats] = useState(null);
  const [reload, setReload] = useState(false);
  const [chatLoaded, setChatLoaded] = useState(null)
  
  async function createDoc() {
    const el = document.getElementById("newChat");
    if(el) {
      const serverTime = new Date();
      // console.log(serverTime.toString())
      await setDoc(doc(db, "chats", el.value), {
        chatType: "root",
        parent: null,
        branch_point_index: null,
        messages: [],
        branches: [],
        createdAt: serverTime.toString()
      });

      await updateDoc(doc(db, "users", userData.email), {
        root_chats: arrayUnion(el.value)
      });

      window.location.reload();
    }
  }

  function openChat() {
    const el1 = document.getElementById("justDisplayChats");
    const el3 = document.getElementById("ask-user");
    const el2 = document.getElementById("realChat");
    if(el1 && el2 && el3) {
      el1.style.display="none";
      el3.style.display="none";
      el2.style.display="block";
    }
  }

  async function fetchChatsData(chatIDs) {
    const chatPromises = chatIDs.map(async (element) => {
      const docRef = doc(db, "chats", element);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          ...docSnap.data(),
          name: element
        };
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
  
  return (
    <div className='allchats-main' id="allchats-main">
      <div className='w-full'>
        <div className='ask-user' id="ask-user">
          <Image alt='' className='h-20 w-20 rounded-full' src={avatar}/>
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
                {allChats.map((rootChat) => (
                  // <h1 key={rootChat.name}>Hello</h1>
                  <div key={rootChat} className='root-chat-display w-full p-6 rounded-xl'>
                    <h1 className=' text-xl'>{rootChat.name}</h1>
                    <div className='flex justify-between items-center mt-4'>
                      <div className='flex items-center gap-2'>
                        <Heart className='h-5 w-5'/>
                        <Share className='h-5 w-5'/>
                      </div>
                      <div className='flex items-center gap-4'>
                        <span>{rootChat.branches.length} branches</span>
                        <Button onClick={() => {
                          setChatLoaded(rootChat)
                          openChat();
                        }} className='dark'>Enter Chat</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div id="realChat">
                {chatLoaded && (
                  <Chat chat={chatLoaded}/>
                )}
              </div>
            </>
          ) : (
            <div>No chats yet</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AllChats