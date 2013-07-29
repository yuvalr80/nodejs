/**
 * Module dependencies.
 */

var express = require('express')
    , routes = require('./routes')
    , user = require('./routes/user')
    , http = require('http')
    , path = require('path')
    , EmployeeProvider = require('./employeeprovider').EmployeeProvider;

var app = express();

app.configure(function(){
    app.set('port', process.env.PORT || 5000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.set('view options', {layout: false});
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(require('stylus').middleware(__dirname + '/public'));
    app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
    app.use(express.errorHandler());
});

var employeeProvider= new EmployeeProvider('dharma.mongohq.com', 10082);


// Process

process.on('uncaughtException', function(err) {
    console.log('Caught exception: ' + err);
});

process.on('exit', function() {
    console.log('About to exit.');
});


//Routes


// ############################
// #########   API   ##########
// ############################

// global controller
app.get('/*',function(req,res,next){
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'application/x-www-form-urlencoded');
    next();
});

// get all employees
app.get('/employee', function(req, res){
    employeeProvider.findAll(
        function(err, emps){
            if (err) res.writeHead(500, err.message)
            else if (!emps.length) res.writeHead(404);
            else {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.write(JSON.stringify(emps))
            }
            res.end();
        }
    );
});

// get an employee
app.get('/employee/:id', function(req, res){
    employeeProvider.findById(req.params.id, function(err, emp) {
        if (err) res.writeHead(500, err.message)
        else if (!emp) res.writeHead(404);
        else {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.write(JSON.stringify(emp))
        }
        res.end();
    });
});

// insert an employee
app.get("/insert/employee", function(req, res){
    employeeProvider.save({
        name: req.param('name'),
        x: req.param('x'),
        y: req.param('y')
    }, function(err, docs) {
        if (err) res.writeHead(500, err.message); else res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end();
    });
});

app.put('/employee', function(req, res){
    employeeProvider.save({
        name: req.param('name'),
        x: req.param('x'),
        y: req.param('y')
    }, function(err, docs) {
        if (err) res.writeHead(500, err.message); else res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end();
    });
});

// update an employee
app.get("/update/employee", function(req, res){
    employee = {
        name: req.param('name'),
        x: req.param('x'),
        y: req.param('y')
    };
    employeeProvider.update(
        req.param('_id'), employee,
        function(err, docs) {
            if (err) res.writeHead(500, err.message); else res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end();
        });
});

app.post("/employee", function(req, res){
    employeeId = req.param('_id');
    employee = {
        name: req.param('name'),
        x: req.param('x'),
        y: req.param('y')
    };
    employeeProvider.update(
        employeeId, employee, function(err, docs) {
            if (err) res.writeHead(500, err.message); else res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end();
        });
});

//delete an employee
app.get('/delete/employee/:id', function(req, res) {
    employeeProvider.delete(req.params.id,
        function(err, docs) {
            if (err) res.writeHead(500, err.message); else res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end();
        });
});

app.delete('/employee/:id', function(req, res) {
    employeeProvider.delete(req.params.id,
        function(err, docs) {
            if (err) res.writeHead(500, err.message); else res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end();
        });
});



// ##############################
// #########  WEBAPP  ###########
// ##############################


// main page
app.get('/', function(req, res){
    employeeProvider.findAll(function(err, emps){
        res.render('index', {
            title: 'Personar',
            employees:emps
        });
    });
});

// get new employee form
app.get('/employee/new', function(req, res) {
    res.render('employee_new', {
        title: 'New Employee'
    });
});

//save new employee (form)
app.post('/employee/new', function(req, res){
    employeeProvider.save({
        name: req.param('name'),
        x: req.param('x'),
        y: req.param('y')
    }, function( err, docs) {
        res.redirect('/')
    });
});

//update an employee edit form
app.get('/employee/:id/edit', function(req, res) {
    employeeProvider.findById(req.param('_id'), function(err, employee) {
        res.render('employee_edit',
            {
                employee: employee
            });
    });
});

//save updated employee (form)
app.post('/employee/:id/edit', function(req, res) {
    employeeProvider.update(req.param('_id'), {
        name: req.param('name'),
        x: req.param('x'),
        y: req.param('y')
    }, function(err, docs) {
        res.redirect('/')
    });
});

//delete an employee (form)
app.post('/employee/:id/delete', function(req, res) {
    employeeProvider.delete(req.param('_id'),
        function(err, docs) {
            res.redirect('/')
        }
    );
});


app.listen(process.env.PORT || 5000);