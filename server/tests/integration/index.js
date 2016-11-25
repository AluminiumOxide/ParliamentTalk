var path = require('path');
var fs = require('fs');
var sinon = require('sinon');
var when = require('when')
var hippie = require('hippie-swagger');
var SwaggerParser = require('swagger-parser');
var parser = new SwaggerParser();

var appFile = require('../../src/server');
var app = null;
var swagger = null;

describe('API integration tests', function() {

	before(function () {
		var deferred = when.defer();
		parser.dereference('api/swagger.yaml', function(err, api) {
			if (err) deferred.reject(err);
			swagger = api;
			when(appFile())
			.then(r => {
				app = r;
				deferred.resolve();
			});
		});
		return deferred.promise;
	});

	it('tests loaded', function() {
		var root = __dirname;
		fs.readdirSync(root).forEach(file => {
			file = path.join(root,file);
			if(file != __filename && path.extname(file) == ".js") {
				require(file)(app,swagger);
			}
		});
	});
});
