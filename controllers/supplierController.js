const Supplier = require('../models/supplierModel')
const mongoose = require('mongoose')

// get all suppliers
const getSuppliers = async (req, res) => {
  const suppliers = await Supplier.find({}).sort({createdAt: -1})
  res.status(200).json(suppliers)
}

// get a single supplier
const getSupplier = async (req, res) => {
  const { id } = req.params

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({error: 'No such supplier'})
  }

  const supplier = await Supplier.findById(id)

  if (!supplier) {
    return res.status(404).json({error: 'No such supplier'})
  }

  res.status(200).json(supplier)
}

// create new supplier
const createSupplier = async (req, res) => {
  const { name, postcode, products } = req.body

  let emptyFields = []

  if(!name) {
    emptyFields.push('name')
  }
  if(!postcode) {
    emptyFields.push('postcode')
  }
  if(!products) {
    emptyFields.push('products')
  }
  if(emptyFields.length > 0) {
    return res.status(400).json({error: 'Please fill in all the fields', emptyFields})
  }

  // Add doc to db
  try {
    const supplier = await Supplier.create({ name, postcode, products })
    res.status(200).json(supplier)
  } catch (error) {
    res.status(400).json({error: error.message})
  }
}

// delete a supplier
const deleteSupplier = async (req, res) => {
  const { id } = req.params

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({error: 'No such supplier'})
  }

  const supplier = await Supplier.findOneAndDelete({_id: id})

  if (!supplier) {
    return res.status(404).json({error: 'No such supplier'})
  }

  res.status(200).json(supplier)

}

//update a supplier
const updateSupplier = async (req, res) => {
  const { id } = req.params

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({error: 'No such supplier'})
  }

  const supplier = await Supplier.findOneAndUpdate({_id: id}, {
    ...req.body
  })

  if (!supplier) {
    return res.status(404).json({error: 'No such supplier'})
  }

  res.status(200).json(supplier)
}

module.exports = {
  getSuppliers,
  getSupplier,
  createSupplier,
  deleteSupplier,
  updateSupplier
}