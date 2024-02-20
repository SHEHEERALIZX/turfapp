const mongoose = require('mongoose')
const Schema = mongoose.Schema


const bookingSchema = new Schema({
    fieldId: {
        type: String,
        required: true
    },
    fieldName: {
        type: String,
        required: true
    },
    
    userId: {
        type: String,
        required: false
    },
    date: {
        type: String,
        required: true
    },
    start: {
        type: String,
        required: true
    },
    end: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    isCancelled:
    {
        type:Boolean,
        default:false
    }
    // description: {
    //     type: String,
    //     required: true
    // },
    // date: {
    //     type: Date,
    //     default: Date.now
    // }
})

module.exports = mongoose.model('Booking', bookingSchema)