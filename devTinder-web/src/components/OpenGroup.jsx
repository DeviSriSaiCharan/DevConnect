import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { createSocketConnection } from "../utils/socket";
import Toast from "./Toast";

const OpenGroup = () => {
  const { groupId } = useParams();
  const user = useSelector((store) => store.user);
  const userId = user?._id;

  const [group, setGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [connections, setConnections] = useState([]);
  const [showAddDropdown, setShowAddDropdown] = useState(false);
  const [showRemoveDropdown, setShowRemoveDropdown] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const fetchConnections = async () => {
    try {
      const res = await axios.get(import.meta.env.VITE_BASE_URL + "/user/connections", {
        withCredentials: true,
      });
      setConnections(res.data.data);
    } catch (err) {
      setShowToast(true);
      setToastMessage("Failed to fetch connections");
      setTimeout(() => {
        setShowToast(false);
      }, 3000);
    }
  };

  const handleAddMember = async (addId) => {
    setShowAddDropdown(false);
    try {
      const res = await axios.patch(
        `${import.meta.env.VITE_BASE_URL}/groups/${groupId}/add-member/${addId}`,
        {},
        { withCredentials: true }
      );
      setGroup(res.data);
    } catch (err) {
      console.error("Failed to add member", err);
      setShowToast(true);
      setToastMessage("Failed to add member");
      setTimeout(() => {
        setShowToast(false);
      }, 3000);
    }
  };

  const handleRemoveMember = async (remId) => {
    setShowRemoveDropdown(false);
    try {
      const res = await axios.patch(
        `${import.meta.env.VITE_BASE_URL}/groups/${groupId}/delete-member/${remId}`,
        {},
        { withCredentials: true }
      );
      setGroup(res.data);
    } catch (err) {
      console.error("Failed to remove member", err);
      setShowToast(true);
      setToastMessage("Failed to remove member");
      setTimeout(() => {
        setShowToast(false);
      }, 3000);
    }
  };

  const fetchGroup = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/groups/${groupId}`, {
        withCredentials: true,
      });
      setGroup(res.data);
      const groupMessages = res.data.messages.map((msg) => {
        const { text, senderId, timestamp } = msg;
        return {
          text,
          firstName: senderId?.firstName,
          lastName: senderId?.lastName,
          senderId: senderId?._id || senderId,
          timestamp,
        };
      });
      setMessages(groupMessages);
    } catch (err) {
      console.error("Failed to fetch group", err);
      setShowToast(true);
      setToastMessage("Failed to fetch group");
      setTimeout(() => {
        setShowToast(false);
      }, 3000);
    }
  };

  useEffect(() => {
    fetchConnections();
    fetchGroup();
  }, [groupId]);

  useEffect(() => {
    if (!userId) return;
    const socket = createSocketConnection();

    socket.emit("joinGroup", { groupId });

    socket.on("groupMessageReceived", ({ text, senderId, firstName, lastName, timestamp }) => {
      setMessages((prev) => [
        ...prev,
        {
          text,
          senderId,
          firstName,
          lastName,
          timestamp,
        },
      ]);
    });

    return () => socket.disconnect();
  }, [groupId, userId]);

  const sendMessage = () => {
    const socket = createSocketConnection();
    socket.emit("sendGroupMessage", {
      groupId,
      userId,
      text: newMessage,
    });
    setNewMessage("");
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-xl shadow-lg m-5 h-[70vh] flex flex-col border border-base-300">
      {/* Header */}
      {showToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
          <Toast message={toastMessage} className="bg-red-500 text-white" />
        </div>
      )}
      <div className="flex items-center justify-between px-6 py-4 border-b border-base-200 bg-base-100 rounded-t-xl relative">
        <div className="flex flex-col gap-1">
          <span className="font-bold text-lg text-primary">{group?.name || "Group"}</span>
          <span className="text-xs text-base-content opacity-70">
            Members: {group?.participants?.map(p => p.firstName).join(", ")}
          </span>
        </div>

        <div className="flex gap-2">
          <div className="relative">
            <button
              className="btn btn-sm btn-outline"
              onClick={() => {
                setShowAddDropdown(!showAddDropdown);
                setShowRemoveDropdown(false);
              }}
            >
              + Add Member
            </button>
            {showAddDropdown && (
              <div className="absolute right-0 mt-2 w-52 bg-white  text-black border border-gray-200 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                {connections
                  .filter((conn) => !group?.participants?.some(p => p._id === conn._id))
                  .map((conn) => (
                    <button
                      key={conn._id}
                      onClick={() => handleAddMember(conn._id)}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                    >
                      {conn.firstName} {conn.lastName}
                    </button>
                  ))}
              </div>
            )}
          </div>

          <div className="relative">
            <button
              className="btn btn-sm btn-outline text-red-500 border-red-500 hover:bg-red-100"
              onClick={() => {
                setShowRemoveDropdown(!showRemoveDropdown);
                setShowAddDropdown(false);
              }}
            >
              - Remove Member
            </button>
            {showRemoveDropdown && (
              <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                {group?.participants
                  ?.filter((p) => p._id !== userId)
                  .map((participant) => (
                    <button
                      key={participant._id}
                      onClick={() => handleRemoveMember(participant._id)}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-100"
                    >
                      {participant.firstName} {participant.lastName}
                    </button>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chat Body */}
      <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2" style={{ background: '#f8fafc' }}>
        {messages.map((msg, index) => {
          const isMe = msg.senderId === userId;
          return (
            <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs flex flex-col items-${isMe ? 'end' : 'start'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-sm">
                    {msg.firstName?.[0] || ''}{msg.lastName?.[0] || ''}
                  </div>
                  <time className="text-xs text-gray-500 font-medium">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </time>
                </div>
                <div className={`w-full ${isMe ? 'flex justify-end' : 'flex justify-start'}`}>
                  <span className={`text-base break-words px-4 py-2 rounded-2xl shadow-md inline-block ${isMe ? 'bg-primary text-white' : 'bg-gray-200 text-gray-900'}`}>{msg.text}</span>
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
        <button onClick={sendMessage} className="px-6 py-2 rounded-md bg-primary text-white hover:bg-[#e14c6c] transition-colors">
          Send
        </button>
      </div>
    </div>
  );
};

export default OpenGroup;
