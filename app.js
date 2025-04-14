if (process.env.NODE_ENV !== "production"){
    require('dotenv').config();
}

// npm init -y
// npm i express mongoose ejs
const express = require('express');
const path = require('path')
const methodOverride = require('method-override')
const mongoose = require('mongoose')
const ejsMate = require('ejs-mate')
const session = require('express-session')
const MongoStore = require('connect-mongo');
const flash = require('connect-flash')
const catchAsync = require('./utils/catchAsync')
const ExpressError = require('./utils/expressError')
const Campground = require('./models/campground')
const Review = require('./models/reviews')
const User = require('./models/user')
const { campgroundSchema, reviewSchema } = require('./schemas.js')
const campgroundRoutes = require('./routes/campgrounds')
const reviewRoutes = require('./routes/reviews')
const userRoutes = require('./routes/users')
const bcrypt = require('bcrypt')
const passport = require('passport')
const localStrategy = require('passport-local')
const mongoSanitize = require('express-mongo-sanitize')
const helmet = require('helmet')
database = process.env.DB || 'mongodb://127.0.0.1:27017/yelp-camp'

// DATABASE CONNECTION
// mongoose.connect(localDB);
mongoose.connect(database)

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log('Database connected')
})

const app = express();

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, 'public')))
app.use(mongoSanitize())  // for mongo injection


//store session on MongoDB
const store = MongoStore.create({
    mongoUrl: database,
    secret : process.env.SESSION_SECRET,
    touchAfter: 24 * 3600,  //refresh session
})

store.on("error", function(e) {
    console.log("SESSION STORE ERROR", e)
})

// SESSION
const sessionConfig = {
    store,
    name: 'session',
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    // secure: true, //cookies are only accessibles in https (secure connection)
    cookie: {
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, //Eexpirees in a week
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true //(security) cookie cannot be accessed by client side scripts
    }
}

app.use(session(sessionConfig))
app.use(flash())
app.use(helmet())

// HELMET
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/", 
];
const connectSrcUrls = [
    "https://api.maptiler.com/"
];
const fontSrcUrls = [];

app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            childSrc: ["blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`, //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com",
                "https://api.maptiler.com/"
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

app.use(passport.initialize())
app.use(passport.session())   // after session middleware
passport.use(new localStrategy(User.authenticate()))  //auth method

passport.serializeUser(User.serializeUser())   //stores user in session
passport.deserializeUser(User.deserializeUser())

// FLASH MIDDLEWARE   - any file can access message obj
app.use((req, res, next) => {
    console.log(req.user)
    res.locals.currentUser = req.user;   //req.user from passport (auto added to req object when signed in)
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next();
})

//ROUTES
app.use("/", userRoutes)
app.use("/campgrounds", campgroundRoutes)
app.use("/campgrounds/:id/reviews", reviewRoutes)

app.get('/', (req, res) => {
    res.render('home')
})


/////////////// ERROR HANDLING ////////////////

// CATCH ALL ERROR
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
    // ExpressError - resusable func to customize err message and res.statis
})

// DISPLAY ERROR
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err   //must have default values
    if (!err.message) err.message = 'Something went wrong...'
    res.status(statusCode).render('error', { err })
})

app.listen(3000, () => {
    console.log('Serving on Port 3000')
})