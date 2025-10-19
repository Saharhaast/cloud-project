const express = require('express');
const router = express.Router();
const detailController = require('../controllers/detailController');

router.get('/products/:id', detailController.getDetail);

module.exports = router;