import axios from "axios";
import {useDispatch} from "react-redux";
import {addFeed,removeUserFromFeed} from "../utils/feedSlice";
const Usercard=({user})=>{
    const dispatch=useDispatch();
    const {_id,firstName,lastName,photoURL,age,gender,about,skills}=user;
   const handleSendRequest=async(status,userId)=>{
    try{
       const res=await axios.post(import.meta.env.VITE_BASE_URL+"/send/"+ status +"/"+userId || "http://localhost:1511/send/"+ status +"/"+userId,{},{withCredentials:true});
       dispatch(removeUserFromFeed(userId));
    }catch(err){
      console.log(err);
    }
   }
  
    return (
        <div className=" bg-base-300 rounded-xl shadow-md border border-base-300 w-80 p-6 flex flex-col items-center transition hover:shadow-lg">
          <div className="mb-4">
            <img
              src={photoURL}
              alt="User_img"
              className="w-48 h-48 object-cover rounded-lg"
            />
          </div>
          <h2 className="font-bold text-2xl text-center mb-1 text-white">{firstName + " " + lastName}</h2>
          {age && gender && <p className="text-sm text-gray-300 mb-1">{age} {gender}</p>}
          <p className="text-center text-sm text-gray-200 mb-2 font-medium">Skills: {skills}</p>
          <p className="text-center text-xs text-gray-400 mb-4">{about}</p>
          <div className="flex gap-3 w-full justify-center">
            <button
              className="px-4 py-2 rounded-md text-white bg-secondary"
              onClick={() => handleSendRequest("ignore", _id)}
            >
              Ignore
            </button>
            <button
              className="px-4 py-2 rounded-md text-white bg-primary"
              onClick={() => handleSendRequest("interested", _id)}
            >
              Interested
            </button>
          </div>
        </div>
    );
};

export default Usercard;