const express = require('express');
const router = express.Router();

// Require the controller
const product_controller = require('../controllers/product.controller');

// Test URL
router.get('/', (req, res) => {
	res.send('Welcome to Home Route of Products');
});

router.get('/test', product_controller.test);

router.post('/create', product_controller.product_create);  //insert new product
router.get('/:id', product_controller.product_details); //retrieve product info by id
router.put('/:id/update', product_controller.product_update); //update product by id
router.delete('/:id', product_controller.product_delete); //delete a product by id


module.exports = router;