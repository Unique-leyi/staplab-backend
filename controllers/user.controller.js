const User = require('../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');



// Create a new user
exports.createUser = async (req, res) => {
  try {
    const { fullname, email, password } = req.body;

    // Validate required fields
    if (!fullname || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullname,
      email,
      password: hashedPassword
    });

    // Remove password from response
    const userResponse = { id: user.id, fullname: user.fullname, email: user.email };
    res.status(201).json(userResponse);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] } 
    });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Auth User
exports.getAuthUser = async (req, res) => {
  try {

    const userId = req.user.id;
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] } 
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json({
      user,
      message: "User retrieved successfully"
    });
    } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Get a single user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] } 
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(user);
    } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a user
exports.updateUser = async (req, res) => {
  try {
    const { fullname, email, password } = req.body;
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Hash new password if provided
    const updatedPassword = password ? await bcrypt.hash(password, 10) : user.password;

    await user.update({
      fullname: fullname || user.fullname,
      email: email || user.email,
      password: updatedPassword
    });

    // Remove password from response
    const userResponse = { id: user.id, fullname: user.fullname, email: user.email };
    res.status(200).json(userResponse);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    await user.destroy();
    res.status(200).json({ message: "User deleted successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



// Login function with JWT
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.SECRET_KEY, 
      { expiresIn: '7d' } 
    );

    res.status(200).json({ 
      message: 'Login successful', 
      access_token: token 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Reset password function
exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    // Validate required fields
    if (!email || !newPassword) {
      return res.status(400).json({ error: 'Email and new password are required' });
    }

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user's password
    await user.update({ password: hashedPassword });

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};