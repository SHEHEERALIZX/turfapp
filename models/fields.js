const mongoose = require('mongoose')
const Schema = mongoose.Schema

const fieldSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    fieldPicture: {
        type: String,
        required: true
    },
    // description: {
    //     type: String,
    //     required: true
    // },
    // date: { 
    //     type: Date,
    //     default: Date.now
    // }
})

module.exports = mongoose.model('Field', fieldSchema)

