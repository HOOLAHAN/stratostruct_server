const express = require('express')
const {
  getSuppliers,
  getSupplier,
  createSupplier,
  deleteSupplier,
  updateSupplier
} = require('../controllers/supplierController')

const requireAuth = require('../middleware/requireAuth')

const router = express.Router()

// require auth for all supplier routes
router.use(requireAuth)

// GET all suppliers
router.get('/', getSuppliers)

// GET a single supplier
router.get('/:id', getSupplier)

// POST a new supplier
router.post('/', createSupplier)

// DELETE a supplier
router.delete('/:id', deleteSupplier)

// UPDATE a supplier
router.patch('/:id', updateSupplier)


module.exports = router;