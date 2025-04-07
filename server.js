const express = require('express');
const path = require('path');
const sequelize = require('./util/db');
const passport = require('./Middlewares/auth');
const cors = require('cors');
require('dotenv').config();


//Routes
const userRoutes = require('./Routes/userRoutes');
const messageRoutes = require('./Routes/messageRoutes');

//Models
const User = require('./Models/userModel');
const UserGroups = require('./Models/userGroups');
const Groups = require('./Models/groupsModel');
const GroupMessage = require('./Models/groupMessage');
const Private = require('./Models/privateModel');


const app = express();
const PORT = process.env.PORT;

app.use(passport.initialize());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());


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

//Associations
User.hasMany(Private, { foreignKey: 'sender_id' });
User.hasMany(Private, { foreignKey: 'receiver_id' });
User.hasMany(GroupMessage, { foreignKey: 'user_id' });
User.belongsToMany(Groups, { through: UserGroups });

Groups.hasMany(GroupMessage, { foreignKey: 'group_id' });
Groups.belongsToMany(User, { through: UserGroups });

UserGroups.belongsTo(User, { foreignKey: 'user_id' });

GroupMessage.belongsTo(Groups, { foreignKey: 'group_id' });
GroupMessage.belongsTo(User, { foreignKey: 'user_id' });

Private.belongsTo(User, { foreignKey: 'sender_id' });
Private.belongsTo(User, { foreignKey: 'receiver_id' });


sequelize.sync({ alter: true })
    .then(() => {
        console.log('Database synced');
        app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));
    })
    .catch((err) => console.error('Failed to sync database:', err));
