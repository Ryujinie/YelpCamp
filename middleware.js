
const { campgroundSchema, reviewSchema } = require('./schemas.js');
const ExpressError = require('./utils/expressError');
const Campground = require('./models/campground');
const Review = require('./models/reviews');


//Should protect both form submission and post routes
module.exports.isLoggedIn = (req, res, next) => {
    // console.log("IS LOGGEDIN MIDDLEWARE")
    // console.log('isLoggedIn middleware executed'); 
    if (!req.isAuthenticated()) {
        // console.log('isAutnenticated checked'); 
        
        req.session.returnTo = req.originalUrl
        // console.log(`Original Url: ${req.originalUrl}`)

        req.flash('error', 'Please sign in first!');
        return res.redirect('/login');
    }
    next();
}

module.exports.validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);   //destructure error component
    if (error) {
        const msg = error.details.map(el => el.message).join(',')   ////error.details is an array so map its message and join into string
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

module.exports.validateReview = validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);   //destructure error component
    // console.log(`Request Body: ${req.body}`);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')   ////error.details is an array so map its message and join into string
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}


module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id)
    if (!campground.author.equals(req.user._id)){
        req.flash('error', 'You do not have permission for this request')
        return res.redirect(`/campgrounds/${id}/show`)
    }
    next();
}

module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId)
    if (!review.author.equals(req.user._id)){
        req.flash('error', 'You do not have permission for this request')
        return res.redirect(`/campgrounds/${id}/show`)
    }
    next();
}

// req.session clears return path after authenticate, store it on res.locals (accessible on ay template / midleware)
module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}