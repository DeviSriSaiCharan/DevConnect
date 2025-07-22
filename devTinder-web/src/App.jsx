import Navbar from './components/Navbar';
import Profile from './components/Profile';
import Login from './components/Login';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import {Provider} from 'react-redux';
import store from './utils/appStore';
import axios from "axios";
import {useDispatch} from "react-redux";
import { addUser } from "./utils/userSlice"; 
import { useNavigate } from 'react-router-dom';
import {useSelector} from "react-redux";
import { useEffect } from "react";
import Feed from "./components/Feed.jsx";
import Connections from "./components/Connections.jsx";
import Requests from "./components/Requests.jsx";
import Footer from './components/Footer.jsx';
import Chat from './components/Chat.jsx';
import GroupChat from './components/GroupChat.jsx';
import OpenGroup from './components/OpenGroup.jsx'; 
function Layout() {
  const dispatch=useDispatch();
  const navigate = useNavigate();
  const userData=useSelector((store)=>store.user);

  const fetchUser=async()=>{
  if(userData) return;
   try{
     const user=await axios.get(import.meta.env.VITE_BASE_URL+"/profile" || "http://localhost:1511/profile",{withCredentials:true});
     dispatch(addUser(user.data));
   }catch(err){
    if(err.status===401){
      navigate('/login');
    }
    console.error(err);
   }
  };

  useEffect(()=>{
    fetchUser();
  },[]);
    
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  );
}

const appRouter = createBrowserRouter([
  {
    path: '/',
    element: <Layout />, 
    children: [
    {
      path:'/',
      element:<Login />
    },
  {
    path: '/login',
    element: <Login />, 
  },
  {
    path: '/profile',
    element: <Profile />, 
  },
  {
    path:'/feed',
    element:<Feed/>,
  },
  {
    path:'/connections',
    element:<Connections />,
  },{
    path:'/requests',
    element:<Requests/>
  } ,{
    path:'/chat/:targetUserId',
    element:<Chat/>
  },{
    path:'/group',
    element:<GroupChat/>
  },{
    path:'/group/:groupId',
    element:<OpenGroup/>
  }
 ],
  },
]);

function App() {
  return (
    <Provider store={store}>
      <RouterProvider router={appRouter} />
    </Provider>
  );
}
export default App;
