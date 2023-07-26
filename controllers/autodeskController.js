const axios = require('axios');
const base64 = require('base-64');
const forgeSDK = require('forge-apis');
const multer = require('multer');
require('dotenv').config()

// Multer configuration for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Function to get an access token from Forge
const getForgeAccessToken = async () => {
  try {
    const CLIENT_ID = process.env.AUTODESK_CLIENT_ID;
    const CLIENT_SECRET = process.env.AUTODESK_CLIENT_SECRET;
    const BASE64_ENCODED_STRING = base64.encode(`${CLIENT_ID}:${CLIENT_SECRET}`);

    const tokenUrl = 'https://developer.api.autodesk.com/authentication/v2/token';
    const scope = 'bucket:create bucket:read data:read data:write';

    const requestBody = new URLSearchParams();
    requestBody.append('grant_type', 'client_credentials');
    requestBody.append('scope', scope);

    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
      'Authorization': `Basic ${BASE64_ENCODED_STRING}`,
    };

    const response = await axios.post(tokenUrl, requestBody, { headers });

    const access_token = response.data.access_token;

    return access_token;

  } catch (error) {
    console.error('Authentication error:', error.message);
    throw error;
  }
};

// Function to create a new bucket
const createBucket = async (req, res) => {
  try {
    const bucketKey = req.body.bucketKey; // Get bucketKey from the request body
    const policyKey = req.body.policyKey; // Get policyKey from the request body

    // Initialize the buckets API
    const bucketsApi = new forgeSDK.BucketsApi();

    // Prepare the payload for creating a new bucket
    const postBucketsBody = new forgeSDK.PostBucketsPayload();
    postBucketsBody.bucketKey = bucketKey;
    postBucketsBody.policyKey = policyKey;

    // Set the credentials for the Forge SDK
    const forgeOAuth = new forgeSDK.AuthClientTwoLegged(process.env.AUTODESK_CLIENT_ID, process.env.AUTODESK_CLIENT_SECRET, ['bucket:create', 'data:read', 'data:write'], false);
    const forgeCredentials = await forgeOAuth.authenticate();

    // Create a new bucket
    const response = await bucketsApi.createBucket(postBucketsBody, {}, forgeOAuth, forgeCredentials);

    res.status(200).json({ bucketKey: response.body.bucketKey });
  } catch (error) {
    console.error('Error creating bucket:', error);
    res.status(500).json({ error: 'Failed to create bucket' });
  }
};

// Function to get details of bucket
const getBucketDetails = async (req, res) => {
  try {
    const bucketKey = req.params.bucketKey; // Use the bucket key from the request parameters

    // Get the access token
    const forgeOAuth = new forgeSDK.AuthClientTwoLegged(process.env.AUTODESK_CLIENT_ID, process.env.AUTODESK_CLIENT_SECRET, ['bucket:create', 'bucket:read', 'data:read', 'data:write'], false);
    const forgeCredentials = await forgeOAuth.authenticate();
    const accessToken = forgeCredentials.access_token;

    // Create the URL for the GET request
    const url = `https://developer.api.autodesk.com/oss/v2/buckets/${bucketKey}/details`;

    // Define the headers for the GET request
    const headers = {
      Authorization: `Bearer ${accessToken}`,
    };

    // Make the GET request to get the details of the bucket
    const response = await axios.get(url, { headers });

    // Check if the response indicates success
    if (response.status === 200) {
      res.json(response.data);
    } else {
      throw new Error('Error getting bucket details');
    }

  } catch (error) {
    console.error(error.response.data);
    res.status(500).json({ error: 'Failed to get bucket details.' });
  }
};


const uploadIFCFile = async (req, res) => {
  try {
    const IFCFile = req.file; // This should come from the request's file data
    const accessToken = await getForgeAccessToken(); // Acquiring access token

    const url = `https://developer.api.autodesk.com/oss/v2/buckets/${process.env.FORGE_BUCKET_KEY}/objects/${IFCFile.originalname}`;

    const headers = {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/octet-stream',
    };

    const response = await axios.put(url, IFCFile.buffer, { headers });

    res.status(200).json({ objectId: response.data.objectId }); // Sending response back to client
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload IFC file.' });
  }
};

module.exports = { createBucket, getBucketDetails, getForgeAccessToken, uploadIFCFile };
