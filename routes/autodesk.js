const express = require('express')
const { createBucket, getBucketDetails, getForgeAccessToken, uploadIFCFile } = require('../controllers/autodeskController');
// const requireAuth = require('../middleware/requireAuth')
const router = express.Router()
const multer = require('multer');

// Multer instance for file handling
const upload = multer({ storage: multer.memoryStorage() });

// require auth for all product routes
// router.use(requireAuth)

// create bucket route
router.post('/create-bucket', createBucket);

// get bucket details route
router.get('/bucket/:bucketKey', getBucketDetails);

// Autodesk auth route
// router.get('/autodesk-auth', autodeskAuth);

// get Forge Access Token
router.get('/forge-access-token', getForgeAccessToken);

// POST upload an IFC model
router.post('/uploadIFC', upload.single('file'), uploadIFCFile)

module.exports = router;

// Controller function for obtaining Autodesk access token
// const autodeskAuth = async (req, res) => {
//   try {
//     const CLIENT_ID = process.env.AUTODESK_CLIENT_ID;
//     const CLIENT_SECRET = process.env.AUTODESK_CLIENT_SECRET;
//     const BASE64_ENCODED_STRING = base64.encode(`${CLIENT_ID}:${CLIENT_SECRET}`);

//     const tokenUrl = 'https://developer.api.autodesk.com/authentication/v2/token';
//     const scope = 'bucket:create data:read data:write';

//     const requestBody = new URLSearchParams();
//     requestBody.append('grant_type', 'client_credentials');
//     requestBody.append('scope', scope);

//     const headers = {
//       'Content-Type': 'application/x-www-form-urlencoded',
//       'Accept': 'application/json',
//       'Authorization': `Basic ${BASE64_ENCODED_STRING}`,
//     };

//     const response = await axios.post(tokenUrl, requestBody, { headers });

//     // TODO store the access_token in a session or database for future API calls.
//     const access_token = response.data.access_token;
//     console.log(`Access Token: ${access_token}`);

//     // Return the token to the client
//     return res.json({ access_token });
//   } catch (error) {
//     console.error('Authentication error:', error.message);
//     res.status(500).json({ error: 'Authentication failed' });
//   }
// };