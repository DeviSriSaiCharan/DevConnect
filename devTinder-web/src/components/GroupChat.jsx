import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Toast from "./Toast";


const GroupChat = () => {
  const user = useSelector((store) => store.user);
  const userId=user?._id;
  const [connections, setConnections] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [groups, setGroups] = useState([]);
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

  const fetchGroups = async () => {
    try {
      const res = await axios.get(import.meta.env.VITE_BASE_URL + "/groups", {
        withCredentials: true,
      });
      setGroups(res?.data || []);
    } catch (err) {
      setShowToast(true);
      setToastMessage("Failed to fetch groups");
      setTimeout(() => {
        setShowToast(false);
      }, 3000);
    }
  };
  useEffect(() => {
    if (userId) {
      setSelectedUserIds([userId]);
    }
  }, [userId]);

  useEffect(() => {
    fetchConnections();
    fetchGroups();
  }, []);

  const toggleSelectUser = (userId) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };    

  const handleCreateGroup = async () => {
    if (!groupName || selectedUserIds.length === 0 || selectedUserIds.length < 2) {
      setShowToast(true);
      setToastMessage("Please enter a group name and select at least 3 members.");
      setTimeout(() => {
        setShowToast(false);
      }, 3000);
      return;
    }
    try {
      await axios.post(
        import.meta.env.VITE_BASE_URL + "/create-group",
        {
          name: groupName,
          participants: selectedUserIds,
        },
        { withCredentials: true }
      );
      setGroupName("");
      setSelectedUserIds([userId]);
      fetchGroups();
    } catch (err) {
      setShowToast(true);
      setToastMessage(err.response.data.error||"Group creation failed");
      setTimeout(() => {
        setShowToast(false);
      }, 3000);
    }
  };

  return (
<div className="max-w-3xl mx-auto p-6 min-h-screen">
      {showToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
          <Toast message={toastMessage} className="bg-red-500 text-white" />
        </div>
      )}
      <h1 className="text-3xl font-bold mb-6 text-primary">Group Chat</h1>

      {/* Group Name Input */}
      <div className="mb-6">
        <input
          type="text"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          placeholder="Enter Group Name"
          className="w-full p-3 rounded-lg border border-base-300 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Vertical list of users like WhatsApp */}
      <h2 className="text-xl font-semibold mb-3">Select People</h2>
      <div className="space-y-3 max-h-[300px] overflow-y-auto mb-8">
        {connections.map((conn) => {
          const isSelected = selectedUserIds.includes(conn._id);
          return (
            <div
              key={conn._id}
              onClick={() => toggleSelectUser(conn._id)}
              className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-all border ${
                isSelected ? "bg-primary text-white border-primary" : "bg-base-200 border-base-300"
              }`}
            >
              <img
                src={conn.photoURL}
                alt={conn.firstName}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="text-left">
                <h3 className="font-semibold text-md">
                  {conn.firstName} {conn.lastName}
                </h3>
                <p className="text-sm opacity-80">
                  {conn.age && conn.gender ? `${conn.age}, ${conn.gender}` : ""}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <button className="btn btn-primary w-full mb-10" onClick={handleCreateGroup}>
        Create Group
      </button>

      {/* Existing Groups */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Your Groups</h2>
        {groups.length === 0 ? (
          <p className="text-gray-500">No groups created yet.</p>
        ) : (
          <div className="space-y-4">
            {groups.map((group) => (
              <div key={group._id} className="flex items-center justify-between p-4 bg-base-300 rounded-lg">
                <div>
                  <h3 className="text-lg font-semibold">{group.name}</h3>
                  <p className="text-sm opacity-80">
                    Members: {group.participants.map((m) => m.firstName).join(", ")}
                  </p>
                </div>
                { <Link to={`/group/${group._id}`}>
                  <button className="btn btn-outline btn-primary">Open</button>
                </Link> } 
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupChat;
