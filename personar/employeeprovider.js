var self = this;

var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSONPure;
var ObjectID = require('mongodb').ObjectID;
var username = "author";
var pwd = "pass";

EmployeeProvider = function(host, port) {
    self = this;
    self.db= new Db('personar', new Server(host, port, {safe: false}, {auto_reconnect: true}, {}));
    self.db.open(function(){
        self.db.authenticate(username,pwd,function(err,res) {
            console.log("Successfully connected to DB: " + res);
        });
    });
};


EmployeeProvider.prototype.getCollection= function(callback) {
    this.db.collection('employees', function(err, employee_collection) {
        if( err ) callback(err);
        else callback(null, employee_collection);
    });
};

//find all employees
EmployeeProvider.prototype.findAll = function(callback) {
    this.getCollection(function(err, employee_collection) {
        if( err ) callback(err)
        else {
            employee_collection.find().toArray(function(err, results) {
                if( err ) callback(err)
                else callback(null, results)
            });
        }
    });
};

//find an employee by ID
EmployeeProvider.prototype.findById = function(id, callback) {
    this.getCollection(function(err, employee_collection) {
        if( err ) callback(err)
        else {
            employee_collection.findOne({_id: employee_collection.db.bson_serializer.ObjectID.createFromHexString(id)}, function(err, result) {
                if( err ) callback(err)
                else callback(null, result)
            });
        }
    });
};


//save new employee
EmployeeProvider.prototype.save = function(employee, callback) {
    this.getCollection(function(err, employee_collection) {
        if( err ) callback(err)
        else {
            employee_collection.insert(employee, function() {
                callback(null, employee);
            });
        }
    });
};

// update an employee
EmployeeProvider.prototype.update = function(employeeId, employee, callback) {
    objId = BSON.ObjectID.createFromHexString(employeeId);
    this.getCollection(function(err, employee_collection) {
        if( err ) callback(err);
        else {
            employee_collection.update(
                {_id: objId},
                employee,
                function(err, employee) {
                    if(err) callback(err);
                    else callback(null, employee)
                });
        }
    });
};

//delete employee
EmployeeProvider.prototype.delete = function(employeeId, callback) {
    this.getCollection(function(err, employee_collection) {
        if(err) callback(err);
        else {
            employee_collection.remove(
                {_id: employee_collection.db.bson_serializer.ObjectID.createFromHexString(employeeId)},
                function(err, employee){
                    if(err) callback(err);
                    else callback(null, employee)
                });
        }
    });
};

exports.EmployeeProvider = EmployeeProvider;