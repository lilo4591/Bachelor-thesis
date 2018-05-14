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

//global data 
function Data() {
  this.students = [];
  this.currentStudentId = 0;
  this.groups = [];
  this.groupNames = [];
  this.session = null;
  this.groupNum = null;
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

Data.prototype.addGroupName = function (group) {
  this.groupNames.push(group);
};

Data.prototype.setSession = function(min, max) {
  this.session = Math.floor(Math.random() * (max - min) )+ min;
};

Data.prototype.setNumGroups = function (groupSize) {

  if (groupSize == data.students.length) {
    this.groupNum = 1;  
  }
  else if (data.students.length % groupSize > 1) {
    this.groupNum = Math.ceil(data.students.length / groupSize);
  }
  else {
    this.groupNum = Math.floor(data.students.length / groupSize);
  }
};

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

var data = new Data();

var server = app.listen(app.get('port'), function () {
  data.setSession(1111,9999);
  console.log("The token for this session is: " + data.session);
  console.log('Server listening on port ' + app.get('port'));
});

var io = socket(server)
const studentsio = io.of('/students');
var groupconnection = [];

//namespace specific to students
var studentconnection = studentsio.on('connection', socket => { 
  console.log("studentNamespace with socketID: " + socket.id + " connected");
  socket.emit('connectionmessage', "student connected on namespace students");

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
      //console.log(data);
    }
    console.log(data.thoughts);
    io.emit('displayThoughts', data.thoughts); 
  });
  socket.on('generateGroups', function(groupSize) {
    //TODO: handle uneven number of students
    console.log('server generating groups');
    data.setNumGroups(groupSize);
    console.log("Number of students connected in socket: " + data.students.length );
    console.log("Groupsize in socket: " + groupSize );
    console.log("Groupnum in socket: " + data.groupNum );

    //create namespace for each group
    console.log("groupnum: " + data.groupNum);
    for (var i=0, len = data.groupNum ; i < len; i++) {
      var group = '/group' + i.toString();
      data.addGroupName(group);
      console.log(data.groupNames);
    }
    var allstudents = Array.from(Object.keys(studentconnection.connected));

    var g = 0;
    var currentGroup = data.groupNames[g];
    var count = 0; 
    var len = Array.from(Object.keys(studentsio.connected)).length;
    //send a random group to each connected student
      //uneven nr of students or uneven number of groups
      if (len % groupSize == 1)  {
        //put student in group
        var index = Math.floor(getRandomArbitrary(0,allstudents.length));
        studentconnection.to(allstudents[index]).emit('namespace', currentGroup);
        //delete used student
        allstudents.splice(index,1);
        len = len - 1;
       }
      for (var i=0; i < len ; i++) {
        if (count < groupSize) {
        var index = Math.floor(getRandomArbitrary(0,allstudents.length));
        studentconnection.to(allstudents[index]).emit('namespace', currentGroup);
        //delete used student
        allstudents.splice(index,1);
        count = count + 1;
      }
      else {
        g = g + 1;
        currentGroup = data.groupNames[g];
        count = 0;
        i = i - 1;
      }
    }
    socket.emit('groupInfo', {'numberOfGroups' : data.groupNum,
                              'groupNames': data.groupNames});
    //namespace specific to groups
    var i;
    for (i=0, len= data.groupNames.length; i < len ; i++) {
      groupconnection.push(io.of(data.groupNames[i]).on('connection', function(index) {
        return function (socket) { 
          console.log("A student joined group " + data.groupNames[index]);
          socket.on('dilemma', function(info) {
            console.log("socketon dilemma");
            console.log(data.groupNames[index]);
            io.of(data.groupNames[index]).emit('showdilemma', info)
          });
         socket.on('edit', function(info) {
            console.log("socketon edit");
            io.of(data.groupNames[index]).emit('editdilemma', info)
          });
        } 
      }(i)));
    }
  });

});

