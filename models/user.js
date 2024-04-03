const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,

    },

    email:{
        type:String,
        required: true,
    },

    event:{
        type:String,
        required: false,
    },

    image:{
        type:String,
        required: false,
    },
    created:{
        type: Date,
        required: false,
        default: Date.now,
    },

});
module.exports = mongoose.model("user", userSchema);
