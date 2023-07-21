require('dotenv').config();
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const base64 = require('base-64');

const createToken = (_id) => {
  return jwt.sign({ _id }, process.env.SECRET, { expiresIn: '1d' });
};

// Controller function for obtaining Autodesk access token
const autodeskAuth = async () => {
  try {
    const CLIENT_ID = process.env.AUTODESK_CLIENT_ID;
    const CLIENT_SECRET = process.env.AUTODESK_CLIENT_SECRET;
    const BASE64_ENCODED_STRING = base64.encode(`${CLIENT_ID}:${CLIENT_SECRET}`);

    const tokenUrl = 'https://developer.api.autodesk.com/authentication/v2/token';
    const scope = 'data:read';

    const requestBody = new URLSearchParams();
    requestBody.append('grant_type', 'client_credentials');
    requestBody.append('scope', scope);

    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
      'Authorization': `Basic ${BASE64_ENCODED_STRING}`,
    };

    const response = await axios.post(tokenUrl, requestBody, { headers });

    // TODO store the access_token in a session or database for future API calls.
    const access_token = response.data.access_token;
    console.log(access_token)
    
    return access_token;
  } catch (error) {
    console.error('Authentication error:', error.message);
    throw new Error('Authentication failed');
  }
};

// login user
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.login(email, password);

    // create a token
    const token = createToken(user._id);

    // Get the access token for Autodesk API calls
    const access_token = await autodeskAuth();

    res.status(200).json({ email, token, full_name: user.full_name, role: user.role, access_token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// signup user
const signupUser = async (req, res) => {
  const { email, company, full_name, password } = req.body;

  try {
    const user = await User.signup(email, company, full_name, password);

    user.role = 'user';
    await user.save();

    // create a token
    const token = createToken(user._id);

    // Get the access token for Autodesk API calls
    const access_token = await autodeskAuth();

    res.status(200).json({ email, token, access_token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { signupUser, loginUser, autodeskAuth };
