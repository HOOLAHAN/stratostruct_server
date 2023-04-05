const mongoose = require('mongoose')

const Schema = mongoose.Schema

const supplierSchema = new Schema(
  {
    "name": {
      type: String,
      required: true
    },
    "postcode": {
      type: String,
      required: true
    },
    "products": [ 
        {
          "product_id": {
            type: String,
            required: true
          }
        }
     ]
  }, { timestamps: true}
)

module.exports = mongoose.model('Supplier', supplierSchema)