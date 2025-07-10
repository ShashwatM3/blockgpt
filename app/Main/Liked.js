import React, { useEffect, useState } from 'react';
import "./Liked.css";
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { Heart, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';

function Liked(props) {
  const [userData, setUserData] = useState(null);
  const [allChats, setAllChats] = useState(null);

  async function fetchChatsData(chatIDs) {
    const chatPromises = chatIDs.map(async (element) => {
      const docRef = doc(db, "chats", element);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const dt = docSnap.data()
        if (dt.favorite=="yes") {
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

  return (
    <div className='liked-main flex items-start mt-[10vh] h-full'>
      {allChats && (
        <div>
          <h1 className='scroll-m-20 text-4xl font-extrabold tracking-tight text-balance mb-3'>Favorites </h1>
          <h3>View all your favorite chats. All in one place.</h3>
          <br/>
          <div className='w-[50vw]'>
            {allChats.map((chatName) => (
              // <h1 key={chatName.name}>Hello</h1>
              <div key={chatName.name} className='root-chat-display w-full p-6 rounded-xl mb-4'>
                <h1 className=' text-xl'>{chatName.name}</h1>
                <div className='flex justify-between items-center mt-4'>
                  <div className='flex items-center gap-5'>
                    {chatName.favorite=="yes" ? (
                      // <Heart strokeWidth={0} className='h-5 w-5 border-none' fill='red'/>
                      <h3 className='flex items-center gap-2'><span className='text-[#FA2C37]'>Favorited</span><Heart fill='#FA2C30' strokeWidth={0}/></h3>
                    ):(
                      <Button onClick={async () => {
                        toast("You favorited it! Changes will be made the next time you visit this page")
                        await updateDoc(doc(db, "chats", chatName.name), {
                          favorite: "yes"
                        })
                      }} className='dark border-neutral-800' variant={'outline'}>Favorite this {'<3'}</Button>
                    )}
                    <Share className='h-5 w-5'/>
                  </div>
                  <div className='flex items-center gap-4'>
                    <span>{chatName.branches.length} branches</span>
                    {/* <Button onClick={() => {
                      setChatLoaded(chatName)
                      openChat();
                    }} className='dark'>Enter Chat</Button> */}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Liked