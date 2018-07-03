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

// Serve teacher-admin.html as /teacher-admin
app.get('/teacher-admin', function (req, res) {
  res.sendFile(path.join(__dirname, 'views/teacher-admin.html'));
});

//global data 
function Data() {
  // studentname: , id: (socket)
  this.students = [];
  //list of groupbj:{name(of group), no of students, studentid(studentsocketconnection)}
  this.groupObj = [];

  //this.groups = [];
  this.groupNames = [];
  this.session = null;
  //number of students in each group
  this.groupNum = null;
  /*Exercise1 provocative*/
  //groupname : situations
  this.groupSituations = [];
  this.groupRisks = [];
  this.groupPoss = [];
  //generated arguments for love risks
  this.generatedRisks = [{ thought: 'You miss the chance of someone elses love' }, { thought: 'Love can cause mental illness' }];
  //generated arguments for war possibilies
  this.generatedPoss = [{ thought: 'War can liberate oppressed people' },
  { thought: 'War can build strong state capacity' },
  { thought: 'War defines the future of a civilization' },
  { thought: 'War can unite a nation' }];

  /** exercise2 heteronomy autonomy **/
  this.thoughts = [];
  //groupname : dilemma
  this.dilemmas = [];
  this.reflexthoughts = [];
  this.principles = [];
  this.concreteValues = [];
  this.actionAlternatives = [];

  /**session: {groups: 
                    {group0: 'linn', input: {dilemma: '', reflexthoughts}},
                    {group1: 'username', input: {dilemma }} 
              thoughts }
  **/
  this.activeSessions = {};
  this.activeSessionsNames = [];
}
Data.prototype.addActiveSession= function(sessionId) {
  this.activeSessionsNames.push(sessionId);
  this.activeSessions[sessionId] = {session: sessionId, groupNum: null, groups: [], groupNames: [], thoughts: [], students: []};
  //console.log("active sessions" + this.activeSessions);

};

Data.prototype.resetInputdata = function () {
  //exercise1 provocative
  //groupname : situations
  this.groupSituations = [];
  this.groupRisks = [];
  this.groupPoss = [];

  //exercise2 heteronomy autonomy
  this.thoughts = [];
  //groupname : dilemma
  this.dilemmas = [];
  this.reflexthoughts = [];
  this.principles = [];
  this.concreteValues = [];
  this.actionAlternatives = [];

}

Data.prototype.addStudent = function (username, socketid, session) {
  //old  logged students
  this.students.push({ studentname: username, id: socketid });
  //sessiontoken total logged in students
  //console.log("session: " + session);
  //console.log(this.activeSessions);
  this.activeSessions[session].students.push({studentname: username, id: socketid});
  //console.log(this.activeSessions);
};

//deletes a student which has disconnected
Data.prototype.removeStudent = function (socketid) {
  //old
  for (var i in this.students) {
    if (this.students[i].id == socketid) {
      console.log("Student " + this.students[i].studentname + " was deleted from server");
      this.students.splice(i, 1);
    }
  }
//new
//delete the id from group but keep the name of the student
  for (let key in this.activeSessions) {
    console.log("hej");
    console.log("groups: "  + key);
    for (var i in this.activeSessions[key].groups) {
      for (var n in this.activeSessions[key].groups[i].students) {
        console.log("student in group: " + this.activeSessions[key].groups[i].name + "with info: " + JSON.stringify(this.activeSessions[key].groups[i].students[n]));
        if (this.activeSessions[key].groups[i].students[n].id == socketid) {
          this.activeSessions[key].groups[i].students[n].id = null;
          console.log("student deleted was: " + this.activeSessions[key].groups[i].students[n].studentname);
        }
      }
    }
  }
};


Data.prototype.getAllStudents = function () {
  return this.students;
};

Data.prototype.addThought = function (thoughts) {
  this.thoughts.push(thoughts);
};

Data.prototype.addGroupName = function (group, session) {
  //old
  this.groupNames.push(group);
  //new
  this.activeSessions[session].groupNames.push(group);
};

Data.prototype.addSituation = function (situation) {
  this.situations.push(situation);
};



