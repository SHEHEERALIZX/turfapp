
const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({


    name: {
        type: String,
        default:null

        },

    phoneNumber:{
        type:Number,
        unique:true
    },

    password: {
        type: String,
        required: true

    }
})

module.exports = mongoose.model('user',userSchema)