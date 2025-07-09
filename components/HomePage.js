'use client'

import React, { useEffect } from 'react';
import "./HomePage.css"
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';

function HomePage() {
  const router = useRouter()

  useEffect(() => {
    if(localStorage.getItem("blockgpt verification")) {
      console.log("its fucking pushing")
      router.push("/Main")
    } else {
      console.log("bro what")
    }
  }, [])

  return (
    <div className='home-page'>
      <h1>Get answers.<br/> Find inspiration.<br/> Be more productive.</h1><br/>
      <Button onClick={() => {router.push("/Authentication")}} className='dark'>Join BlockGPT</Button>
    </div>
  )
}

export default HomePage