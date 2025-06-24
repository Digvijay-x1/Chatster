import React, { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import SignUpPage from './pages/SignUpPage'
import LoginPage from './pages/LoginPage'
import SettingsPage from './pages/SettingsPage'
import ProfilePage from './pages/ProfilePage'
import { useAuthStore } from './store/useAuthStore'
import { useChatStore } from './store/useChatStore'
import { useThemeStore } from './store/useThemeStore'
import { Loader } from 'lucide-react'
import { Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

const App = () => {
  const {authUser, checkAuth, isCheckingAuth, onlineUsers, socket} = useAuthStore();
  const {addNewMessage} = useChatStore();
  const {theme} = useThemeStore();
  
  useEffect(()=>{
    checkAuth();
  },[checkAuth])
  
  // Setup socket event listeners for real-time messaging
  useEffect(() => {
    if (socket) {
      // Listen for new messages
      socket.on('newMessage', (message) => {
        console.log('New message received via socket:', message);
        addNewMessage(message);
      });

      return () => {
        socket.off('newMessage');
      };
    }
  }, [socket, addNewMessage]);
  
  console.log('authUser', authUser);
  console.log('onlineUsers', onlineUsers);
  
  if(isCheckingAuth && !authUser){
    return (
      <div className='flex justify-center items-center h-screen'>
        <Loader className='size-10 animate-spin'/>
      </div>
    )
  }
  return (
   <div data-theme={theme}>
    <Navbar />
    <Routes>
      <Route path='/' element={authUser ? <HomePage /> : <Navigate to='/login' />} />
      <Route path='/signup' element={!authUser ? <SignUpPage /> : <Navigate to='/' />} />
      <Route path='/login' element={!authUser ? <LoginPage /> : <Navigate to='/' />} />
      <Route path='/settings' element={ <SettingsPage /> } />
      <Route path='/profile' element={authUser ? <ProfilePage /> : <Navigate to='/login' />} />
    </Routes>
    <Toaster />
   </div>
  )
}

export default App