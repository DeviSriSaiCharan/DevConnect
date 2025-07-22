require('dotenv').config();
const express= require('express');
const app= express();
require('./config/database');
const connectDb = require('./config/database');
const cookieParser = require('cookie-parser');
const authRouter = require('./routes/auth');
const profileRouter = require('./routes/profile');
const requestRouter = require('./routes/requests');
const userRouter = require('./routes/user');
const chatRouter = require('./routes/chat');
const router = require('./routes/group');
const cors=require('cors');
const http = require('http');
const initializeSocket = require('./utils/socket');
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use("/uploads",express.static("uploads"));

app.use('/', authRouter);
app.use('/profile', profileRouter);
app.use('/', requestRouter);
app.use('/user',userRouter);
app.use('/', chatRouter);
app.use('/', router);

const server = http.createServer(app);
initializeSocket(server);
//start the server
connectDb().then(()=>{
    console.log('connected to database');
    const PORT = process.env.PORT || 1511;
    server.listen(PORT ,()=>{
    console.log(`Server is listening on port ${PORT}`);
});
}).catch(err => console.log(err));
