const mongoose = require('mongoose');

const AirbnbSchema = new mongoose.Schema({
    id: String,
    name: String,
    hostId: String,
    hostIdentityVerified: Boolean,
    hostName: String,
    neighbourhoodGroup: String,
    neighbourhood: String,
    coordinates: {
        lat: Number,
        long: Number
    },
    country: String,
    countryCode: String,
    instantBookable: Boolean,
    cancellationPolicy: String,
    roomType: String,
    constructionYear: Number,
    price: Number,
    serviceFee: Number,
    minimumNights: Number,
    numberOfReviews: Number,
    lastReview: String,
    reviewsPerMonth: Number,
    reviewRateNumber: Number,
    hostListingsCount: Number,
    availability365: Number,
    houseRules: String,
    license: String,
    propertyType: String,
    thumbnail: String,
    images: [String]
}, { collection: process.env.COLLECTION });

module.exports = mongoose.model('Airbnb', AirbnbSchema);
