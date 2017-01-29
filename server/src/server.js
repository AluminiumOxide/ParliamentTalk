'use strict';

module.exports = function(env) {

	/*** Modules ***/
	var mongoose = require('mongoose');
	var app = require('connect')();
	var http = require('http');
	var swaggerTools = require('swagger-tools');
	var jsyaml = require('js-yaml');
	var fs = require('fs');
	var serverPort = 8080;
	var when = require('when');
	var i18n = require('./lib/i18n');
	var emailer = require('./lib/emailer');
	
	/*** Files ***/
	require('./models/users');
	
	/*** Models ***/
	var User = mongoose.model('User');
	
	/*** Determine Our Environment ***/
	var appEnv = (!!env && env == 'test') ? 'test' : 'development';
	// TODO: When we have a production environment, test for that here

	// swaggerRouter configuration
	var options = {
		swaggerUi: './api/swagger.json',
	  	controllers: './src/controllers',
	  	useStubs: appEnv === 'development' ? true : false // Conditionally turn on stubs (mock mode)
	};
	
	// The Swagger document (require it, build it programmatically, fetch it from a URL, ...)
	var spec = fs.readFileSync('./api/swagger.yaml', 'utf8');
	var swaggerDoc = jsyaml.safeLoad(spec);

	// Connect to emailer if we're not in tests
	var emailString = require('../config/email').smtp;
	var emailerInst = emailer.getInstance();
	emailerInst.config(appEnv,emailString);	
	
	var deferred = when.defer();

	// Connect to the testing database if we're in tests
	var connectionString = 'mongodb://db:27017/ptalk'; 
	if(appEnv === 'test') {
		connectionString = 'mongodb://db:27017/ptalktest';
	}

	mongoose.Promise = global.Promise;
	when(mongoose.connect(connectionString))
		.then(r => {

		    	// Initialize the Swagger middleware
			swaggerTools.initializeMiddleware(swaggerDoc,function(middleware) {

				// Interpret Swagger resources and attach metadata to request - must be first in swagger-tools middleware chain
      				app.use(middleware.swaggerMetadata());
    
     	 			// Validate Swagger requests
     	 			app.use(middleware.swaggerValidator());
    
     	 			// Route validated requests to appropriate controller
     	 			app.use(middleware.swaggerRouter(options));
    
     	 			// Serve the Swagger documents and Swagger UI
     	 			app.use(middleware.swaggerUi());

					// Load the internationalization
					app.use(i18n.getInit());

     	 			// Start the server
     	 			when(http.createServer(app).listen(serverPort))
					.then(() => {
     	 				console.log('Your server is listening on port %d (http://localhost:%d)', serverPort, serverPort);
     	 				console.log('Swagger-ui is available on http://localhost:%d/docs', serverPort);
     	 				deferred.resolve(app);
				}).otherwise(err => {
					deferred.reject(err);
     	 		});
    		});
  		}).otherwise(err => {
    			deferred.reject(err);
  		});

	return deferred.promise;
};
