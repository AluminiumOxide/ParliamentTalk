'use strict';

module.exports = function() {

	/*** Modules ***/
	var mongoose = require('mongoose');
	var app = require('connect')();
	var http = require('http');
	var swaggerTools = require('swagger-tools');
	var jsyaml = require('js-yaml');
	var fs = require('fs');
	var serverPort = 8080;
	var when = require('when');
	
	/*** Files ***/
	require('./models/users');
	
	/*** Models ***/
	var User = mongoose.model('User');
	
	// swaggerRouter configuration
	var options = {
		swaggerUi: './api/swagger.json',
	  	controllers: './src/controllers',
	  	useStubs: process.env.NODE_ENV === 'development' ? true : false // Conditionally turn on stubs (mock mode)
	};
	
	// The Swagger document (require it, build it programmatically, fetch it from a URL, ...)
	var spec = fs.readFileSync('./api/swagger.yaml', 'utf8');
	var swaggerDoc = jsyaml.safeLoad(spec);

	var deferred = when.defer();

	mongoose.Promise = global.Promise;
	when(mongoose.connect('mongodb://db:27017/ptalk'))
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
