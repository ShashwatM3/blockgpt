'use client'

import React, { useEffect, useState } from 'react';
import "./Dashboard.css";
import Image from 'next/image';
import { Home, House } from 'lucide-react';
import { Heart } from 'lucide-react';
import { UserRound } from 'lucide-react';
import chatgpt from "@/components/chatgpt.png"
import { doc, getDoc } from "firebase/firestore";
import { db } from '@/firebase';
import avatar from "@/components/avatar.png";
import AllChats from "./AllChats"
import Guide from "./Guide"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

function Dashboard() {
  const [userData, setUserData] = useState(null);

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
                <Home alt='' className='h-8 w-8 cursor-pointer'/>
                <Heart alt='' className='h-8 w-8 cursor-pointer'/>
                <Dialog>
                  <DialogTrigger asChild>
                    <UserRound alt='' className='h-8 w-8 cursor-pointer'/>
                  </DialogTrigger>
                  <DialogContent className='dark border border-neutral-800'>
                    <DialogHeader>
                      <DialogTitle>Do you wish to log out?</DialogTitle>
                      <DialogDescription className='mb-2'>Note: This action is not reversible</DialogDescription>
                      <div className='flex items-center'>
                        <Button onClick={() => {
                          localStorage.removeItem("blockgpt verification");
                          alert("Your user data will still be saved in our database");
                          window.location.reload()
                        }} className='dark' variant={'destructive'}>Yes</Button>
                      </div>
                    </DialogHeader>
                    <DialogFooter>Exit</DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <h1></h1>
            </div>
          </div>
          <div className='py-6'>
            <AllChats userData={userData}/>
          </div>
          <div className='py-6'>
            <Guide userData={userData}/>
          </div>
        </>
      )}
    </div>
  )
}

export default Dashboard