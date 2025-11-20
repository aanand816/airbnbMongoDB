const express = require('express');
const exphbs = require('express-handlebars');
require('dotenv').config();
const connectDB = require('./config/database');
const airbnbRoutes = require('./routes/airbnb');
app.use(express.static('public'));
const app = express();
const path = require('path');
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', exphbs.engine({
    extname: '.hbs',
    helpers: {
        inc: v => v + 1,
        dec: v => v - 1,
        gt: (a, b) => a > b,
        lt: (a, b) => a < b,
        eq: (a, b) => a === b,
        showName: name => name && name.trim() !== '' ? name : 'NA',
        showPrice: value => (value !== null && value !== undefined && value !== '') ? value : 'N/A'
    }
}));
app.set('view engine', 'hbs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

connectDB();

app.use('/', airbnbRoutes);

app.listen(process.env.PORT, () => {
    console.log(`Express app listening at http://localhost:${process.env.PORT}`);
});
