'use strict'

const express = require('express')
const { Server } = require('http')
const socketio = require('socket.io')
const twilio = require('twilio')(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN)

const app = express()
const server = Server(app)
const io = socketio(server)
const PORT = process.env.PORT || 3000
const Users = []
let room

//SET



//USE
app.use(express.static('client'))

//ROUTES



//SOCKETS
io.on('connection', socket => {
	console.log(`Socket connected on: ${socket.id}`)
	Users.push(socket.id)
	io.emit('new user', Users)

	socket.on('call', socketToCall => { 
		socket.broadcast.to(socketToCall).emit('answer or reject', socket.id);
	})

	socket.on('join', callersRoom => {
		room = callersRoom
		socket.join(callersRoom)
		socket.broadcast.to(callersRoom).emit('room ready')
	})

	socket.on('call rejected', caller => {
		socket.broadcast.to(caller).emit('call rejected');
	})

  socket.on('getTokens', () => {
    twilio.tokens.create((err, response) =>{
      if(err){
        console.log(err);
      } else {
        socket.emit('tokens', response);
      }
    })
  })

  socket.on('candidate', (candidate) => {
    socket.broadcast.to(room).emit('candidate', candidate);
  });  

	socket.on('disconnect', () => {
		let removeUser = Users.indexOf(`${socket.id}`)
		Users.splice(removeUser, 1)
		console.log(`${socket.id} disconnected`)
		io.emit('user disconnect', Users)
	})
})

//LISTEN
server.listen(PORT, () => console.log(`Server listening on port: ${PORT}`))
