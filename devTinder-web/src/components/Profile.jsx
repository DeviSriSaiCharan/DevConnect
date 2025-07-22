import Editprofile from "./Editprofile";
import {useSelector} from "react-redux";

const Profile=()=>{
   const user=useSelector((store)=>store.user);
    return(
       (user&&<div>
         <Editprofile user={user}/> 
       </div>)
    );
};

export default Profile;