//testing obj group
Data.prototype.addGroupObj = function (group, session) {
  var GROUP = { name: null, noOfStudents: 0, students: [] };
  GROUP.name = group;
  //old
  this.groupObj.push(GROUP);
  //new
  this.activeSessions[session].groups.push(GROUP);
}

Data.prototype.addStudentToGroupObj = function (student, group, session) {
  //old
  /*
  for (var i in this.groupObj) {
    if (this.groupObj[i].name == group) {
      this.groupObj[i].noOfStudents += 1;
      this.groupObj[i].students.push(student);
    }
  }*/
  //new
  for (var i in this.activeSessions[session].groups) {
    if (this.activeSessions[session].groups[i].name == group) {
      this.activeSessions[session].groups[i].noOfStudents += 1;
      this.activeSessions[session].groups[i].students.push(student);
    }
  }
}

Data.prototype.setSession = function (session) {
  this.session = session;
};

Data.prototype.setNumGroups = function (groupSize, session) {
  var s = data.activeSessions[session];

  if (groupSize == data.activeSessions[session].students.length) {
    data.activeSessions[session].groupNum = 1;
  }
  else if (this.activeSessions[session].students.length % groupSize > 1) {
    data.activeSessions[session].groupNum = Math.ceil(data.activeSessions[session].students.length / groupSize);
  }
  else {
    data.activeSessions[session].groupNum = Math.floor(data.activeSessions[session].students.length / groupSize);
  }
};

Data.prototype.addDilemma = function (group, dilemma) {

  //deletes dilemma if it already exists
  if (this.dilemmas.hasOwnProperty(group)) {
    delete this.dilemmas[group];
  }
  this.dilemmas[group] = dilemma;
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
};
function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

Data.prototype.addGroupSituations = function (group, groupsituations) {

  if (this.groupSituations.hasOwnProperty(group)) {
    for (var key in groupsituations) {
      this.groupSituations[group].push(groupsituations[key]);
    }
  }
  else {
    this.groupSituations[group] = groupsituations;
  }
};

Data.prototype.addGroupRisks = function (group, grouprisks) {

  if (this.groupRisks.hasOwnProperty(group)) {
    for (var key in grouprisks) {
      this.groupRisks[group].push(grouprisks[key]);
    }
  }
  else {
    this.groupRisks[group] = grouprisks;
  }
};

Data.prototype.addGroupPoss = function (group, groupposs) {

  if (this.groupPoss.hasOwnProperty(group)) {
    for (var key in groupposs) {
      this.groupPoss[group].push(groupposs[key]);
    }
  }
  else {
    this.groupPoss[group] = groupposs;
  }
};


var data = new Data();

var server = app.listen(app.get('port'), function () {
  console.log('Server listening on port ' + app.get('port'));
});

var io = socket(server)
const studentsio = io.of('/students');
var groupconnection = [];

