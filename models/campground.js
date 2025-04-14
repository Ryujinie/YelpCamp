//models

// imports must come before mongoose.Schema
const mongoose = require('mongoose');
const Review = require('./reviews')
const Schema = mongoose.Schema;
const opts = {toJSON: { virtuals: true }} //includes virtuals in object

const ImageSchema = new Schema({
    url: String,
    filename : String,
})

// Virtual - not stored on database
ImageSchema.virtual('thumbnail').get(function() {
    return this.url.replace('/upload', '/upload/w_200')
})

const CampgroundSchema = new Schema({
    title: String,
    price: Number,
    description: String,
    location: String,
    images: [ ImageSchema ],
    author: {
        type: Schema.Types.ObjectId,
            ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ],
    geometry : {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    }
}, opts)

CampgroundSchema.virtual('properties.popUpMarkup').get(function() {
    return `<strong><a href="/campgrounds/${this._id}/show">${this.title}</a><strong>`
    // <p>${this.description.substring(0,20)}...</p>
})

//POST MIDDLEWARE

CampgroundSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})




module.exports = mongoose.model('Campground', CampgroundSchema)