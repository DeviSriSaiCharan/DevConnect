import io from 'socket.io-client';


export const createSocketConnection=()=>{
    if(location.hostname === "localhost"){
        return io(import.meta.env.VITE_BASE_URL || "http://localhost:1511");
    }else{
        return io("/",{path:"/api/socket.io"});
    }
   
}