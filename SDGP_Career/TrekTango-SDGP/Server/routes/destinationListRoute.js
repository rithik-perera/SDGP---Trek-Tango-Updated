const express = require('express');
const router = express.Router();
const {destinationOrderCurrLoc, destinationOrderListPlace} = require('../controllers/destinationListController');

router.route('/orderCurrLoc').post(destinationOrderCurrLoc);
router.route('/orderListPlace').post(destinationOrderListPlace);

module.exports = router;