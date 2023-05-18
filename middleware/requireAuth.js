const jwt = require('jsonwebtoken')
const User = require('../models/userModel')

const requireAuth = async (req, res, next) => {

  // verify authentication
  const { authorization } = req.headers

  if (!authorization) {
    return res.status(401).json({error: 'Authorization token required'})
  }

  const token = authorization.split(' ')[1]

  try {
    const {_id} = jwt.verify(token, process.env.SECRET)

    req.user = await User.findOne({ _id }).select('_id')
    console.log('Authenticated User:', req.user);

    next()

  } catch (error) {
    console.log('Authentication Error:', error);
    res.status(401).json({error: 'Request is not authorized'})
  }
  
}

const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.user._id }).select('role');
    
    console.log('User Role:', user.role);

    if (user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ message: 'Access denied. You are not authorized.' });
    }
  } catch (error) {

    console.log('isAdmin Error:', error);

    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { requireAuth, isAdmin };