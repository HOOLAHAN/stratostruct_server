const express = require('express')
const Product = require('../models/productModel')

const router = express.Router()

// GET all products
router.get('/', (req, res) => {
  res.json({msg: 'GET all products'})
})

// GET a single product
router.get('/:id', (req, res) => {
  res.json({msg: 'GET a single product'})
})

// POST a new product
router.post('/', async (req, res) => {
  const { name, category } = req.body

  try {
    const product = await Product.create({ name, category })
    res.status(200).json(product)
  } catch (error) {
    res.status(400).json({error: error.message})
  }
})

// DELETE a product
router.delete('/:id', (req, res) => {
  res.json({msg: 'DELETE a product'})
})

// UPDATE a product
router.patch('/:id', (req, res) => {
  res.json({msg: 'UPDATE a product'})
})


module.exports = router;