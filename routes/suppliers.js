const express = require('express')
const Supplier = require('../models/supplierModel')

const router = express.Router()

// GET all suppliers
router.get('/', (req, res) => {
  res.json({msg: 'GET all suppliers'})
})

// GET a single supplier
router.get('/:id', (req, res) => {
  res.json({msg: 'GET a single supplier'})
})

// POST a new supplier
router.post('/', async (req, res) => {
  const { name, postcode, products } = req.body

  try {
    const supplier = await Supplier.create({ name, postcode, products})
    res.status(200).json(supplier)
  } catch (error) {
    res.status(400).json({error: error.message})
  }
})

// DELETE a supplier
router.delete('/:id', (req, res) => {
  res.json({msg: 'DELETE a supplier'})
})

// UPDATE a supplier
router.patch('/:id', (req, res) => {
  res.json({msg: 'UPDATE a supplier'})
})


module.exports = router;