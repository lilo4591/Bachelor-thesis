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
  this.currentStudentNumber = 0;
  this.groups = [];
  this.groupNames = [];
  this.session = null;
  this.groupNum = null;
  //exercise2 heteronomy autonomy
  this.thoughts = [];
  //groupname : dilemma
  this.dilemmas = [];
  this.reflexthoughts = [];
  this.principles = [];
  this.concreteValues = [];
  this.actionAlternatives = [];

  //list of groupbj:{name, no of students, studentid(studentsocketconnection)}
  this.groupObj = [];

}

Data.prototype.getgroupSize = function () {
  return this.groupSize;
}

Data.prototype.getStudentNumber = function () {
  this.currentStudentNumber += 1;
  return this.currentStudentNumber;
};

Data.prototype.addStudent = function () {
  var student = this.getStudentNumber();
  this.students.push(student);
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

//testing obj group
Data.prototype.addGroupObj = function (group) {
  var GROUP = {name: null, noOfStudents: 0, studentsId: []};
  GROUP.name = group;
  this.groupObj.push(GROUP); 

}

Data.prototype.addStudentToGroupObj = function(student, group) {
  for (var i in this.groupObj) {
    if (this.groupObj[i].name == group) {
      this.groupObj[i].noOfStudents += 1;
      this.groupObj[i].studentsId.push(student);
    }
  }
}

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

Data.prototype.addDilemma = function (group, dilemma) {
  
  //deletes dilemma if it already exists
  if (this.dilemmas.hasOwnProperty(group)) {
    delete this.dilemmas[group];
  }
  this.dilemmas[group] = dilemma;
  console.log(this.dilemmas);
};

  
Data.prototype.addReflexThoughts = function (group, thoughts) {
  
  if (this.reflexthoughts.hasOwnProperty(group)) {
    for (var key in thoughts) {
      this.reflexthoughts[group].push(thoughts[key]);
    }
  }
  else {
    this.reflexthoughts[group] = thoughts;
  }
  console.log("This is group" + group);
  console.log(this.reflexthoughts[group]);
};

Data.prototype.addPrinciples = function (group, principles) {
  
  if (this.principles.hasOwnProperty(group)) {
    for (var key in principles) {
      this.principles[group].push(principles[key]);
    }
  }
  else {
    this.principles[group] = principles;
  }
  console.log("This is group " + group + " principles");
  console.log(this.principles[group]);
};

Data.prototype.addConcreteValues = function (group, concreteValues) {
  
  if (this.concreteValues.hasOwnProperty(group)) {
    for (var key in concreteValues) {
      this.concreteValues[group].push(concreteValues[key]);
    }
  }
  else {
    this.concreteValues[group] = concreteValues;
  }
  console.log("This is group " + group + " values");
  console.log(this.concreteValues[group]);
};

Data.prototype.addActionAlternatives = function (group, actionAlternatives) {
  
  if (this.actionAlternatives.hasOwnProperty(group)) {
    for (var key in actionAlternatives) {
      this.actionAlternatives[group].push(actionAlternatives[key]);
    }
  }
  else {
    this.actionAlternatives[group] = actionAlternatives;
  }
  console.log("This is group " + group + " values");
  console.log(this.actionAlternatives[group]);
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
    //add student to global namespace and update currentstudent number
    data.addStudent();
    //notify teacher that a student has logged in
    io.emit("StudentLoggedIn", data.currentStudentNumber);
  });

});

io.on('connection', function(socket) {
  io.emit('session', data.session); 
  console.log("client with socketID:  " + socket.id + " connected");

  socket.on('navigateStudentsTo', function(exerciseNum) {
    //route to first exercise
    io.emit('redirect', exerciseNum)
  });
  socket.on('thoughts', function(thoughts) {

    console.log("server collecting thoughts");
    for ( var i = 0, l = thoughts.length; i < l; i++) {
      data.addThought(thoughts[i]);
    }
    io.emit('displayThoughts', data.thoughts); 
  });
  socket.on('generateGroups', function(groupSize) {
    data.setNumGroups(groupSize);

    //create namespace for each group
    for (var i=0, len = data.groupNum ; i < len; i++) {
      var group = '/group' + i.toString();
      data.addGroupName(group);
      //groupobj to print to teacher
      data.addGroupObj(group);
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
        data.addStudentToGroupObj(allstudents[index], currentGroup);
        studentconnection.to(allstudents[index]).emit('namespace', currentGroup);
        //delete used student
        allstudents.splice(index,1);
        len = len - 1;
       }
      for (var i=0; i < len ; i++) {
        if (count < groupSize) {
        var index = Math.floor(getRandomArbitrary(0,allstudents.length));
        data.addStudentToGroupObj(allstudents[index], currentGroup);
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
    //sending groupname,size and ids to teacherpage to print
    socket.emit('groupInfo', {'groupObject': data.groupObj});
    //namespace specific to groups
    var i;
    for (i=0, len= data.groupNames.length; i < len ; i++) {
      groupconnection.push(io.of(data.groupNames[i]).on('connection', function(index) {
        return function (socket) { 
          console.log("A student joined group " + data.groupNames[index]);
          socket.on('dilemma', function(info) {
            data.addDilemma(data.groupNames[index], info.dilemma);
            io.of(data.groupNames[index]).emit('showdilemma', info)
          });
          socket.on('edit', function(info) {
            io.of(data.groupNames[index]).emit('editdilemma', info)
          });
          //collecting reflexthoughts
          socket.on('reflexthoughts', function(thoughts) {
            data.addReflexThoughts(data.groupNames[index], thoughts);
            //sending reflexthoughts within each group
            io.of(data.groupNames[index]).emit('showreflexthoughts', data.reflexthoughts[data.groupNames[index]]);
          });
          //collecting principles
          socket.on('principles', function(principles) {
            data.addPrinciples(data.groupNames[index], principles);
            //sending principles within each group
            io.of(data.groupNames[index]).emit('showprinciples', data.principles[data.groupNames[index]]);
          });
         //collecting concreteValues
          socket.on('concretevalues', function(concreteValues) {
            data.addConcreteValues(data.groupNames[index], concreteValues);
            //sending concretevalues within each group
            io.of(data.groupNames[index]).emit('showconcretevalues', data.concreteValues[data.groupNames[index]]);
          });
          //collecting action alternatives
          socket.on('actionalternatives', function(actionAlternatives) {
            data.addActionAlternatives(data.groupNames[index], actionAlternatives);
            //sending action alternatives within each group
            io.of(data.groupNames[index]).emit('showactionalternatives', data.actionAlternatives[data.groupNames[index]]);
          });
 
 
        } 
      }(i)));
    }
  });

});

