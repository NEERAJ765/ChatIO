import React, { useEffect, useRef } from 'react'
import assets, { messagesDummyData } from '../assets/assets'
import { formatMessageTime } from '../lib/utils'
import { useContext } from 'react'
import { Chatcontext } from '../../context/chatContext'
import { AuthContext } from '../../context/AuthContext'
import { useState } from 'react'
const ChatContainer = () => {

  const {messages,selectedUser,setSelectedUser,sendMessage,getMessages}  = useContext(Chatcontext);
  const {authUser,onlineUsers}  = useContext(AuthContext);

  const scrollEnd = useRef();
  const [input,setInput] = useState('');

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if(input.trim() === "") return null;
    await sendMessage({text : input.trim()});
    setInput("");
  }

  //handle sending an image

  const handleSendImage = async (e) => {
    const file = e.target.files[0];
    if(!file || !file.type.startsWith("image/")){
      toast.error("Select an image file");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = async () => {
      await sendMessage({image : reader.result});
      e.target.value = "";
    }
    reader.readAsDataURL(file);
  }

    useEffect(() => {
      if(selectedUser){
        getMessages(selectedUser._id)
      }
    },[selectedUser])

  useEffect(() => {
    if (scrollEnd.current && messages) {
      scrollEnd.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])
  return selectedUser ? (
    <div className='h-full overflow-scroll relative backdrop-blur-lg'>
      {/* this is the prfile header part */}
      <div className='flex items-center gap-3 py-3 mx-4 border-b border-stone-500'>
        <img src={selectedUser.profilePic || assets.avatar_icon} alt="profile_martin not found" className="w-8 rounded-full" />
        <p className='flex-1 text-lg text-white flex items-center gap-2'>
          {selectedUser.fullname}
          {onlineUsers.includes(selectedUser._id) && <span className='w-2 h-2 rounded-full bg-green-500'>
          </span> }
        </p>
        <img onClick={() => setSelectedUser(null)} src={assets.arrow_icon} alt="arrow_icon not found" className='md:hidden max-w-7' />
        <img src={assets.help_icon} alt="help_icon not found" className='max-md:hidden max-w-5' />
      </div>
      {/* chat area */}
      

      <div className='flex flex-col h-[calc(100%-120px)] overflow-y-scroll p-3 pb-6'>
        {messages.map((msg, index) => {
          const isSender = msg.senderId === authUser._id;

          return (
            <div
              key={index}
              className={`flex items-end gap-2 mb-4 ${isSender ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-end gap-2 ${isSender ? 'flex-row' : 'flex-row-reverse'}`}>
                {/* Message bubble or image */}
                {msg.image ? (
                  <img
                    src={msg.image}
                    alt="msg.image not found"
                    className="max-w-[230px] border border-gray-700 rounded-lg overflow-hidden"
                  />
                ) : (
                  <p
                    className={`p-2 max-w-[200px] md:text-sm font-light rounded-lg break-all text-white ${isSender
                      ? 'bg-violet-500/30 rounded-br-none'
                      : 'bg-black/50 rounded-bl-none'
                      }`}
                  >
                    {msg.text}
                  </p>
                )}

                {/* Avatar and timestamp */}
                <div className="text-center text-xs">
                  <img
                    src={isSender ? authUser?.profilePic : selectedUser?.profilePic || assets.avatar_icon}
                    alt="avatar_icon not found"
                    className="w-7 rounded-full"
                  />
                  <p className="text-gray-500">{formatMessageTime(msg.createdAt)}</p>
                </div>
              </div>
            </div>
          );
        })}

        <div ref={scrollEnd}></div>
      </div>



      {/* bottom area */}


      <div className="absolute bottom-0 left-0 right-0 flex items-center gap-3 p-3">
        <div className='flex-1 flex items-center bg-gray-100/12 px-3 rounded-full'>
          <input onChange={(e) => setInput(e.target.value)} value={input} 
                      onKeyDown={(e) => e.key === "Enter" ? handleSendMessage(e) : null} 
                      type="text" placeholder='Send a message' 
                      className='flex-1 text-sm p-3 border-none rounded-lg outline-none text-white placeholder-gray-400' />
          <input onChange={handleSendImage} type="file" id='image' accept='image/png, image/jpeg' hidden />
          <label htmlFor="image">
            <img src={assets.gallery_icon} alt="gallery_icon not found" className="w-5 mr-2 cursor-pointer" />
          </label>
        </div>
        <img onClick={handleSendMessage} src={assets.send_button} alt="send_button not found" className='w-7 cursor-pointer' />
      </div>




    </div>
  ) : (
    <div className='flex flex-col items-center justify-center gap-2 text-gray-500
                             bg-white/10 max-md:hidden'>
      <img src={assets.logo_icon} alt="logo_icon not found" className='max-w-16' />
      <p className='text-lg font-medium text-white'> Chit Chat anytime, anywhere</p>
    </div>
  )
}

export default ChatContainer
