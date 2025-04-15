const express = require('express');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const sequelize = require('./util/db');
const passport = require('./Middlewares/auth');
const cors = require('cors');
require('./Services/archiver');
require('dotenv').config();


//Routes
const userRoutes = require('./Routes/userRoutes');
const messageRoutes = require('./Routes/messageRoutes');
const groupRoutes = require('./Routes/groupRoutes');

//Models
const User = require('./Models/userModel');
const UserGroups = require('./Models/userGroups');
const Groups = require('./Models/groupsModel');
const GroupMessage = require('./Models/groupMessage');
const Private = require('./Models/privateModel');

//controllers
const { saveGroupMessage } = require('./Controllers/groupController');


const app = express();
const PORT = process.env.PORT;
const server = http.createServer(app); 
const io = new Server(server);


app.use(passport.initialize());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

//socket
const userSocketMap = {}; 

io.on('connection', (socket) => {
  console.log('a user connected', socket.id);

  // When client registers after connecting
  socket.on('register_user', (userId) => {
    userSocketMap[userId] = socket.id;
    console.log(`Registered user ${userId} with socket ${socket.id}`);
  });

  // Handle private messages
  socket.on('send_message', (data) => {
    const { receiverId, message, senderId, mediaUrl} = data;
    const receiverSocketId = userSocketMap[receiverId];

    if (receiverSocketId) {
      io.to(receiverSocketId).emit('receive_message', {
        message,
        senderId,
        mediaUrl, 
      });
    }
  });

  // Handle group joining
  socket.on("join_groups", (groupIds) => {
    groupIds.forEach(groupId => {
      socket.join(`group_${groupId}`);
    });
  });

  // Handle group messages
  socket.on("send_group_message", async ({ groupId, message, senderId, mediaUrl }) => {
    await saveGroupMessage(groupId, message, senderId, mediaUrl);

    io.to(`group_${groupId}`).emit("receive_group_message", {
      groupId,
      senderId,
      message,
      mediaUrl,
    });
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');

    // Clean up userSocketMap
    for (const [userId, socketId] of Object.entries(userSocketMap)) {
      if (socketId === socket.id) {
        delete userSocketMap[userId];
        break;
      }
    }
  });
});



//serving static files
app.use(express.static(path.join(__dirname, 'public')));

app.get('/user/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Login', 'login.html'));
});

app.get('/user/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'SignUp', 'signUp.html'));
});

app.get('/chats', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'chats', 'chats.html'));
});


app.use('/user', userRoutes);
app.use('/chats', messageRoutes);
app.use('/groups', groupRoutes);

//Associations
User.hasMany(Private, { foreignKey: 'sender_id' });
User.hasMany(Private, { foreignKey: 'receiver_id' });
User.hasMany(GroupMessage, { foreignKey: 'user_id' });
User.belongsToMany(Groups, { through: UserGroups, foreignKey: 'user_id', otherKey: 'group_id' });

Groups.hasMany(GroupMessage, { foreignKey: 'group_id' });
Groups.belongsToMany(User, { through: UserGroups, foreignKey: 'group_id', otherKey: 'user_id' });

UserGroups.belongsTo(User, { foreignKey: 'user_id' });

GroupMessage.belongsTo(Groups, { foreignKey: 'group_id' });
GroupMessage.belongsTo(User, { foreignKey: 'user_id' });

Private.belongsTo(User, { foreignKey: 'sender_id' });
Private.belongsTo(User, { foreignKey: 'receiver_id' });


sequelize.sync({ alter: false }) 
    .then(() => {
        console.log('Database synced');
        server.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));
    })
    .catch((err) => console.error('Failed to sync database:', err));
