const bcrypt = require('bcrypt');
const User = require('../Models/userModel');
// const UserFile = require('../models/userFiles');
const { generateToken } = require('../middlewares/jwt');
const sequelize = require('../util/db');
const { Op } = require('sequelize');


exports.signUp = async (req, res) => {
    
    const {username, email, phone, password} = req.body;
    const t = await sequelize.transaction();

    try {
        const user = await User.findOne({ where: { username } });
      
        if(user) {
            console.log('Username already exists');
            return res.status(200).json({ message: 'Username already exists'});
        }

        const newUser = await User.create({username, email, phone, password});
        await t.commit();
        
        res.status(201).json({userId: newUser.id,
            message: 'ACCOUNT CREATED!',
            redirectUrl: '/user/login',
        })
    } catch (error) {
        await t.rollback();
        console.error('ERROR:', error);
        res.status(400).json({error: 'Error creating user'});
    }
};

exports.login = async(req, res) => {
   
    const {email, password} = req.body;
    
    try {
        
        const user = await User.findOne({ where: { email } });
        // console.log('Found User:', user);

        if (!user) {
            console.log('Invalid email or password');
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // console.log('Login - Stored Hash:', user.password);
        // console.log('Login - Password Match:', await bcrypt.compare(password, user.password));

        const isPasswordValid = await bcrypt.compare(password, user.password);
        console.log('Password Valid:', isPasswordValid);

        if(!user || !(isPasswordValid)) {
            console.log('Invalid email or password');
            return res.status(401).json({error: 'Invalid email or password'});
        }

        const payload = {
            username: user.username,
            id: user.id,
            email: user.email,
        };

        const token = generateToken(payload);

        return res.status(200).json({
            message: 'Login successful!',
            token: token,
            redirectUrl: '/chats',
        });

    } catch (error) {
        console.error('error:', error);
        res.status(400).json({error: 'Error logging in'});
    }
}

exports.getUsers = async (req, res) => {

    const userId = req.user.id;
    
    try {
        const users = await User.findAll({
            where: {
                id: { [Op.ne]: userId }, 
              },
            attributes: ['id', 'username']
        })

        res.status(200).json({
            users: users,
            redirectUrl: '/chats',
        });        

    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({message: 'Failed to fetch users'});   
    }
   
  };
  
//   exports.getUserFiles = async (req, res) => {

//     try {
//         const userId = req.user.id;

//         const files = await UserFile.findAll({
//             where: { userId },
//             order: [['createdAt', 'DESC']],
//         });

//         res.json({success: true, files});
        
//     } catch (error) {
//         console.error('Error fetching user files:', error);
//         res.status(500).json({success: false, message: 'Failed to fetch'});   
//     }

//   };