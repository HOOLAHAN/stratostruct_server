require('dotenv').config()

const express = require('express')
const mongoose = require('mongoose')
const supplierRoutes = require('./routes/suppliers')
const productRoutes = require('./routes/products')
const userRoutes = require('./routes/user')
const cors = require('cors')

// express app
const app = express()

// middleware
app.use(express.json())
app.use((req, res, next) => {
  console.log(req.path, req.method)
  next()
})

// Enable CORS
app.use(cors());

//routes
app.use('/api/suppliers', supplierRoutes)
app.use('/api/products', productRoutes)
app.use('/api/user', userRoutes)

// route handler for the Mapbox API endpoint
app.get('/api/distance', async (req, res) => {
  try {
    const { postcode1, postcode2 } = req.query;

    // get the latitude and longitude coordinates for each postcode
    const geocodingUrl1 = `https://api.mapbox.com/geocoding/v5/mapbox.places/${postcode1}.json?access_token=${process.env.MAPBOX_API_KEY}`;
    const geocodingUrl2 = `https://api.mapbox.com/geocoding/v5/mapbox.places/${postcode2}.json?access_token=${process.env.MAPBOX_API_KEY}`;

    const [data1, data2] = await Promise.all([
      fetch(geocodingUrl1).then(response => response.json()),
      fetch(geocodingUrl2).then(response => response.json())
    ]);

    const coordinates1 = data1.features[0].center;
    const coordinates2 = data2.features[0].center;

    // calculate the driving distance between the two points
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates1[0]},${coordinates1[1]};${coordinates2[0]},${coordinates2[1]}?access_token=${process.env.MAPBOX_API_KEY}`;

    const drivingDistance = await fetch(url)
      .then(response => response.json())
      .then(data => {
        const distanceInMeters = data.routes[0].distance;
        const distanceInKilometers = (distanceInMeters / 1000).toFixed(2);
        return distanceInKilometers;
      });

    res.json({ distance: drivingDistance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// connect to DB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    // listen for requests
    app.listen(process.env.PORT, () => {
      console.log('connected to DB & listening on port', process.env.PORT)
    })
  })
  .catch((error) => {
    console.log(error)
  })