var express = require('express');
var router = express.Router();
var ObjectId = require('mongoose').Types.ObjectId;

var deviceManager = require('../middleware/resource_managers/device_manager');
var transducerManager = require('../middleware/resource_managers/transducer_manager');
var serviceManager = require('../middleware/resource_managers/service_manager');
var commandManager = require('../middleware/resource_managers/command_manager');
var thingTokenManager = require('../middleware/resource_managers/thing_token_manager');

/* GET all devices */
router.get('/', function(req, res, next) {
    deviceManager.getAllDevices( function(err, result) {
        if(err) { return next(err); }
        return res.json(result);
    })
});

/* Create new device */
router.post('/', function(req, res, next) {
	deviceManager.createNewDevice(req, function (err, result) {
		if(err) { return next(err); }
  		return res.json(result);
	})
});

/* Validate _id in all request URLs */
router.param('_id', function(req, res, next, id) {
    if(!ObjectId.isValid(id)){
        var error = new Error();
        error.status = 404;
        error.message = "Invalid Object ID " + id ;
        return next(error);
    }
    deviceManager.getDeviceById(id, function (err, device) {
        if (err) { return next(err); }    
        req.device = device;
        thingTokenManager.getTokenByThingId(id, function(err, thingToken){
            if(err) { return next(err); }
            req.token = thingToken;                   
            next();
        })        
    })
});

/* Validate _transducerId in all request URLs */
router.param('_transducerId', function(req, res, next, transducerId) {   
    if(!ObjectId.isValid(transducerId)){
        var error = new Error();
        error.message = "Invalid Object ID " + transducerId ;
        return next(error);
    }
    next();
});

/* Validate _serviceId in all request URLs */
router.param('_serviceId', function(req, res, next, serviceId) {
    if(!ObjectId.isValid(serviceId)){
        var error = new Error();
        error.message = "Invalid Object ID " + serviceId ;
        return next(error);
    }
    serviceManager.getById(serviceId, function(err, result){
        if(err) { return next(err); }
        req.service = result;
        next();
    })
});

/* GET a device */
router.get('/:_id', function(req, res, next) {
    var result = JSON.parse(JSON.stringify(req.device));
    if(req.token){
        result.token = {};
        result.token._id = req.token._id;
    }  
 	return res.json(result);
});

/* Update a device */
router.put('/:_id', function(req, res, next) {  
  deviceManager.updateDevice(req, function(err, result){
 		if(err) { return next(err); }
 		return res.json(result);
 	})  			
});

/* Delete a device */
router.delete('/:_id', function(req, res, next) {   
	deviceManager.deleteDevice(req, function(err){
        if(err) { return next(err); }
         return res.json({ message: 'Delete successful'});  
    })   
});

/*************** Transducers ***************************/

/* Add a transducer to device */
router.post('/:_id/transducer', function(req, res, next ){
    transducerManager.createDeviceTransducer(req, function(err, result){
        if(err) { return next(err); }
        return res.json(result);
    })
});

/* Get all transducers for a given device */
router.get('/:_id/transducer', function(req, res, next){
    transducerManager.getAllDeviceTransducers(req, function(err, result){
        if(err) { return next(err); }
        return res.json(result);
    })
});

/* Publish to device transducer */
router.post('/:_id/transducer/:_transducerId', function(req, res, next ){
    transducerManager.publishToDeviceTransducer(req, function(err, result){
        if(err) { return next(err); }
        return res.json(result);
    })
});

/* Get device transducer values */
router.get('/:_id/transducer/:_transducerId', function(req, res, next ){
	/* getDeviceTransducer will directly pipe the incoming response from influxdb to the browser (so no callback) */
    transducerManager.getDeviceTransducer(req, res); 
});

/* Delete transducer */
router.delete('/:_id/transducer/:_transducerId', function(req, res, next ){
    transducerManager.deleteDeviceTransducer(req, function(err, result){
        if(err) { return next(err); }
        return res.json(result);
    })
});

/*************** Commands ***************************/

/* Add a command to device */
router.post('/:_id/command', function(req, res, next ){
    commandManager.createCommand(req, function(err, result){
        if(err) { return next(err); }
        return res.json(result);
    })
});

/* Get all commands for a given device */
router.get('/:_id/command', function(req, res, next){
    commandManager.getAllCommands(req, function(err, result){
        if(err) { return next(err); }
        return res.json(result);
    })
});

/* Execute a command */
router.post('/:_id/command/:_commandId', function(req, res, next ){
    commandManager.executeCommand(req, function(err, result){
        if(err) { return next(err); }
        return res.json(result);
    })
});

/* Update a command */
/*router.put('/:_id/command/:_commandId', function(req, res, next ){
    commandManager.updateCommand(req, function(err, result){
        if(err) { return next(err); }
        return res.json(result);
    })
});*/

/* Delete command */
router.delete('/:_id/command/:_commandId', function(req, res, next ){
    commandManager.deleteCommand(req, function(err, result){
        if(err) { return next(err); }
        return res.json(result);
    })
});


/*************** Services ***************************/

/* Link device to a service */
router.post('/:_id/service/:_serviceId', function(req, res, next ){
    deviceManager.linkService(req, function(err, result){
        if(err) { return next(err); }
        return res.json(result);
    })
});


/* Update device's service config */
router.put('/:_id/service/:_serviceId', function(req, res, next ){
    deviceManager.updateServiceConfig(req, function(err, result){
        if(err) { return next(err); }
        return res.json(result);
    })
}); 

/* Remove device from a serivce */
router.delete('/:_id/service/:_serviceId', function(req, res, next){
    deviceManager.delinkService(req, function(err, result){
        if(err) { return next(err); }
        return res.json(result);
    })
});


/*************** Tokens ***************************/

/* Generate a token*/
router.post('/:_id/token', function(req, res, next ){
    if(req.token){
        var error = new Error();
        error.message = "Token already exists for thing id : " + req.token.username;
        return next(error);
    }
    thingTokenManager.createToken(req.device._id,"device", req.user._id,  function(err, result){
        if(err) { return next(err); }
        return res.json(result);
    })
});

/* Re-Generate a token*/
router.put('/:_id/token', function(req, res, next ){
    if(!req.token){
        var error = new Error();
        error.message = "No Token found for " + req.device._id + ". Use POST to generate a new token";
        return next(error);
    }
    thingTokenManager.recreateToken(req,  function(err, result){
        if(err) { return next(err); }
        return res.json(result);
    })
});

/* Delete a token*/
router.delete('/:_id/token', function(req, res, next ){
    if(!req.token){
        var error = new Error();
        error.message = "No Token found for " + req.device._id + ". Nothing to delete.";
        return next(error);
    }
    thingTokenManager.deleteToken(req,  function(err, result){
        if(err) { return next(err); }
        return res.json(result);
    })
});
module.exports = router;
