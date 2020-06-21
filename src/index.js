//This is Server Side
const Filter = require('bad-words')
const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const { url } = require('inspector')
const {genrateMessageAndTime, genrateUrlAndTime} = require('./utils/message')
const { adduser, removeUser, getUser, getUsersInRoom } = require('./utils/user')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

//io.on is used to set up a connection
io.on('connection', (socket) => {
    console.log('New WebSocket connection')

    /*socket.emit('message', genrateMessageAndTime('Welcome!'))
    socket.broadcast.emit('message', genrateMessageAndTime(`new user has Joined!`))*/
    
    socket.on('join', ({username, room}, callback)=>
    {
        const {error, user} = adduser({id:socket.id, username, room})
        
        if(error)
        {
            return callback(error)
        }

        socket.join(user.room)
        //Wellcome Message
        socket.emit('message', genrateMessageAndTime('Admin','Welcome!'))
        socket.broadcast.to(user.room).emit('message',genrateMessageAndTime('Admin',`${user.username} has Joined!`))

        io.to(user.room).emit('roomData',{room:user.room, users:getUsersInRoom(user.room)})

        callback()
    })

    //Sending messages between connected users
    socket.on('sendMessage', (message, callback) => 
    {
        const user = getUser(socket.id)
        const filter = new Filter

        //isProfane is a function in bad-words library
        if(filter.isProfane(message))
        {
            return callback('Profanity is not allowed!')
        }

        io.to(user.room).emit('message',genrateMessageAndTime(user.username,message))
        callback()
    })
    
    //To get location
    socket.on('sendLocation',(coords, callback)=>
    {
        const user = getUser(socket.id)
        io.to(user.room).emit('LocationMessage',genrateUrlAndTime(user.username,`https://www.google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
    })
  
    //Sending user left message to connected users 
    socket.on('disconnect',()=>
        {
            const user = removeUser(socket.id)
            if(user)
            {
                io.to(user.room).emit('message',genrateMessageAndTime('Admin',`${user.username} has Left!`))
                io.to(user.room).emit('roomData',{room:user.room, users:getUsersInRoom(user.room)})
            } 
        })  
})

server.listen(port, () => {
    console.log(`Server is up on port ${port}!`)
})