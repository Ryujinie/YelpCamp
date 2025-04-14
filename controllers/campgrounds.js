const Campground = require('../models/campground.js')
const { cloudinary } = require('../cloudinary')
const maptilerClient = require("@maptiler/client");
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({})
    console.log(`In Index Route: ${res.locals.currentUser}`)
    res.render('campgrounds/index', { campgrounds, currentUser: res.locals.currentUser })
}

module.exports.newCampgroundForm = (req, res) => {
    console.log(`In Render New Form: ${res.locals.currentUser}`)
    res.render('campgrounds/new', { currentUser: res.locals.currentUser })
}

module.exports.createCampground = async (req, res) => {
    const geoData = await maptilerClient.geocoding.forward(req.body.campground.location, { limit: 1 });
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.features[0].geometry;
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }))
    campground.author = req.user._id
    await campground.save()
    req.flash('success', 'Successfully created new campground!') //pop up message
    res.redirect(`/campgrounds/${campground.id}/show`)
}

module.exports.showCampground = async (req, res) => {
    const { id } = req.params
    const campgrounds = await Campground.findById(id).populate({
            path: 'reviews', 
            populate : {
                path : 'author'
            }
        }).populate('author')
    if (!campgrounds) {
        req.flash('error', 'Campground not found.')
       return res.redirect('/campgrounds')
    }
    console.log(`In Show Route: ${res.locals.currentUser}`)
    res.render('campgrounds/details', { campgrounds, currentUser: res.locals.currentUser })
}

module.exports.editCampgroundForm = async (req, res) => {
    const { id } = req.params
    const campgrounds = await Campground.findById(id)
    console.log(`In Render Edit Form: ${res.locals.currentUser}`)
    res.render('campgrounds/edit', { campgrounds, currentUser: res.locals.currentUser })
}

module.exports.editCampground = async (req, res) => {
    const { id } = req.params
    const campgrounds = await Campground.findById(id)
    // if (!campgrounds) {
    //     req.flash('error', 'Campground not found.')
    //     return res.redirect('/campgrounds')
    //      }
    await Campground.findByIdAndUpdate(id, req.body.campground, { runvalidators: true, new: true })
    const geoData = await maptilerClient.geocoding.forward(req.body.campground.location, { limit: 1 });
    campgrounds.geometry = geoData.features[0].geometry;
    const imgs =  req.files.map(f => ({ url: f.path, filename: f.filename }))
    campgrounds.images.push(...imgs)
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages){
            cloudinary.uploader.destroy(filename)
        }
       await campgrounds.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } } )
    }
    await campgrounds.save()
    req.flash('success', 'Successfully updated campground!')
    res.redirect(`/campgrounds/${id}/show`)
}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params
    const campgrounds = await Campground.findByIdAndDelete(id)
    if (!campgrounds) {
        req.flash('error', 'Campground not found.')
        return res.redirect('/campgrounds')
    }
    req.flash('success', 'Successfully deleted campground')
    res.redirect('/campgrounds')
}