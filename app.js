var axios = require('axios')
var express = require('express');
const session = require('express-session')

var app = express();
var handlebars = require('express-handlebars').create({ defaultLayout: 'main' });
var bodyParser = require('body-parser');

app.use(session({'secret': 'super-duper',
                 'saveUninitialized': true,
                 'resave': true}));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(express.static('public'));

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 12120);

const dburl = "http://localhost:12121/"

//Home page
app.get('/', function(req, res) {
    context = {}
    context.title = "Immunizations Database"
    context.userId = req.session.userId

    //user has signed in, display username
    if (req.session.userId) {
        context.username = req.session.username
    }

    res.render('home', context)
});

//Sign up page
app.get('/sign-up', function(req, res) {
    context = {}
    context.title = "Create an Account"
    context.userId = req.session.userId

    res.render('sign-up', context)
});

//Add account to 'database'
app.post('/sign-up', function(req, res, next) {
    context = {}
    context.title = "Create an Account"
    context.userId = req.session.userId

    let accountInfo = req.body; //pull out account info from form post
    axios
        .post(dburl + "users", accountInfo) //submit account info to db
        .then(function(response) {
            //account successfully created
            if (response.status >= 200 && response.status <= 299) {
                context.statusMessage = "Account Created!"
            }
            //account creation failed
            else if (response.status >= 400) {
                context.statusMessage = "Account could not be created!"
            }
            res.render('sign-up', context)
        })
});

//Login page
app.get('/login', function(req, res) {
    context = {}
    context.title = "Login"
    context.userId = req.session.userId
    res.render("login", context)
});

//Login attempt
app.post("/login", function(req, res, next) {
    context = {};
    context.title = "Login"
    context.userId = req.session.userId
    login = req.body //pull out form data
    axios
        .get(dburl + "users") //get all users in database
        .then(response => {
            let users = response.data;
            //try to find a match for submitted username and password
            let [user] = users.filter(u => u.username === login.username && 
                                           u.password === login.password)
            //user found, successful sign in
            if (user) {
                console.log("Successful sign in for: " + user.username);
                //store user info in session
                req.session.userId = user.id
                req.session.username = user.username
                req.session.email = user.email
                res.redirect("/");
            }
            //no matching user found, send back to login page
            else {
                console.log("That user doesn't exist: " + login.username)
                context.statusMessage = "Invalid credentials";
                res.render("login", context);
            }
        }) 
        .catch(error => {
            console.log(error)
        })
})

//Home page
app.get('/home-page', function(req, res) {
    context = {}
    context.title = "Home Page"
    context.userId = req.session.userId
    res.render("home-page", context)
});


//View records
app.get('/view', function(req, res, next) {
	//set patient id 
	var patientId = req.session.userId
	axios
		//get record data based on patient id 
		.get(dburl + "immunizations?patientId=" + patientId)
		.then(function(response){
			//set records equal to response data 
			records = response.data
			//send response data to handlebars template 
			res.render("view", records);
		
		})
		.catch(error => {
			console.log(error)
		})
})


//Logout user by destroying session data
app.get('/logout', function(req, res) {
    req.session.destroy();
    res.redirect("/")
});

//Error handling
app.use(function (req, res) {
    res.status(404);
    res.render('404');
});

app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.type('plain/text');
    res.status(500);
    res.render('500');
});

//Start running app
app.listen(app.get('port'), function () {
    console.log('Express started on http://localhost:' + app.get('port'));
});
