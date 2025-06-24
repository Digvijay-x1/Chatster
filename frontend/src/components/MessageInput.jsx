import React, { useRef, useState } from 'react'
import { useChatStore } from '../store/useChatStore';
import { Image, X, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  const { sendMessage, selectedUser } = useChatStore();

  const handleSendMessage = async(e) => {
    e.preventDefault();
    if(!text.trim() && !imagePreview) return;
    if(!selectedUser) {
      toast.error("No chat selected");
      return;
    }

    setIsLoading(true);
    setUploadProgress(0);
    
    try {
      // For larger images, the upload might take some time
      // Simulate progress for better UX
      if(imagePreview) {
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return 90;
            }
            return prev + 10;
          });
        }, 500);
        
        // Clean up interval on completion
        setTimeout(() => clearInterval(progressInterval), 10000);
      }
      
      await sendMessage({
        text: text.trim(),
        image: imagePreview,
      });
      
      setUploadProgress(100);
      setText("");
      setImagePreview(null);
      if(fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error(error?.response?.data?.message || "Failed to send message");
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };
  
  const removeImage = () => {
    setImagePreview(null);
    if(fileInputRef.current) fileInputRef.current.value = "";
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if(!file) return;
    
    // Check file type
    if(!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    
    // Check file size (limit to 10MB)
    if(file.size > 10 * 1024 * 1024) {
      toast.error("Image size should be less than 10MB");
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };
  
  return (
    <div className="p-4 w-full">
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
            />
            <button
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300
              flex items-center justify-center"
              type="button"
              disabled={isLoading}
            >
              <X className="size-3" />
            </button>
          </div>
          
          {isLoading && uploadProgress > 0 && (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Loader className="animate-spin size-4" />
                <span className="text-xs">{uploadProgress}% uploaded</span>
              </div>
              <div className="w-24 h-1.5 bg-base-300 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full" 
                  style={{width: `${uploadProgress}%`}}
                />
              </div>
            </div>
          )}
        </div>
      )}
      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            className="w-full input input-bordered rounded-lg input-sm sm:input-md"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isLoading}
            maxLength={5000}
          />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
            disabled={isLoading}
          />

          <button
            type="button"
            className={`hidden sm:flex btn btn-circle
                     ${imagePreview ? "text-emerald-500" : "text-zinc-400"}`}
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
          >
            <Image size={20} />
          </button>
        </div>
        <button 
          type="submit" 
          className="btn btn-primary btn-sm sm:btn-md"
          disabled={isLoading || (!text.trim() && !imagePreview)}
        >
          {isLoading ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
};

export default MessageInput;