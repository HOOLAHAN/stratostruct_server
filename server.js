require('dotenv').config()

const express = require('express')
const mongoose = require('mongoose')
const supplierRoutes = require('./routes/suppliers')
const productRoutes = require('./routes/products')
const userRoutes = require('./routes/user')
const mapboxRoutes = require('./routes/mapbox')
const autodeskRoutes = require('./routes/autodesk')
const cors = require('cors')
const fs = require('fs')
const https = require('https')

// Load SSL certificate and key
const privateKey = fs.readFileSync('/home/ec2-user/stratostruct_server/certs/server.key', 'utf8');
const certificate = fs.readFileSync('/home/ec2-user/stratostruct_server/certs/server.cert', 'utf8');

const credentials = { key: privateKey, cert: certificate };

// express app
const app = express();

// middleware
app.use(express.json());
app.use(cors({
  origin: 'https://www.stratostruct.com',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
}));

app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});

// Enable CORS
app.use(cors())

// routes
app.use('/api/suppliers', supplierRoutes)
app.use('/api/products', productRoutes)
app.use('/api/user', userRoutes)
app.use('/api/mapbox', mapboxRoutes)
app.use('/api/autodesk', autodeskRoutes)

// use environment variable as port or fallback on 4000
const port = process.env.PORT || 4000

// connect to DB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    // listen for requests on HTTPS
    https.createServer(credentials, app).listen(port, () => {
      console.log('connected to DB & listening on port', port)
    })
  })
  .catch((error) => {
    console.log(error)
  })
