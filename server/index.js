const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const userRoutes = require('./routes/userRoutes');
const app = express();
const messageRoute = require('./routes/messagesRoute');
const socket = require('socket.io');
require("dotenv").config();


app.use(cors());
app.use(express.json());


app.use("/api/auth",userRoutes);
app.use("/api/messages",messageRoute);



mongoose.connect(process.env.MONGO_URL,{
    useNewUrlParser:true,
    useUnifiedTopology:true,
}).then(()=>{
    console.log("BD connect success.");
}).catch((err)=>{
    console.log(err.message);
});


const server = app.listen(process.env.PORT,()=>{
    console.log('server started: ',process.env.PORT);
})


const io = socket(server,{
    cors:{
        origin:"http://localhost:3000",
        credentials:true,
    },
})

//storing all online user in map
global.onlineUsers = new Map();

io.on("connection",(socket)=>{
    //storing chatsocket inside global socket on connection
    global.chatSocket = socket;

    //establish socket connection on user login
    socket.on("add-user",(userId)=>{
        onlineUsers.set(userId,socket.id);
    })

    //when message is sent
    socket.on("send-msg",(data)=>{
        const sendUserSocket = onlineUsers.get(data.to);
        //check for online user
        if(sendUserSocket){
            socket.to(sendUserSocket).emit("msg-recieve",data.message);
        }
    });
});