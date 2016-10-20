/*** Modules ***/
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var multer = require('multer');

/*** Files ***/
require('./models/users');

/*** Models ***/
var User = mongoose.model('User');

/*** Controllers ***/
var AccountController = require('./controllers/accounts');

/*** App Setup ***/
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
var upload = multer();
mongoose.connect('mongodb://localhost/ptalk', function (err) {

if(err) {
	res.send("ERR");
	return
}

/*** Routes ***/

// Root
app.get('/', function(req, res) {
	res.send('Hello World!');
});

// Sign In
app.post('/signIn', upload.array(), function(req, res) {
	AccountController.signIn(req, res);
});

// Sign Out
app.post('/signOut', upload.array(), function(req, res) {
	AccountController.signOut(req, res);
});

// Sign Up
app.post('/signUp', upload.array(), function(req, res) {
	AccountController.signUp(req, res);
});

// get account data
app.get('/account/', function(req, res) {
	AccountController.view(req, res);
});

// recover account
// verify account
// update account


// get vote data
// get vote token
// cast ballot

// get bill data

/*** Run App ***/
app.listen(3000, function() {
	console.log("App listening on port 3000!");
});

});
