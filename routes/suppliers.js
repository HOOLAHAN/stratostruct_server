const express = require('express')

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
router.post('/', (req, res) => {
  res.json({msg: 'POST a new supplier'})
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