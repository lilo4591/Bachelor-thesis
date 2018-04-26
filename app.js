/*jslint node: true */
/* eslint-env node */
'use strict';

// Require express, socket.io, and vue
var express = require('express');
var app = express();
var http = require('http').Server(app);
//var io = require('socket.io')(http);
var path = require('path');
var socket = require('socket.io');

// Pick arbitrary port for server
var port = 3000;
app.set('port', (process.env.PORT || port));

// Serve static assets from public/
app.use(express.static(path.join(__dirname, 'public/')));
// Serve vue from node_modules as vue/
app.use('/vue', express.static(path.join(__dirname, '/node_modules/vue/dist/')));

// Serve test.html directly as root page
app.get('/test', function (req, res) {
  res.sendFile(path.join(__dirname, 'views/test.html'));
});


// Serve index.html directly as root page
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'views/teacher.html'));
});

// Serve teacher-start-workshop.html as /teacher-start-workshop
app.get('/teacher-start-workshop', function (req, res) {
  res.sendFile(path.join(__dirname, 'views/teacher-start-workshop.html'));
});

// Serve workshop.html as /workshop
app.get('/workshop', function (req, res) {
  res.sendFile(path.join(__dirname, 'views/workshop.html'));
});

// Serve heteronomy-autonomy.html as /heteronomy-autonomy
app.get('/heteronomy-autonomy1', function (req, res) {
  res.sendFile(path.join(__dirname, 'views/heteronomy-autonomy1.html'));
});



// Serve student.html as /student
app.get('/student', function (req, res) {
  res.sendFile(path.join(__dirname, 'views/student/student.html'));
});

// Serve teacher-admin.html as /dispatcher
app.get('/teacher-admin', function (req, res) {
  res.sendFile(path.join(__dirname, 'views/teacher-admin.html'));
});

// Store data in an object to keep the global namespace clean and
// prepare for multiple instances of data if necessary

 
function Data() {
  this.students = [];
  this.currentStudentId = 0;
  this.groups = [];
  this.session = null;
}

Data.prototype.getStudentId = function () {
  this.currentStudentId += 1;
  return this.currentStudentId;
};

Data.prototype.addStudent = function () {
  var studentId = this.getStudentId();
  this.students.push(studentId);
};

Data.prototype.getAllStudents = function () {
  return this.students;
};

var data = new Data();

Data.prototype.setSession = function(min, max) {
  this.session = Math.floor(Math.random() * (max - min) )+ min;
}

var server = app.listen(app.get('port'), function () {
  data.setSession(1111,9999);
  console.log("The token for this session is: " + data.session);
  console.log('Server listening on port ' + app.get('port'));
});

var io = socket(server)

io.on('connection', function(socket) {
  io.emit("session", data.session); 
  console.log("client with socketID:  " + socket.id + " connected");
  //listen for when students log in
  socket.on('loggedIn', function() {
    console.log("student with socketID: " + socket.id + " logged in to the workshop");
    //add student to global namespace and update id
    data.addStudent();
    console.log(data.currentStudentId);
    //notify everyone that a student has logged in
    io.emit("StudentLoggedIn", data.currentStudentId);
    console.log("notificaton sent");
    //socket.emit('getstudentId', this.studentId);
    console.log(data);
  });

});
/*
io.of("/test").on('connection', function(socket) {
  console.log("Teacher with socketID:  " + socket.id + " connected")
});
*/

/*
io.on('connection', function (socket) {
  // Send list of orders when a client connects
  socket.emit('initialize', { orders: data.getAllOrders(),
                              taxis: data.getAllTaxis() });
  // Add a listener for when a connected client emits an "orderTaxi" message
  socket.on('orderTaxi', function (order) {
    var orderId = data.addOrder(order);
    order.orderId = orderId;
    // send updated info to all connected clients, note the use of "io" instead of "socket"
    io.emit('taxiOrdered', order);
    // send the orderId back to the customer who ordered
    socket.emit('orderId', orderId);
  });
  socket.on('addTaxi', function (taxi) {
    taxi.driverQueue = 0;
    data.addTaxi(taxi);
    // send updated info to all connected clients, note the use of io instead of socket
    io.emit('taxiAdded', taxi);
  });
  socket.on('moveTaxi', function (taxi) {
    data.updateTaxiDetails(taxi);
    // send updated info to all connected clients, note the use of io instead of socket
    io.emit('taxiMoved', taxi);
  });
  socket.on('taxiQuit', function (taxi) {
    data.removeTaxi(taxi);
    console.log("Taxi",taxi,"has left the job");
    // send updated info to all connected clients, note the use of io instead of socket
    io.emit('taxiQuit', taxi);
  });
  socket.on('finishOrder', function (orderId) {
    data.finishOrder(orderId);
    // send updated info to all connected clients, note the use of io instead of socket
    io.emit('orderFinished', orderId);
  });

  socket.on('taxiAssigned', function(order) {
    data.updateOrderDetails(order);
    io.emit('currentQueue', { orders: data.getAllOrders() });
  });
  socket.on('orderAccepted', function(order) {
    data.updateOrderDetails(order);
    data.taxis[order.taxiIdConfirmed].orderQueue.push(order.orderId);
    io.emit('orderAccepted', order );
    io.emit('taxiUpdated', data.taxis[order.taxiIdConfirmed] );
  })
});


var server = http.listen(app.get('port'), function () {
  console.log('Server listening on port ' + app.get('port'));
});
**/
