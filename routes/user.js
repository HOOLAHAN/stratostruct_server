const express = require('express')

// controller functions
const {signupUser, loginUser} = require('../controllers/userController')
const { requireAuth, isAdmin } = require('../middleware/requireAuth');

const router = express.Router()

// login route
router.post('/login', loginUser)

// signup route
router.post('/signup', signupUser)

// admin-only route
router.get('/admin', requireAuth, isAdmin, (req, res) => {
  // This route is only accessible to administrators
  res.json({ message: 'Welcome to the admin page!' });
});

module.exports = router;