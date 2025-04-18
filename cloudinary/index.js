const cloudinary = require('cloudinary').v2
const { CloudinaryStorage } = require('multer-storage-cloudinary')

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

//instance of cloudinary

const storage = new CloudinaryStorage({
    cloudinary,  //specified above
    params : {
    folder: 'YelpCamp',
    allowedFormats: ['jpeg', 'jpg', 'png']
    }
})

module.exports = {
    cloudinary,
    storage
}