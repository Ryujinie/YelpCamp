const express = require('express');
const path = require('path')
const mongoose = require('mongoose')
const Campground = require('../models/campground')
const cities = require('./cities')
const { places, descriptors } = require('./seedHelpers')

// DATABASE CONNECTION
mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log('Database connected')
})


// SEED
const sample = array => array[Math.floor(Math.random() * array.length)]

const seedDB = async () => {
    await Campground.deleteMany({})

    for (let i = 0; i < 300; i++) {
        const random = Math.floor(Math.random() * 1000)
        const price = Math.floor(Math.random() * 50) + 10
        const camp = new Campground({
            // same order as model
            title: `${sample(descriptors)} ${sample(places)}`,
            price: `${price}`,
            description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
            location: `${cities[random].city}, ${cities[random].state}`,
            images: [
                {
                  url: 'https://res.cloudinary.com/dpescd7if/image/upload/v1733815508/YelpCamp/wxtsjhggmuzcbfsrci04.avif',
                  filename: 'YelpCamp/wxtsjhggmuzcbfsrci04',
                 },
                {
                  url: 'https://res.cloudinary.com/dpescd7if/image/upload/v1733815507/YelpCamp/nguczqrzrxr28sdvvjek.jpg',
                  filename: 'YelpCamp/nguczqrzrxr28sdvvjek',
                }
              ],       
            author: '6752c4b9698676f23d53b892',
            geometry : {
                type: "Point",
                coordinates: [cities[random].longitude, cities[random].latitude]
            }
        })
        await camp.save()
    }
}

seedDB().then(() => {
    mongoose.connection.close()
})








// const mongoose = require('mongoose');
// const cities = require('./cities');
// const { places, descriptors } = require('./seedHelpers');
// const Campground = require('../models/campground');

// mongoose.connect('mongodb://localhost:27017/yelp-camp', {
//     useNewUrlParser: true,
//     useCreateIndex: true,
//     useUnifiedTopology: true
// });

// const db = mongoose.connection;

// db.on("error", console.error.bind(console, "connection error:"));
// db.once("open", () => {
//     console.log("Database connected");
// });

// const sample = array => array[Math.floor(Math.random() * array.length)];


// const seedDB = async () => {
//     await Campground.deleteMany({});
//     for (let i = 0; i < 300; i++) {
//         const random1000 = Math.floor(Math.random() * 1000);
//         const price = Math.floor(Math.random() * 20) + 10;
//         const camp = new Campground({
//             //YOUR USER ID
//             author: '5f5c330c2cd79d538f2c66d9',
//             location: `${ cities[random1000].city }, ${ cities[random1000].state }`,
//             title: `${ sample(descriptors) } ${ sample(places) }`,
//             description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam dolores vero perferendis laudantium, consequuntur voluptatibus nulla architecto, sit soluta esse iure sed labore ipsam a cum nihil atque molestiae deserunt!',
//             price,
//             geometry: {
//                 type: "Point",
//                 coordinates: [
//                     cities[random1000].longitude,
//                     cities[random1000].latitude,
//                 ]
//             },
//             images: [
//                 {
//                     url: 'https://res.cloudinary.com/douqbebwk/image/upload/v1600060601/YelpCamp/ahfnenvca4tha00h2ubt.png',
//                     filename: 'YelpCamp/ahfnenvca4tha00h2ubt'
//                 },
//                 {
//                     url: 'https://res.cloudinary.com/douqbebwk/image/upload/v1600060601/YelpCamp/ruyoaxgf72nzpi4y6cdi.png',
//                     filename: 'YelpCamp/ruyoaxgf72nzpi4y6cdi'
//                 }
//             ]
//         })
//         await camp.save();
//     }
// }

// seedDB().then(() => {
//     mongoose.connection.close();
// })