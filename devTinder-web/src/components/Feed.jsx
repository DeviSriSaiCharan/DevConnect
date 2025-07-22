import axios from "axios";
import {useDispatch, useSelector } from "react-redux";
import {addFeed} from "../utils/feedSlice";
import { useEffect } from "react";
import Usercard from "./Usercard";


const Feed =()=>{
    const feed=useSelector((store)=>store.feed);
    const dispatch=useDispatch();

    const getFeed=async()=>{
        if (feed && feed.length > 0) return;
       try{
        const res = await axios.get(import.meta.env.VITE_BASE_URL+"/user/feed", { withCredentials: true });
        dispatch(addFeed(res.data.data));
       }catch(err){
         console.error("error", err.message);
         // Optionally: setError(err.message); if you want to show it in the UI
       }
    };
    useEffect(()=>{
        getFeed();
    },[]);
if(!feed) return <div className="flex justify-center items-center my-10">Loading...</div>;
if(feed.length===0) return <p className="flex justify-center items-center my-10">No users found..</p>
   return (
    <div className="flex justify-center my-10">
      <Usercard user={feed[0]} />
    </div>
  );
};

export default Feed;