//namespace specific to students
var studentconnection = studentsio.on('connection', socket => {
  console.log("studentNamespace with socketID: " + socket.id + " connected");
  socket.emit('connectionmessage', "student connected on namespace students");

  socket.on('wantsession', function () {
    socket.emit('activeSessionsNames', data.activeSessionsNames);
  });
  //listen for when students log in
  socket.on('loggedIn', function (info) {
    console.log("student with socketID: " + socket.id + " logged in to the workshop");
    //add student to global namespace
    data.addStudent(info.username, socket.id, info.session);
    console.log("active sessions now just logged in " + JSON.stringify(data.activeSessions));

    //checks if student username already exists in a group(student has already been logged in)
    if (data.activeSessions[info.session].groups != []) {
      for (var i = 0; i < data.activeSessions[info.session].groups.length; i++) {
        for (var n = 0; n < data.activeSessions[info.session].groups[i].students.length; n++) {
          var studentname = data.activeSessions[info.session].groups[i].students[n].studentname;
          var id = data.activeSessions[info.session].groups[i].students[n].id;
          if (studentname == info.username && id == null) {
            console.log("students in server data atm " + JSON.stringify(data.activeSessions[info.session].groups));
            //put student in the same group as it disconnected from
            data.activeSessions[info.session].groups[i].students[n].id = socket.id;
            studentsio.to(socket.id).emit('namespace', data.activeSessions[info.session].groups[i].name);
            //ask the other students where they are
            socket.emit('wantcurrentlocation');
            //send student to same page as them
            socket.on('currentlocation', function (location) {
              studentsio.to(socket.id).emit('redirect', location);
            });
            //also send the group dilemma if such exists
            //TODO: fix this part for the sessions
            if (data.dilemmas[data.groupObj[i].name] != undefined) {
              studentsio.to(socket.id).emit('showdilemmareconnect', data.dilemmas[data.groupObj[i].name]);
              console.log("Emitting dilemma:" + data.dilemmas[data.groupObj[i].name]);
            }
          }
        }
      }
    }
    //notify teacher that a student has logged in
    teacherconnection.emit("StudentLoggedIn", {username: info.username, session: info.session});
  });
  //listening for Student to want to display the inital dilemma thoughts
  socket.on('initialThoughtsStudent', function (message) {
    console.log(message);
    socket.emit('displayInitialThoughts', data.thoughts);
  });

  socket.on('disconnect', function () {
    console.log("studentnamespace with socketID: " + socket.id + " disconnected");
    data.removeStudent(socket.id);
    var studentconnections = Array.from(Object.keys(studentconnection.connected));
  });

  /** 
    Relevant to exercise 2: heteronomy autonomy  
  **/
  socket.on('thoughts', function (thoughts) {

    for (var i = 0, l = thoughts.length; i < l; i++) {
      data.addThought(thoughts[i]);
    }
    teacherconnection.emit('displayThoughts', data.thoughts);
  });

  socket.on('studentvote', function (obj) {
    //sending to all students except sender
    socket.broadcast.emit('vote', obj);
    //and also to teacher
    teacherconnection.emit('vote', obj);
  });

});

var teacherconnection = io.on('connection', function (socket) {
  socket.on('teachergeneratesession', function (session) {
    data.setSession(session);
    data.addActiveSession(session);
    studentconnection.emit('activeSessionsNames', data.activeSessionsNames);
  });
  console.log("client with socketID:  " + socket.id + " connected");
 
  //To display sessions on the teacherpage
  socket.on('wantallsessions', function() {
    console.log("data. ", data.activeSessionsNames);
    socket.emit('allsessions', data.activeSessionsNames);
  });

  //listering for teacher want to clear all workshopinput from server
  socket.on('clearallinput', function () {
    console.log("input deleted");
    data.resetInputdata();
  });
  socket.on('disconnect', function () {
    console.log("client with socketID: " + socket.id + " disconnected");
    var allclientconnections = Array.from(Object.keys(teacherconnection.connected));
  });

  /**Relevent for teacher to route students to different pages(components)**/

  socket.on('navigateStudentsToComp', function (component) {
    //route students to component
    studentconnection.emit('redirectcomponent', component)
  });
  /**End of teacher route student**/

  /** 
    Relevant to exercise 1: Provocative
  **/

  socket.on('wantsituations', function (session) {
    var allsituations = [];
    for (var i in data.groupNames) {
      if (data.groupSituations[data.groupNames[i]] != null) {
        console.log("collecting situations from " + data.groupNames[i]);
        allsituations = allsituations.concat(data.groupSituations[data.groupNames[i]]);
      }
    }
    console.log("all situations" + JSON.stringify(allsituations));
    io.emit('collectsituations', allsituations);
  });

  socket.on('wantrisks', function () {
    var allrisks = [];
    for (var i in data.groupNames) {
      if (data.groupRisks[data.groupNames[i]] != null) {
        console.log("collecting risks from " + data.groupNames[i]);
        allrisks = allrisks.concat(data.groupRisks[data.groupNames[i]]);
      }
    }
    allrisks = data.generatedRisks.concat(allrisks);
    io.emit('collectrisks', allrisks);
  });

  socket.on('wantposs', function () {
    var allposs = [];
    for (var i in data.groupNames) {
      if (data.groupPoss[data.groupNames[i]] != null) {
        console.log("collecting risks from " + data.groupNames[i]);
        allposs = allposs.concat(data.groupPoss[data.groupNames[i]]);
      }
    }
    allposs = data.generatedPoss.concat(allposs);
    io.emit('collectposs', allposs);
  });

  /**
    Relevant to exercise 2**/
  //listening for teacher to want to display the inital dilemma thoughts
  socket.on('initialThoughts', function (message) {
    console.log(message);
    socket.emit('displayInitialThoughts', data.thoughts);
  });

  /**
    * Teacher generating groups depending on size of connected students
    **/

  socket.on('generateGroups', function (info) {
    generateGroups(info.groupSize, info.session);
      //sending groupname,size and ids to teacherpage to print
    socket.emit('groupInfo', { 'groupObject': data.activeSessions[info.session].groups });

    //namespace specific to groups
    var i;
    var len;
    for (i = 0, len = data.groupNames.length; i < len; i++) {
      io.of(data.groupNames[i]).on('connection', groupsmessages(i));
    }(i);
  });

});

