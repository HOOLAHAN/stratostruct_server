const express = require('express')
const {
  getProducts,
  getProduct,
  createProduct
} = require('../controllers/productController')

const router = express.Router()

// GET all products
router.get('/', getProducts)

// GET a single product
router.get('/:id', getProduct)

// POST a new product
router.post('/', createProduct)

// DELETE a product
router.delete('/:id', (req, res) => {
  res.json({msg: 'DELETE a product'})
})

// UPDATE a product
router.patch('/:id', (req, res) => {
  res.json({msg: 'UPDATE a product'})
})


module.exports = router;