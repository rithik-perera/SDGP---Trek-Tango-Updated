
const User = require('../models/userSchema');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');
const emailAddress = process.env.emailAddress;
const emailPassword = process.env.emailPassword;


const hashPassword = (password, salt) => {
    return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
}


function generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }



const registerUser = async(req, res) => {
    const { username, email, password, firstName, lastName, dob } = req.body;
    try {
        
        if (!username || !email || !password || !firstName || !lastName ||!dob) {
            return res.status(400).json({ error: 'All fields are required' });
        }

       
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({ error: 'Existing Username or Email' });
        }

        
        const salt = crypto.randomBytes(16).toString('hex');

     
        const hashedPassword = hashPassword(password, salt);

       
        const newUser = new User({
            userID: uuidv4(),
            username,
            email,
            password: hashedPassword,
            salt,
            name: {firstName, lastName},
            dob
        });

       
        await newUser.save();
        console.log('User registered successfully');
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}



const loginUser = async(req, res) => {
    const {usernameOrEmail, password} = req.body;

    try {
        
        const user = await User.findOne({ $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }]});
    
        if (!user) {
          return res.status(401).json({ error: 'Invalid Username or Email Address' });
        }
    
        
        const hashedPassword = hashPassword(password, user.salt);

        if (hashedPassword !== user.password) {
            return res.status(401).json({ error: 'Invalid Password' });
          }    
          
       
        res.status(200).json({ message: 'User authenticated successfully' });
         } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
         }
} 

const sendVerificationCode = async (req, res) => {
    try {
      const email = req.body.email;
  
      if (!email) {
        return res.status(400).json({ error: 'Please input the e-mail' });
      }
  
      
      const user = await User.findOne({ email });
  
      if (!user) {
        return res.status(404).json({ error: 'No existing user with the provided e-mail' });
      }
  
      
      const firstName = user.name.firstName;
  
     
      const verificationCode = generateVerificationCode();
  
     
      user.verificationCode = verificationCode;
      await user.save();
  
      
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: emailAddress, 
          pass: emailPassword, 
        },
      });
  
      const mailOptions = {
        from: 'Trek Tango',
        to: user.email,
        subject: 'Verification Code',
        text: `Dear ${firstName},
  
  Thank you for choosing Trek Tango! To ensure the security of your account, we require verification before proceeding with any changes, including password resets.
  
  *Please use the following verification code to confirm your identity: ${verificationCode}.*
  
  Once you've received this email, kindly enter the provided code in the appropriate field within the Trek Tango application. This step helps us confirm that you are the rightful owner of the account and helps safeguard your personal information.
  
  If you did not initiate this action or have any concerns regarding your account security, please contact our support team immediately at (Insert e-mail address and phone number here). We're here to assist you and ensure your experience with Trek Tango remains safe and enjoyable.
  
  Thank you for your cooperation in maintaining the security of your account.
  
  Best regards,
  
  Team Trek Tango`,
      };
      
       
      await transporter.sendMail(mailOptions);
     
      res.status(200).json({ message: 'Verification code sent successfully' });
    } catch (error) {
      console.error('There was an error encountered when sending the verification code:', error);
      res.status(500).json({ error: 'Failed to send verification email' });
    }
  }

const forgotPassword = async(req, res) => {
        const { email, verificationCode, newPassword } = req.body;
          
            try {
            
              const user = await User.findOne({ email });
          
              if (!user) {
                return res.status(404).json({ error: 'User not found' });
              }
          
             
              if (!user.verificationCode) {
                return res.status(400).json({ error: 'The verification code has not been generated' });
              }
          
              
              if (verificationCode !== user.verificationCode) {
                return res.status(401).json({ error: 'Incorrect Verification Code' });
              }
          
             
              user.verificationCode = null;
          
             
              await user.save();
          
             
              const changePasswordResult = await resetPassword(user.username, newPassword);
          
              if (!changePasswordResult.success) {
                return res.status(500).json({ error: 'Failed to change password' });
              }
          
              return res.status(200).json({ message: 'Password has been changed successfully' });
            } catch (error) {
              console.error('Error resetting password:', error);
              return res.status(500).json({ error: 'Internal Server Error' });
            }
}

const resetPassword = async (username, newPassword) => {
    try {
       
        const user = await User.findOne({ username });
  
        if (!user) {
            return { success: false, error: 'No user found with the  given username' };
        }
  
        
        const newSalt = crypto.randomBytes(16).toString('hex');
        const hashedNewPassword = hashPassword(newPassword, newSalt);
  
       
        user.password = hashedNewPassword;
        user.salt = newSalt;
  
     
        await user.save();
  
        return { success: true, message: 'The password has been resetted successfully' };
    } catch (error) {
        console.error(error);
        return { success: false, error: 'Internal Server Error' };
    }
  };

  const getIdByUsernameOrEmail = async (req, res) => {
    try {
      const { usernameOrEmail } = req.params; // Assuming username is passed in the query parameters
  
      
      const user = await User.findOne({ $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }]});
  
     
      const userID = await user.userID;
  
      if (userID) {
       
        res.status(200).json({ userID: userID });
      } else {
       
        res.status(404).json({ error: 'User not found' });
      }
    } catch (error) {
      
      console.error('Error fetching userid by username:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  const addPoints = async (req, res) => {
    const { username, points } = req.body;

    try {
       
        const user = await User.findOne({username});

        
        user.points += points; 
        
   
        await user.save();

        res.status(200).json({ message: "Points updated successfully", user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};

const getPoints = async (req, res) => {
    try {
        const { username } = req.params;

        const user = await User.findOne({username});

        const points = user.points;

        res.json(points);
    } catch (error) {
        res.status(500);
    }
}



module.exports = {registerUser, loginUser, sendVerificationCode, forgotPassword, getIdByUsernameOrEmail, addPoints, getPoints};
    
