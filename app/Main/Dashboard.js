'use client'

import React, { useEffect, useState, useRef } from 'react';
import "./Dashboard.css";
import Image from 'next/image';
import { Home, House } from 'lucide-react';
import { Heart } from 'lucide-react';
import { UserRound } from 'lucide-react';
import chatgpt from "@/components/chatgpt.png"
import { doc, getDoc } from "firebase/firestore";
import { db } from '@/firebase';
// import avatar from "@/components/avatar.png";
import AllChats from "./AllChats"
import Guide from "./Guide"

import { Button } from '@/components/ui/button';
import { usePathname, useRouter } from 'next/navigation';
import Liked from "./Liked";

function Dashboard() {
  const [userData, setUserData] = useState(null);
  const router = useRouter()
  const pathname = usePathname();
  const allChatsRef = useRef();

  async function getData(emailUser) {
    const docRef = doc(db, "users", emailUser);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      setUserData(docSnap.data())
    } else {
      // docSnap.data() will be undefined in this case
      console.log("No user data!");
    }    
  }

  useEffect(() => {
    const el = localStorage.getItem("blockgpt verification")
    if(el) {
      getData(el)
    } else {
      const el = document.getElementById("dashboard-content");
      if(el) {el.innerHTML="You must either login or create an account to access this page"}
    }
  }, [])
  return (
    <div className='dashboard-main'>
      {userData && (
        <>
          <div className='lm py-6 pl-6'>
            <div>
              <Image alt='' src={chatgpt}/>
              <div className='flex justify-center flex-col gap-10'>
                <Home onClick={() => {
                  if (allChatsRef.current && allChatsRef.current.closeChat) {
                    allChatsRef.current.closeChat();
                  }
                  const targetElement = document.getElementById('scrollToIndicatorChats');
                  if(targetElement) targetElement.scrollIntoView({ behavior: 'smooth', block: "start" });
                }} alt='' className='h-8 w-8 cursor-pointer'/>
                <Heart onClick={() => {
                  // const el = document.getElementById("liked");
                  // const el2 = document.getElementById("allchatsdiv");
                  // const el3 = document.getElementById("guidediv");
                  // if(el && el2 && el3) {
                  //   el2.style.display="none";
                  //   el3.style.display="none";
                  //   el.style.display="flex";
                  // }
                  const targetElement = document.getElementById('liked');
                  targetElement.scrollIntoView({ behavior: 'smooth', block: "start" });
                }} alt='' className='h-8 w-8 cursor-pointer'/>
                <UserRound onClick={() => {router.push("/profile")}} alt='' className='h-8 w-8 cursor-pointer'/>
              </div>
              <h1></h1>
            </div>
          </div>
          <div className='py-6 flex items-start justify-center h-[100vh] overflow-scroll' id="allchatsdiv">
            <AllChats ref={allChatsRef} userData={userData}/>
          </div>
          <div className='py-6' id="guidediv">
            <Guide userData={userData}/>
          </div>
        </>
      )}
    </div>
  )
}

export default Dashboard