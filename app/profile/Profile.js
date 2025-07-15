'use client'
import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { Heart, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePathname, useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';


function Profile() {
  const [userData, setUserData] = useState(null);
  const router = useRouter()
  const pathname = usePathname();

  async function getData(emailUser) {
    const docRef = doc(db, "users", emailUser);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      setUserData(docSnap.data())
    } else {
      console.log("No user data!");
    }    
  }

  useEffect(() => {
    const el = localStorage.getItem("blockgpt verification")
    if(el) {
      getData(el)
    } else {
      window.open("/Authentication");
    }
  }, [])

  return (
    <div className='liked-main flex items-center justify-center mt-3 h-[100vh] w-[100vw]'>
      {userData && (
        <div>
          <h1 className='scroll-m-20 text-4xl font-extrabold tracking-tight text-center mb-3'>Profile Options</h1>
          <div className='py-3 px-5 border border-solid border-neutral-500 rounded-lg mb-5'>
            <h3>{userData.email}</h3>
          </div>
          <div className='flex items-center justify-center gap-3'>
            <Dialog>
              <DialogTrigger asChild>
                <Button className='dark' variant={'destructive'}>Log out</Button>
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
            <Button onClick={() => {router.push("/Main")}} className='dark'>Back to Dashboard</Button>
          </div>
          <br/>
        </div>
      )}
    </div>
  )
}

export default Profile