function generateGroups(groupSize, session) {
  data.setNumGroups(groupSize, session);

  //create namespace for each group
  for (var i = 0, len = data.activeSessions[session].groupNum; i < len; i++) {
    var group = '/group' + i.toString();
    data.addGroupName(group, session);
    //groupobj to print to teacher
    data.addGroupObj(group, session);
  }

  var allstudents = data.activeSessions[session].students;
  var g = 0;
  var currentGroup = data.activeSessions[session].groupNames[g];
  var count = 0;
  var len = allstudents.length;
  //var len = Array.from(Object.keys(studentsio.connected)).length;
  //send a random group to each connected student
  //uneven nr of students or uneven number of groups
  if (len % groupSize == 1) {
    //put student in group
    var index = Math.floor(getRandomArbitrary(0, allstudents.length));
    data.addStudentToGroupObj(allstudents[index], currentGroup, session);
    studentconnection.to(allstudents[index].id).emit('namespace', currentGroup);
    //delete used student
    allstudents.splice(index, 1);
    len = len - 1;
  }
  for (var i = 0; i < len; i++) {
    if (count < groupSize) {
      var index = Math.floor(getRandomArbitrary(0, allstudents.length));
      data.addStudentToGroupObj(allstudents[index], currentGroup, session);
      studentconnection.to(allstudents[index].id).emit('namespace', currentGroup);
      //delete used student
      allstudents.splice(index, 1);
      count = count + 1;
    }
    else {
      g = g + 1;
      currentGroup = data.activeSessions[session].groupNames[g];
      count = 0;
      i = i - 1;
    }
  }
}


