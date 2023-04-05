require('dotenv').config()

const express = require('express')
const supplierRoutes = require('./routes/suppliers')
const productRoutes = require('./routes/products')
const mongoose = require('mongoose')

// express app
const app = express()

// middleware
app.use(express.json())
app.use((req, res, next) => {
  console.log(req.path, req.method)
  next()
})

//routes
app.use('/api/suppliers', supplierRoutes)
app.use('/api/products', productRoutes)

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



