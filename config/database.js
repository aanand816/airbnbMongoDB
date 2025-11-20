require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = async () => {
    await mongoose.connect(process.env.MONGOURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        dbName: 'Aanand'
    });
    console.log('MongoDB Atlas connected to Aanand Database');
};

module.exports = connectDB;
