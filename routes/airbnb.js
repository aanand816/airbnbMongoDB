const express = require('express');
const router = express.Router();
const controller = require('../controllers/airbnbController');
const { body } = require('express-validator');

// HOME PAGE (optional, direct to index or redirect)
router.get('/', (req, res) => res.render('index', { title: "Express" }));

// Main listing and filtered views
router.get('/viewData', controller.listAll);
router.get('/viewDataclean', controller.listClean);
router.get('/property/:id', controller.propertyDetail);

// Search by PropertyID (get/post)
router.get('/searchid', controller.searchIdGet);
router.post('/searchid', controller.searchIdPost);

// Search by Name (get/post)
router.get('/searchname', controller.searchNameGet);
router.post('/searchname', controller.searchNamePost);

// View by price range (get/post)
router.get('/viewDataprice', controller.viewPriceGet);
router.post('/viewDataprice',
    body('min').notEmpty().isNumeric().withMessage('Minimum price must be a number.'),
    body('max').notEmpty().isNumeric().withMessage('Maximum price must be a number.'),
    controller.viewPricePost
);

// CRUD Operations
router.get('/add-property', controller.addPropertyGet);
router.post('/add-property', controller.addPropertyPost);
router.get('/update-property/:id', controller.updatePropertyGet);
router.post('/update-property/:id', controller.updatePropertyPost);
router.post('/delete-property/:id', controller.deleteProperty);

// 404 catch-all (as fallback in app.js)
module.exports = router;
