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
  this.groupSize = null;
  //exercise2 heteronomy autonomy
  this.thoughts = [];

}

Data.prototype.getgroupSize = function () {
  return this.groupSize;
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

Data.prototype.addThought = function (thoughts) {
  this.thoughts.push(thoughts);
};


var data = new Data();

Data.prototype.setSession = function(min, max) {
  this.session = Math.floor(Math.random() * (max - min) )+ min;
}

Data.prototype.setGroups = function (groupSize) {
  
  this.groupSize = (data.students.length / groupSize);

}

var server = app.listen(app.get('port'), function () {
  data.setSession(1111,9999);
  console.log("The token for this session is: " + data.session);
  console.log('Server listening on port ' + app.get('port'));
});


var io = socket(server)
const studentsio = io.of('/students');


const grouponeio = io.of('/groupone'); 
const grouptwoio = io.of('/grouptwo'); 
const grouphreeio = io.of('/groupthree'); 
const groupfourio = io.of('/groupfour'); 

//namespace specific to students
studentsio.on('connection', socket => { 
  console.log('listen for student connection')
  console.log("studentNamespace with socketID: " + socket.id + " connected");
  socket.emit('connectionmessage', "student connected on namespace students");
  console.log(Object.keys(studentsio.connected));

  //listen for when students log in
  socket.on('loggedIn', function() {
    console.log("student with socketID: " + socket.id + " logged in to the workshop");
    //TODO: add student to a group and send group to student
    //add student to global namespace and update id
    data.addStudent();
    console.log(data.currentStudentId);
    //notify teacher that a student has logged in
    io.emit("StudentLoggedIn", data.currentStudentId);
  });

  socket.on('generateGroupsplz', function() {
    socket.emit('startgroupnamespaxe', 'yay');
    console.log("namespace student can start grouping");
  });
});

io.on('connection', function(socket) {
  io.emit('session', data.session); 
  console.log(data.session);
  console.log("client with socketID:  " + socket.id + " connected");
 
  
  socket.on('navigateStudentsTo', function(exerciseNum) {
      //route to first exercise
      io.emit('redirect', exerciseNum)
  });
  socket.on('thoughts', function(thoughts) {

    console.log("server collecting thoughts");
    for ( var i = 0, l = thoughts.length; i < l; i++) {
      data.addThought(thoughts[i]);
      console.log(data);
    }
    console.log(data.thoughts);
    io.emit('displayThoughts', data.thoughts); 
 });
  socket.on('generateGroups', function(groupSize) {
    console.log('server generating groups');
    data.setGroups(data.students.length, groupSize);
    io.to('/students').emit('generateGroupsplz', 'hej');
  });

});

