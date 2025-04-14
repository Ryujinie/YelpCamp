const express = require('express')
const router = express.Router()
const catchAsync = require('../utils/catchAsync.js')
const { validateCampground, isLoggedIn, isAuthor } = require('../middleware')
const campground = require('../controllers/campgrounds.js')
const multer = require('multer')
const { storage } = require('../cloudinary')
const upload = multer({ storage })

router.route('/')
    .get(campground.index)
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync( campground.createCampground  ))

router.route('/:id')
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, campground.editCampground)
    .delete(isLoggedIn, isAuthor, campground.deleteCampground)

router.get('/new', isLoggedIn, campground.newCampgroundForm)

router.get('/:id/show', campground.showCampground)

router.get('/:id/edit', isLoggedIn, isAuthor, campground.editCampgroundForm)


module.exports = router;