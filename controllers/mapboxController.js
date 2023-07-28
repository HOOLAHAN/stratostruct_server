require('dotenv').config()
const axios = require('axios');

// get driving distance between two postcodes
const getDistance = async (req, res) => {
  try {
    const { postcode1, postcode2 } = req.query;

    // get the latitude and longitude coordinates for each postcode
    const geocodingUrl1 = `https://api.mapbox.com/geocoding/v5/mapbox.places/${postcode1}.json?access_token=${process.env.MAPBOX_API_KEY}`;
    const geocodingUrl2 = `https://api.mapbox.com/geocoding/v5/mapbox.places/${postcode2}.json?access_token=${process.env.MAPBOX_API_KEY}`;

    const [data1, data2] = await Promise.all([
      axios.get(geocodingUrl1).then(response => response.data),
      axios.get(geocodingUrl2).then(response => response.data)
    ]);

    const coordinates1 = data1.features[0].center;
    const coordinates2 = data2.features[0].center;

    // calculate the driving distance between the two points
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates1[0]},${coordinates1[1]};${coordinates2[0]},${coordinates2[1]}?access_token=${process.env.MAPBOX_API_KEY}`;

    const drivingDistanceData = await axios.get(url);
    const distanceInMeters = drivingDistanceData.data.routes[0].distance;
    const distanceInKilometers = Math.round(distanceInMeters / 1000);

    res.json({ distance: distanceInKilometers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

module.exports = {
  getDistance
}