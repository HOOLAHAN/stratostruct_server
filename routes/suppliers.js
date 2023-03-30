const express = require('express')
const {
  getSuppliers,
  getSupplier,
  createSupplier
} = require('../controllers/supplierController')

const router = express.Router()

// GET all suppliers
router.get('/', getSuppliers)

// GET a single supplier
router.get('/:id', getSupplier)

// POST a new supplier
router.post('/', createSupplier)

// DELETE a supplier
router.delete('/:id', (req, res) => {
  res.json({msg: 'DELETE a supplier'})
})

// UPDATE a supplier
router.patch('/:id', (req, res) => {
  res.json({msg: 'UPDATE a supplier'})
})


module.exports = router;