import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';



export const register = async (req, res) =>{

    const { firstname, lastname, email, password, role, genus } = req.body;
    try {
        let { user } = req;
        if (user.role !== 'admin') {
            return res.status(403).json({ msg: 'Access denied' });
        }

        user = await User.findOne({ email });
        if (user) {
        return res.status(400).json({ msg: 'User already exists' });
        }

        user = new User({ firstname, lastname, email, password, role, genus });
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();

        res.json({ msg: 'User registered'});
    } catch (err) {
        console.error(err.message);
        if (err.code === 11000) {
        return res.status(400).json({ msg: 'Email already registered' });
        }
        res.status(500).send('Server error');
    }

}


export const login = async (req, res) =>{
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
        return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
        return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const payload = { user: { id: user.id, role: user.role } };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "30d" });

        res.json({ token, user: user });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
}

export const getAllUsers = async (req, res) =>{
    try {
        const { user } = req;
// in profile navbar it will not show genu if removed below
        // if (user.role !== 'admin') {
        //     return res.status(403).json({ msg: 'Access denied' });
        // }

        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
    }
}

export const uploadProfileImage = async (req, res) => {
    try {
      let { user } = req;
      let id = user.id;

      user = await User.findById(id);
  
      if (!user) {
        return res.status(404).json({ msg: 'User not found' });
      }

      if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({ msg: 'No file uploaded' });
      }
  
      const file = req.files.profileImage;
  
      if (!file) {
        return res.status(400).json({ msg: 'No file found with the name profileImage' });
      }
  
      const base64Image = file.data.toString('base64');
  

      user.profileImage = base64Image;
      await user.save(); 
  
      res.json({ msg: 'Image uploaded successfully', profileImage: user.profileImage });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  };


export const changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    try {
        const user = await User.findById(req.user.id);

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Current password is incorrect' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        await user.save();

        res.json({ msg: 'Password updated successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
}


export const testRegister = async (req, res) => {
    const users = req.body.users;

    if (!Array.isArray(users)) {
        return res.status(400).json({ msg: 'Invalid input format. Expected an array of users.' });
    }

    try {
        const registeredUsers = [];

        for (const userData of users) {
        const { firstname, lastname, email, password, role, genus } = userData;

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: `User with email ${email} already exists.` });
        }

        user = new User({ firstname, lastname, email, password, role, genus });
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();

        registeredUsers.push(user);
        }

        res.json({ msg: 'Users registered successfully', users: registeredUsers });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};




// Get all users designated as 'trainee'
export const getAllTrainees = async (req, res) => {
    try {
        const { user } = req;

        // Check if the user has admin access
        if (user.role !== 'admin') {
            return res.status(403).json({ msg: 'Access denied' });
        }

        // Find all users where the role is 'trainee' and exclude the password field
        const trainees = await User.find({ role: 'trainee' }).select('-password');

        res.json(trainees);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};