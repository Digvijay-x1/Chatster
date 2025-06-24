import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef } from "react";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";

const ChatContainer = () => {
  const { selectedUser, getMessages, messages, isMessagesLoading } = useChatStore();
  const { authUser } = useAuthStore();
  const messagesContainerRef = useRef(null);
  
  useEffect(() => {
    if (selectedUser?._id) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser?._id, getMessages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  if (!selectedUser) return null;
  
  if(isMessagesLoading) return (
    <div className="flex-1 flex flex-col overflow-auto">      
      <ChatHeader/>
      <MessageSkeleton/>
      <MessageInput/>
    </div>
  );
  
  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader/>
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-zinc-500">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div 
              key={message._id}
              className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
            >
              <div className="chat-image avatar">
                <div className="size-10 rounded-full border">
                  <img 
                    src={message.senderId === authUser._id ? authUser.profilePic || '/avatar.png': selectedUser.profilePic || '/avatar.png' } 
                    alt="avatar" 
                  />
                </div>
              </div>
              <div className="chat-header mb-1">
                <time className="text-xs opacity-50 ml-1">{formatMessageTime(message.createdAt)}</time>
              </div>
              <div className="chat-bubble flex flex-col">
                {message.image && (
                  <img src={message.image} alt="attachment" className="sm:max-w-[200px] rounded-md mb-2"/>
                )}
                {message.text && <p>{message.text}</p>}
              </div>
            </div>
          ))
        )}
      </div>

      <MessageInput/>
    </div>
  );
};

export default ChatContainer;