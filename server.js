const express = require('express');
const path = require('path');
const sequelize = require('./util/db');
const passport = require('./middlewares/auth');
require('dotenv').config();


//Routes
const userRoutes = require('./Routes/userRoutes');

//Models
const User = require('./Models/userModel');


const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/user/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Login', 'login.html'));
});

app.get('/user/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'SignUp', 'signUp.html'));
});


app.use('/user', userRoutes);


sequelize.sync({ alter: true })
    .then(() => {
        console.log('Database synced');
        app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));
    })
    .catch((err) => console.error('Failed to sync database:', err));
