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

// Serve teacherpage.html directly as root page
app.get('/teacher', function (req, res) {
  res.sendFile(path.join(__dirname, 'views/teacherpage.html'));
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
  io.emit('session', data.session); 
  console.log(data.session);
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
  socket.on('navigateStudentsTo', function(exerciseNum) {
      //route to first exercise
      io.emit('redirect', exerciseNum)
  });
});

