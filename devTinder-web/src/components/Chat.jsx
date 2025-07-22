import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { createSocketConnection } from "../utils/socket";
import { useSelector } from "react-redux";
import axios from "axios";


const Chat = () => {
  const { targetUserId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const user = useSelector((store) => store.user);
  const userId = user?._id;

  const fetchChatMessages = async () => {
    const chat = await axios.get(import.meta.env.VITE_BASE_URL + "/chat/" + targetUserId, {
      withCredentials: true,
    });
    const mappedMessages = chat?.data?.messages.map((msg) => {
      const { senderId, text, timestamp, createdAt } = msg;
      return {
        firstName: senderId?.firstName,
        lastName: senderId?.lastName,
        text,
        timestamp: timestamp || createdAt
      };
    });
    setMessages(mappedMessages);
  };
  useEffect(() => {
    fetchChatMessages();
  }, []);

  useEffect(() => {
    if (!userId) {
      return;
    }
    const socket = createSocketConnection();
    socket.emit("joinChat", {
      firstName: user.firstName,
      userId,
      targetUserId,
    });

    socket.on("messageReceived", ({ firstName, lastName, text, timestamp }) => {
  setMessages((messages) => [...messages, { firstName, lastName, text, timestamp }]);
});

    return () => {
      socket.disconnect();
    };
  }, [userId, targetUserId]);

  const sendMessage = () => {
    const socket = createSocketConnection();
    socket.emit("sendMessage", {
      firstName: user.firstName,
      lastName: user.lastName,
      userId,
      targetUserId,
      text: newMessage,
      timestamp: new Date(),
    });
    setNewMessage("");
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-xl shadow-lg m-5 h-[70vh] flex flex-col border border-base-300">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-base-200 bg-base-100 rounded-t-xl">
        <div className="flex items-center gap-3">
          <span className="font-bold text-lg text-primary">Chat</span>
        </div>
        <span className="text-xs text-base-content opacity-70">{user?.firstName}</span>
      </div>
      {/* Chat Body */}
      <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2" >
        {messages.map((msg, index) => {
          const isMe = user.firstName === msg.firstName;
          return (
            <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}> 
              <div className={`max-w-xs flex flex-col items-${isMe ? 'end' : 'start'}`}> 
                <div className="flex items-center gap-2 mb-1">
                  {/* Avatar (initials) */}
                  <div className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-sm">
                    {msg.firstName?.[0] || ''}{msg.lastName?.[0] || ''}
                  </div>
                  <time className="text-xs text-gray-500 font-medium">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </time>
                </div>
                <div className={`w-full ${isMe ? 'flex justify-end' : 'flex justify-start'}`}> 
                  <span className={`text-base break-words px-4 py-2 rounded-2xl shadow-md inline-block ${isMe ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-900'}`}>{msg.text}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {/* Input */}
      <div className="p-4 border-t border-base-200 bg-base-100 rounded-b-xl flex items-center gap-2">
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 border border-base-300 text-base-content rounded-lg p-2 bg-base-100 focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Type your message..."
        />
        <button onClick={sendMessage} className="px-6 py-2 rounded-md bg-blue-500 text-white  transition-colors">
          Send
        </button>
      </div>
    </div>
  );
};
export default Chat;