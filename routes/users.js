const express = require('express')
const router = express.Router()
const User = require('../models/user')
const passport = require('passport')
const { storeReturnTo, debug } = require('../middleware')


// Register form
router.get('/register', (req, res) => {
    res.render('users/register')
})

//Create User

// USING PASSPORT
router.post('/register', async (req, res) => {
    try {
        const { email, username, password } = req.body
        const newUser = new User({
            username: username,
            email: email,
        })
        const user = await User.register(newUser, password)  //auto hash, salt, save user

        // passport - log in user after registration 
        req.login(user, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome')
            return res.redirect('/campgrounds')
        })
    }
    catch (e) {                        // user already exists
        req.flash('error', e.message)
        return res.redirect('/register')
    }
})

// USING BCRYPT
// router.post('/register', async (req, res) => {
//     const { username, password } = req.body.user
//     console.log(password)
//     const hash = await bcrypt.hash(password, 12)
//     const user = new User({
//         username: username,
//         password: hash
//     })
//     await user.save()
//     req.session.user_id = user.id
//     res.redirect('/')
// })

//Login

// Login Form
router.get('/login', (req, res) => {
    res.render('users/login')
})

// Using Passport

//Authenticate Local
router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login', keepSessionInfo: true }), async (req, res) => {
    
    // console.log(`Request Session Return To: ${req.session.returnTo}`)

    req.flash('success', 'Logged in!');
    const redirectUrl = req.session.returnTo || '/campgrounds';
    
    // console.log(`Request Session Return To: ${req.session.returnTo}`)
    delete req.session.returnTo;
    
    // console.log(`Redirect URL: ${redirectUrl}`)
    res.redirect(redirectUrl);
})

// module.exports.login = (req, res) => {
//     req.flash('success', 'welcome back!');
//     const redirectUrl = req.session.returnTo || '/campgrounds';
//     delete req.session.returnTo;
//     res.redirect(redirectUrl);
// }

// router.post('/login', async (req, res) => {
//     const { username, password } = req.body.user
//     const user = await User.findOne({ username })
//     if (!user) {
//         req.flash('error', 'invalid username or password')
//     }
//     else {
//         const validPass = await bcrypt.compare(password, user.password)
//         if (validPass) {
//             req.session.user_id = user.id
//             res.redirect('/')
//         } else {
//             req.flash('error', 'invalid username or password')
//             res.redirect('/login')
//         }
//     }
// })

//LOGOUT

router.get('/logout', (req, res) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Logged out');
        res.redirect('/campgrounds');
    })
})

module.exports = router;
