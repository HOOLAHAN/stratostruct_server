const axios = require('axios');
const base64 = require('base-64');
const forgeSDK = require('forge-apis');
require('dotenv').config()

// Function to get an access token from Forge
const getForgeAccessToken = async (req, res) => {
  try {
    const CLIENT_ID = process.env.AUTODESK_CLIENT_ID;
    const CLIENT_SECRET = process.env.AUTODESK_CLIENT_SECRET;
    const BASE64_ENCODED_STRING = base64.encode(`${CLIENT_ID}:${CLIENT_SECRET}`);

    const tokenUrl = 'https://developer.api.autodesk.com/authentication/v2/token';
    const scope = 'bucket:create bucket:read data:read data:write viewables:read';

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
    console.log(`Forge access token: ${access_token}`)
    res.json({ data: access_token });

  } catch (error) {
    console.error('Authentication error:', error.message);
    res.status(500).json({ error: 'Failed to get access token.' });
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

// Axios instance for Forge API
const forgeAPI = axios.create({
  baseURL: 'https://developer.api.autodesk.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Function to upload IFC file
const uploadIFCFile = async (req, res) => {
  console.log(req.file)
  try {
    const IFCFile = req.file;
    const bucketKey = req.params.bucketKey;
    
    // Set the credentials for the Forge SDK
    const forgeOAuth = new forgeSDK.AuthClientTwoLegged(process.env.AUTODESK_CLIENT_ID, process.env.AUTODESK_CLIENT_SECRET, ['bucket:create', 'data:read', 'data:write'], false);
    const forgeCredentials = await forgeOAuth.authenticate();
    const accessToken = forgeCredentials.access_token;

    const url = `/oss/v2/buckets/${bucketKey}/objects/${IFCFile.originalname}`;

    const headers = {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/octet-stream',
    };

    const response = await forgeAPI.put(url, IFCFile.buffer, { headers });

    // Store root file name (original file name without extension)
    const rootFileName = IFCFile.originalname.split('.').slice(0, -1).join('.');
    req.rootFileName = rootFileName;

    res.status(200).json({ objectId: response.data.objectId, fileName: IFCFile.originalname });
  } catch (error) {
    console.error('Error in uploadIFCFile:', error);
    res.status(500).json({ error: 'Failed to upload IFC file.' });
  }
};

// Function to translate file
const translateFile = async (req, res) => {
  const urn = req.body.urn;
  const rootFileName = req.body.fileName;
  
  // Set the credentials for the Forge SDK
  const forgeOAuth = new forgeSDK.AuthClientTwoLegged(process.env.AUTODESK_CLIENT_ID, process.env.AUTODESK_CLIENT_SECRET, ['data:read', 'data:write', 'data:create', 'data:search'], false);
  const forgeCredentials = await forgeOAuth.authenticate();
  const accessToken = forgeCredentials.access_token;

  const config = {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    }
  };

  const data = {
    input: {
      urn,
    },
    output: {
      formats: [
        {
          type: 'svf',
          views: ['2d', '3d'],
        },
      ],
    },
    rootFileName: rootFileName,
  };

  try {
    const response = await axios.post('https://developer.api.autodesk.com/modelderivative/v2/designdata/job', data, config);
    res.json(response.data);
  } catch (error) {
    console.error('Error from Forge API:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'An error occurred while translating the file.' });
  }  
};

// Function to check the status of the translation job
const checkTranslationStatus = async (req, res) => {
  try {
    const urn = req.params.urn; // Get the urn from the request parameters

    // Set the credentials for the Forge SDK
    const forgeOAuth = new forgeSDK.AuthClientTwoLegged(process.env.AUTODESK_CLIENT_ID, process.env.AUTODESK_CLIENT_SECRET, ['data:read', 'data:write', 'data:create', 'data:search'], false);
    const forgeCredentials = await forgeOAuth.authenticate();

    // Create a new Derivatives API object
    const derivativesApi = new forgeSDK.DerivativesApi();

    // Get the translation job status
    const job = await derivativesApi.getManifest(urn, {}, forgeOAuth, forgeCredentials);

    // Respond with the job status
    res.json(job.body.status);
  } catch (error) {
    console.error('Error checking translation status:', error);
    res.status(500).json({ error: 'An error occurred while checking the translation status.' });
  }
};

const getBucketObjects = async (req, res) => {
  try {
    const bucketKey = req.params.bucketKey; // Use the bucket key from the request parameters

    // Get the access token
    const forgeOAuth = new forgeSDK.AuthClientTwoLegged(process.env.AUTODESK_CLIENT_ID, process.env.AUTODESK_CLIENT_SECRET, ['bucket:create', 'bucket:read', 'data:read', 'data:write'], false);
    const forgeCredentials = await forgeOAuth.authenticate();
    const accessToken = forgeCredentials.access_token;

    // Create the URL for the GET request
    const url = `https://developer.api.autodesk.com/oss/v2/buckets/${bucketKey}/objects`;

    // Define the headers for the GET request
    const headers = {
      Authorization: `Bearer ${accessToken}`,
    };

    // Make the GET request to get the objects in the bucket
    const response = await axios.get(url, { headers });

    // Check if the response indicates success
    if (response.status === 200) {
      res.json(response.data);
    } else {
      throw new Error('Error getting bucket objects');
    }

  } catch (error) {
    console.error(error.response.data);
    res.status(500).json({ error: 'Failed to get bucket objects.' });
  }
};

const getUrn = async (req, res) => {
  try {
    const bucketKey = req.params.bucketKey;

    // Get the access token
    const forgeOAuth = new forgeSDK.AuthClientTwoLegged(process.env.AUTODESK_CLIENT_ID, process.env.AUTODESK_CLIENT_SECRET, ['bucket:create', 'bucket:read', 'data:read', 'data:write'], false);
    const forgeCredentials = await forgeOAuth.authenticate();
    const accessToken = forgeCredentials.access_token;

    // Create the URL for the GET request
    const url = `https://developer.api.autodesk.com/oss/v2/buckets/${bucketKey}/objects`;

    // Define the headers for the GET request
    const headers = {
      Authorization: `Bearer ${accessToken}`,
    };

    // Make the GET request to get the objects in the bucket
    const response = await axios.get(url, { headers });

    // Check if the response indicates success
    if (response.status === 200) {
      const urns = response.data.items.map(item => item.objectId); // This will be an array of URNs
      res.json(urns);
    } else {
      throw new Error('Error getting URN');
    }

  } catch (error) {
    console.error(error.response.data);
    res.status(500).json({ error: 'Failed to get URN.' });
  }
};


module.exports = { createBucket, getBucketDetails, getForgeAccessToken, uploadIFCFile, translateFile, checkTranslationStatus, getBucketObjects, getUrn };
