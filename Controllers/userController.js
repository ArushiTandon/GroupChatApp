const bcrypt = require('bcrypt');
const User = require('../Models/userModel');
// const UserFile = require('../models/userFiles');
// const { generateToken } = require('../middlewares/jwt');
const sequelize = require('../util/db');

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
        })
    } catch (error) {
        await t.rollback();
        console.error('ERROR:', error);
        res.status(400).json({error: 'Error creating user'});
    }
};

// exports.login = async(req, res) => {
   
//     const {username, password} = req.body;
    
//     try {
        
//         const user = await User.findOne({ where: { username } });
//         // console.log('Found User:', user);

//         if (!user) {
//             console.log('Invalid username or password');
//             return res.status(401).json({ error: 'Invalid username or password' });
//         }

//         // console.log('Login - Stored Hash:', user.password);
//         // console.log('Login - Password Match:', await bcrypt.compare(password, user.password));

//         const isPasswordValid = await bcrypt.compare(password, user.password);
//         console.log('Password Valid:', isPasswordValid);

//         if(!user || !(isPasswordValid)) {
//             // console.log('Invalid username or password');
//             return res.status(401).json({error: 'Invalid username or password'});
//         }

//         const payload = {
//             id: user.id,
//             username: user.username,
//         };

//         const token = generateToken(payload);

//         return res.status(200).json({
//             message: 'Login successful!',
//             token: token,
//             redirectUrl: '/addExpense',
//         });

//     } catch (error) {
//         console.error('error:', error);
//         res.status(400).json({error: 'Error logging in'});
//     }
// }

// exports.getUserInfo = async (req, res) => {
//     const userId = req.user.id;
    
//     try {
//       const user = await User.findByPk(userId, {
//         attributes: ['id', 'username', 'email', 'isPremium'],
//       });
//       res.status(200).json(user);
//     } catch (error) {
//       console.error('Error fetching user info:', error.message);
//       res.status(500).json({ error: 'Failed to fetch user info' });
//     }
//   };
  
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