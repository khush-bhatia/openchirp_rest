var express = require('express');
var router = express.Router();

// REST API Routes
router.use('/user', require('./user_router'));
router.use('/group', require('./group_router'));
router.use('/location', require('./location_router'));
router.use('/gateway', require('./gateway_router'));
router.use('/device', require('./device_router'));
router.use('/devicetemplate', require('./device_template_router'));
router.use('/service', require('./service_router'));
router.use('/admin', require('./admin_router'));

module.exports = router;
