const Airbnb = require('../models/Airbnb');

// List all listings, with optional filtering and pagination
exports.listAll = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const pageSize = 100;

    const searchId = (req.query.searchId || '').trim();
    const searchName = (req.query.searchName || '').trim().toLowerCase();
    const minPrice = parseFloat(req.query.minPrice);
    const maxPrice = parseFloat(req.query.maxPrice);

    let query = {};
    if (searchId) query.id = searchId;
    if (searchName) query.name = { $regex: searchName, $options: 'i' };

    if (!isNaN(minPrice) || !isNaN(maxPrice)) {
        query.price = {};
        if (!isNaN(minPrice)) query.price.$gte = minPrice;
        if (!isNaN(maxPrice)) query.price.$lte = maxPrice;
    }

    try {
        const totalDocs = await Airbnb.countDocuments(query);
        const totalPages = Math.max(1, Math.ceil(totalDocs / pageSize));
        const results = await Airbnb.find(query)
            .skip((page - 1) * pageSize)
            .limit(pageSize);

        const pageListings = results.map(item => ({
            id: item.id || '',
            name: item.name || '',
            hostname: item.hostName || '',
            country: item.country || '',
            price: item.price || null,
            image: item.thumbnail || ''
        }));

        res.render('viewData', {
            title: `All Airbnb Listings (Page ${page} of ${totalPages})`,
            listings: pageListings,
            page,
            totalPages,
            prevPage: page > 1 ? page - 1 : null,
            nextPage: page < totalPages ? page + 1 : null,
            query: req.query
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error retrieving data");
    }
};

// Clean listings with valid NAME only
exports.listClean = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const pageSize = 100;
    const searchId = (req.query.searchId || '').trim();
    const searchName = (req.query.searchName || '').trim().toLowerCase();
    const minPrice = parseFloat(req.query.minPrice);
    const maxPrice = parseFloat(req.query.maxPrice);

    let query = { name: { $nin: [null, '', ' '] } };
    if (searchId) query.id = searchId;
    if (searchName) query.name = { $regex: searchName, $options: 'i' };

    if (!isNaN(minPrice) || !isNaN(maxPrice)) {
        query.price = {};
        if (!isNaN(minPrice)) query.price.$gte = minPrice;
        if (!isNaN(maxPrice)) query.price.$lte = maxPrice;
    }

    try {
        const totalDocs = await Airbnb.countDocuments(query);
        const totalPages = Math.max(1, Math.ceil(totalDocs / pageSize));
        const results = await Airbnb.find(query)
            .skip((page - 1) * pageSize)
            .limit(pageSize);

        const pagedListings = results.map(item => ({
            id: item.id || '',
            name: item.name || '',
            hostname: item.hostName || '',
            country: item.country || '',
            price: item.price || null,
            image: item.thumbnail || ''
        }));

        res.render('viewDataclean', {
            title: `Cleaned Airbnb Listings (Page ${page} of ${totalPages})`,
            listings: pagedListings,
            page,
            totalPages,
            prevPage: page > 1 ? page - 1 : null,
            nextPage: page < totalPages ? page + 1 : null,
            query: req.query
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error retrieving data");
    }
};

// Search property by ID
exports.searchIdGet = async (req, res) => {
    let id = req.query.id ? req.query.id.trim() : '';
    let found = id ? await Airbnb.findOne({ id }).lean() : null;
    let details = found ? Object.entries(found) : [];
    res.render('searchid', {
        title: "Search by Property ID",
        result: found,
        details,
        errors: []
    });
};
exports.searchIdPost = async (req, res) => {
    const id = req.body.PropertyID ? req.body.PropertyID.trim() : '';
    let found = id ? await Airbnb.findOne({ id }).lean() : null;
    let details = found ? Object.entries(found) : [];
    res.render('searchid', {
        title: "Search by Property ID",
        result: found,
        details,
        errors: []
    });
};

// Search by name/pagination
exports.searchNameGet = async (req, res) => {
    const searchQuery = req.query.name ? req.query.name.trim().toLowerCase() : "";
    const page = parseInt(req.query.page) || 1;
    const pageSize = 10;
    let results = [];
    if (searchQuery) {
        results = await Airbnb.find({ name: { $regex: searchQuery, $options: 'i' } })
            .lean()
            .skip((page - 1) * pageSize).limit(pageSize);
    }
    const total = searchQuery ? await Airbnb.countDocuments({ name: { $regex: searchQuery, $options: 'i' } }) : 0;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    res.render('searchname', {
        title: 'Search Airbnb Property',
        results,
        query: req.query.name || "",
        page,
        totalPages
    });
};
exports.searchNamePost = (req, res) => {
    const name = req.body.name || '';
    res.redirect(`/searchname?name=${encodeURIComponent(name)}&page=1`);
};

// Get property detail by id param
exports.propertyDetail = async (req, res) => {
    const propertyId = req.params.id;
    const found = await Airbnb.findOne({ id: propertyId }).lean();
    let details = found ? Object.entries(found) : [];
    res.render('propertydetail', {
        title: "Property Details",
        result: found,
        details
    });
};

// View by price range
exports.viewPriceGet = async (req, res) => {
    const min = req.query.min ? parseInt(req.query.min) : '';
    const max = req.query.max ? parseInt(req.query.max) : '';
    const page = parseInt(req.query.page) || 1;
    const pageSize = 20;
    let errors = [];
    let results = [];
    let totalPages = 1;

    if (min !== '' && max !== '' && min <= max) {
        try {
            const query = {
                price: { $gte: min, $lte: max }
            };

            const totalDocs = await Airbnb.countDocuments(query);
            totalPages = Math.max(1, Math.ceil(totalDocs / pageSize));

            const docs = await Airbnb.find(query)
                .skip((page - 1) * pageSize)
                .limit(pageSize);

            results = docs.map(item => ({
                id: item.id,
                name: item.name || '',
                hostname: item.hostName || '',
                country: item.country || '',
                price: item.price || null,
                image: item.thumbnail || ''
            }));

        } catch (err) {
            console.error(err);
            errors.push({ msg: 'Error retrieving data from database.' });
        }
    } else if (min !== '' && max !== '' && min > max) {
        errors.push({ msg: 'Minimum price must be less than or equal to maximum price.' });
    }

    res.render('viewDataprice', {
        title: 'Search by Price Range',
        results,
        errors,
        min: min === '' ? '' : min,
        max: max === '' ? '' : max,
        page,
        totalPages
    });
};

exports.viewPricePost = (req, res) => {
    const { body, validationResult } = require('express-validator');
    const errors = validationResult(req);
    let min = req.body.min ? parseInt(req.body.min) : '';
    let max = req.body.max ? parseInt(req.body.max) : '';

    if (!errors.isEmpty()) {
        return res.render('viewDataprice', {
            title: 'Search by Price Range',
            results: null,
            errors: errors.array(),
            min: req.body.min,
            max: req.body.max,
            page: 1,
            totalPages: 1
        });
    }
    res.redirect(`/viewDataprice?min=${min}&max=${max}&page=1`);
};

// Add new property - GET
exports.addPropertyGet = (req, res) => {
    res.render('propertyForm', {
        title: 'Add New Property',
        property: null,
        errors: []
    });
};

// Add new property - POST
exports.addPropertyPost = async (req, res) => {
    const { id, name, hostId, hostName, country, price, availability365, propertyType } = req.body;

    try {
        const newProperty = new Airbnb({
            id,
            name,
            hostId,
            hostName,
            country,
            price: parseFloat(price),
            availability365: parseInt(availability365),
            propertyType
        });

        await newProperty.save();
        res.redirect('/viewData');
    } catch (err) {
        console.error(err);
        res.render('propertyForm', {
            title: 'Add New Property',
            property: req.body,
            errors: [{ msg: 'Error adding property. Please try again.' }]
        });
    }
};

// Update property - GET
exports.updatePropertyGet = async (req, res) => {
    const propertyId = req.params.id;
    try {
        const property = await Airbnb.findOne({ id: propertyId }).lean();
        if (!property) {
            return res.status(404).send('Property not found');
        }
        res.render('propertyForm', {
            title: 'Update Property',
            property,
            errors: []
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error retrieving property');
    }
};

// Update property - POST
exports.updatePropertyPost = async (req, res) => {
    const propertyId = req.params.id;
    const { name, hostId, hostName, country, price, availability365, propertyType } = req.body;

    try {
        await Airbnb.updateOne(
            { id: propertyId },
            {
                $set: {
                    name,
                    hostId,
                    hostName,
                    country,
                    price: parseFloat(price),
                    availability365: parseInt(availability365),
                    propertyType
                }
            }
        );
        res.redirect('/viewData');
    } catch (err) {
        console.error(err);
        res.render('propertyForm', {
            title: 'Update Property',
            property: req.body,
            errors: [{ msg: 'Error updating property. Please try again.' }]
        });
    }
};

// Delete property
exports.deleteProperty = async (req, res) => {
    const propertyId = req.params.id;
    try {
        await Airbnb.deleteOne({ id: propertyId });
        res.redirect('/viewData');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error deleting property');
    }
};