function groupsmessages(index) {
  return function (socket) {
    //listening for studens disconnecting from gropus
    socket.on('disconnect', function () {
      console.log("Student with socketID: " + socket.id + " disconnected" + " from group" + data.groupNames[index]);
    });

    console.log("A student joined a group " + data.groupNames[index]);
    console.log("active sessions now" + JSON.stringify(data.activeSessions));
    
    socket.on('dilemma', function (info) {
      data.addDilemma(data.groupNames[index], info.dilemma);
      io.of(data.groupNames[index]).emit('showdilemma', info)
    });
    socket.on('edit', function (info) {
      io.of(data.groupNames[index]).emit('editdilemma', info)
    });
    //collecting reflexthoughts
    socket.on('reflexthoughts', function (thoughts) {
      data.addReflexThoughts(data.groupNames[index], thoughts);
      //sending reflexthoughts within each group
      io.of(data.groupNames[index]).emit('showreflexthoughts', data.reflexthoughts[data.groupNames[index]]);
    });
    //collecting principles
    socket.on('principles', function (principles) {
      data.addPrinciples(data.groupNames[index], principles);
      //sending principles within each group
      io.of(data.groupNames[index]).emit('showprinciples', data.principles[data.groupNames[index]]);
    });
    //collecting concreteValues
    socket.on('concretevalues', function (concreteValues) {
      data.addConcreteValues(data.groupNames[index], concreteValues);
      //sending concretevalues within each group
      io.of(data.groupNames[index]).emit('showconcretevalues', data.concreteValues[data.groupNames[index]]);
    });
    //collecting action alternatives
    socket.on('actionalternatives', function (actionAlternatives) {
      data.addActionAlternatives(data.groupNames[index], actionAlternatives);
      //sending action alternatives within each group
      io.of(data.groupNames[index]).emit('showactionalternatives', data.actionAlternatives[data.groupNames[index]]);
    });
    //collecting situations for each group
    socket.on('groupsituations', function (situations) {
      data.addGroupSituations(data.groupNames[index], situations);
      //sending situations within each group
      io.of(data.groupNames[index]).emit('showgroupsituations', data.groupSituations[data.groupNames[index]]);
    });

    //updating server data if students removes a situation input and notify group
    socket.on('removesituation', function (id) {
      data.groupSituations[data.groupNames[index]].splice(id, 1);
      io.of(data.groupNames[index]).emit('showgroupsituations', data.groupSituations[data.groupNames[index]]);
    });

    //collecting risks for each group
    socket.on('grouprisks', function (risks) {
      data.addGroupRisks(data.groupNames[index], risks);
      //sending risks within each group
      io.of(data.groupNames[index]).emit('showgrouprisks', data.groupRisks[data.groupNames[index]]);
    });

    //updating server data if students removes a risk input and notify group
    socket.on('removerisk', function (id) {
      data.groupRisks[data.groupNames[index]].splice(id, 1);
      io.of(data.groupNames[index]).emit('showgrouprisks', data.groupRisks[data.groupNames[index]]);
    });

    //collecting possibilies for each group
    socket.on('groupposs', function (poss) {
      data.addGroupPoss(data.groupNames[index], poss);
      //sending possibilies within each group
      io.of(data.groupNames[index]).emit('showgroupposs', data.groupPoss[data.groupNames[index]]);
    });


    //updating server data if students removes a possibiliey input and notify group
    socket.on('removeposs', function (id) {
      data.groupPoss[data.groupNames[index]].splice(id, 1);
      io.of(data.groupNames[index]).emit('showgroupposs', data.groupPoss[data.groupNames[index]]);
    });

    //sending summary to grooups
    socket.on('wantsummary', function () {
      //sending all groups input on summary page first shown within each group
      io.of(data.groupNames[index]).emit('summarydata',
        {
          'actionAlternatives': data.actionAlternatives[data.groupNames[index]],
          'concreteValues': data.concreteValues[data.groupNames[index]],
          'principles': data.principles[data.groupNames[index]],
          'reflexThoughts': data.reflexthoughts[data.groupNames[index]]
        });
    });
    //updating server data if students removes a summary input and notify group
    socket.on('removesummaryinput', function (info) {
      if (info.inputtype == "reflex") {
        data.reflexthoughts[data.groupNames[index]].splice(info.indx, 1);
        io.of(data.groupNames[index]).emit('showreflexthoughts', data.reflexthoughts[data.groupNames[index]]);
      }
      if (info.inputtype == "principle") {
        data.principles[data.groupNames[index]].splice(info.indx, 1);
        io.of(data.groupNames[index]).emit('showprinciples', data.principles[data.groupNames[index]]);
      }
      if (info.inputtype == "concretevalue") {
        data.concreteValues[data.groupNames[index]].splice(info.indx, 1);
        io.of(data.groupNames[index]).emit('showconcretevalues', data.concreteValues[data.groupNames[index]]);
      }
      if (info.inputtype == "actionalternative") {
        data.actionAlternatives[data.groupNames[index]].splice(info.indx, 1);
        io.of(data.groupNames[index]).emit('showactionalternatives', data.actionAlternatives[data.groupNames[index]]);
      }
    });
    //listening for groups to submit their final analysis
    socket.on('submitanalysis', function () {
      io.emit('showanalysis', {
        //sending analysis to teacher
        'group': data.groupNames[index],
        'dilemma': data.dilemmas[data.groupNames[index]],
        'actionAlternatives': data.actionAlternatives[data.groupNames[index]],
        'concreteValues': data.concreteValues[data.groupNames[index]],
        'principles': data.principles[data.groupNames[index]],
        'reflexThoughts': data.reflexthoughts[data.groupNames[index]]
      });
      //notify group that analysis is submitted
      io.of(data.groupNames[index]).emit('analysissubmitted', 'The analysis is submitted');
    });
  }
};