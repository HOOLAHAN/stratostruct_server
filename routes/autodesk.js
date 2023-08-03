const express = require('express')
const { createBucket, getBucketDetails, getForgeAccessToken, uploadIFCFile, translateFile, checkTranslationStatus, getBucketObjects, getUrn } = require('../controllers/autodeskController');
const requireAuth = require('../middleware/requireAuth')
const router = express.Router()
const multer = require('multer');

// Multer instance for file handling
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: function (req, file, cb) {
    if (!file.originalname.match(/\.(ifc)$/)) {
      return cb(new Error('Only IFC files are allowed!'));
    }
    cb(null, true);
  },
  onError : function(err, next) {
    console.log('error', err);
    next(err);
  }
});

// require auth for all product routes
router.use(requireAuth)

// create bucket route
router.post('/create-bucket', createBucket);

// get bucket details route
router.get('/bucket/:bucketKey', getBucketDetails);

// get Forge Access Token
router.get('/forge-access-token', getForgeAccessToken);

// POST upload an IFC model
router.post('/uploadIFC/:bucketKey', upload.single('file'), uploadIFCFile)

// Translate file
router.post('/translate-file', translateFile)

// Check translation status
router.get('/check-translation-status/:urn', checkTranslationStatus);

// Get the objects in a bucket
router.get('/bucket/:bucketKey/objects', getBucketObjects);

// Get the URN
router.get('/getURN/:bucketKey', getUrn);

module.exports = router;