import React, { useEffect } from 'react'
import { useChatStore } from '../store/useChatStore'
import Sidebar from '../components/Sidebar';
import NoChatSelected from '../components/NoChatSelected';
import ChatContainer from '../components/ChatContainer';

const HomePage = () => {
  const { selectedUser, getUsers } = useChatStore();
  
  useEffect(() => {
    // Load users when component mounts
    getUsers();
    
    // Set up interval to refresh users only if it is newly logged in or signed up
    const interval = setInterval(() => {
      getUsers();
    }, 60000); // Refresh every minute
    
    return () => clearInterval(interval);
  }, [getUsers]);

  return (
    <div className='h-full bg-base-200'>
      <div className='flex items-center justify-center pt-20 px-4'>
        <div className='bg-base-100 rounded-lg shadow-cl w-full max-w-6xl h-[calc(100vh-8rem)]'>
          <div className='flex h-full rounded-lg overflow-hidden'>
            <Sidebar/>
            {!selectedUser ? <NoChatSelected/> : <ChatContainer/>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage