import {useSelector} from "react-redux";
import {Link} from "react-router-dom";
import {useDispatch} from "react-redux";
import { useNavigate } from 'react-router-dom';
import { removeUser } from '../utils/userSlice';
import axios from "axios";

const Navbar=()=>{
  const user=useSelector((store)=>store.user);
  const dispatch=useDispatch();
  const navigate = useNavigate();

  const handleLogout=async()=>{
     await axios.post(import.meta.env.VITE_BASE_URL+"/logout" || "http://localhost:1511/logout",{},{withCredentials:true});
     dispatch(removeUser());
     return navigate('/login');
  };

    return(     
      <nav className="sticky top-0 z-50"> 
     <div className="navbar bg-base-300 shadow-sm">
  <div className="flex-1">
    <Link to="/feed" className="btn btn-ghost text-xl"> 👩🏻‍💻DevConnect</Link>
  </div>
<div className="flex gap-2">
  {user && (
    <div className="flex items-center gap-2">
      <p>Welcome, {user.firstName}</p>
      <div className="dropdown dropdown-end">
        <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar mx-5">
          <div className="w-10 rounded-full">
            <img
              alt="Tailwind CSS Navbar component"
              src={user.photoURL}
            />
          </div>
        </div>
        <ul
          tabIndex={0}
          className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow"
        >
          <li><Link to="/feed">Feed</Link></li>
          <li>
            <Link to="/profile" className="justify-between">
              Profile
            </Link>
          </li>
          <li><Link to="/group">Group</Link></li>
          <li><Link to="/connections">Connections</Link></li>
          <li><Link to="/requests">Requests</Link></li>
          <li><button onClick={handleLogout}>Logout</button></li>
        </ul>
      </div>
    </div>
  )}
</div>
</div>
  </nav>
    );
};

export default Navbar;