const express = require('express')
const {
  getDistance,
  getRoute
} = require('../controllers/mapboxController')

const requireAuth = require('../middleware/requireAuth')

const router = express.Router()

// require auth for all product routes
router.use(requireAuth)

// GET distance from mapbox API
router.get('/getDistance', getDistance)

// POST route from mapbox API
router.post('/getRoute', getRoute)

module.exports = router;