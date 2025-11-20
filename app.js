const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
require('dotenv').config();

const connectDB = require('./config/database');
const airbnbRoutes = require('./routes/airbnb');
const app = express();

app.use(express.static(path.join(__dirname, 'public')));
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
app.use(express.urlencoded({ extended: true }));

connectDB();
app.use('/', airbnbRoutes);

const PORT = process.env.PORT || 3000;
// Vercel exports the app; local can run hard-coded
if (process.env.VERCEL !== '1') {
    app.listen(PORT, () => {
        console.log(`Express app listening at http://localhost:${PORT}`);
    });
}

// Export for Vercel
module.exports = app;