//models
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const reviewSchema = new Schema({
    // user: Schema.Types.ObjectId,
    rating: Number,
    body: String,
    // camp: {
    //     type: Schema.Types.ObjectId,
    //     ref: 'Campground'
    // }
    author : {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
})



module.exports = mongoose.model('Review', reviewSchema);