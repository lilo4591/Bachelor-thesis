/*jslint node: true */
/* eslint-env node */
'use strict';

// Require express, socket.io, and vue
var express = require('express');
var app = express();
var http = require('http').Server(app);
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
  //generated arguments for love risks
  this.generatedRisks = [{ thought: 'You miss the chance of someone elses love' }, { thought: 'Love can cause mental illness' }];
  //generated arguments for war possibilies
  this.generatedPoss = [{ thought: 'War can liberate oppressed people' },
  { thought: 'War can build strong state capacity' },
  { thought: 'War defines the future of a civilization' },
  { thought: 'War can unite a nation' }];

  /**
   * Example
   * session: {groups: 
                    {group0: 'linn', input: {dilemma: '', reflexthoughts}},
                    {group1: 'username', input: {dilemma: '',...}} 
              thoughts }
  **/
  this.activeSessions = {};
  this.activeSessionsNames = [];
}
Data.prototype.addActiveSession = function (sessionId) {
  this.activeSessionsNames.push(sessionId);
  //TODO look up when students outside group should be empty or not
  this.activeSessions[sessionId] = { session: sessionId, groupNum: null, groups: [], groupNames: [], initialThoughts: [], voteObjects: [], students: [] };
};

Data.prototype.addVoteObj = function (voteobj, session) {
  this.activeSessions[session].voteObjects.push(voteobj);
}

Data.prototype.getVotes = function (session) {
  return this.activeSessions[session].voteObjects;
}

Data.prototype.resetInputdata = function (session) {

  for (var i in this.activeSessions[session].groups) {
    //exercise1 provocative
    this.activeSessions[session].groups[i].groupSituations = [];
    this.activeSessions[session].groups[i].groupRisks = [];
    this.activeSessions[session].groups[i].groupPoss = [];
    //exercise2 heteronomy autonomy
    this.activeSessions[session].thoughts = [];
    this.activeSessions[session].groups[i].groupDilemma = [];
    this.activeSessions[session].groups[i].groupReflexThoughts = [];
    this.activeSessions[session].groups[i].groupPrinciples = [];
    this.activeSessions[session].groups[i].groupConcreteValues = [];
    this.activeSessions[session].groups[i].groupActionAlternatives = [];
  }
}

Data.prototype.addStudent = function (username, socketid, session) {
  this.activeSessions[session].students.push({ studentname: username, id: socketid });
};

//deletes a student which has disconnected
Data.prototype.removeStudent = function (socketid) {
  var studentfound = false;
  var sessionfound;
  //delete the id from group but keep the name of the student
  for (let key in this.activeSessions) {
    for (var i in this.activeSessions[key].groups) {
      for (var n in this.activeSessions[key].groups[i].students) {
        if (this.activeSessions[key].groups[i].students[n].id == socketid) {
          this.activeSessions[key].groups[i].students[n].id = null;
          studentfound = true;
          sessionfound = key;
        }
      }
    }
  }
  //if the student has no group, delete the name of the student from server
  if (studentfound == false) {
    for (let sessionfound in this.activeSessions) {
      for (var i in this.activeSessions[sessionfound].students) {
        if (this.activeSessions[sessionfound].students[i].id == socketid) {
          this.activeSessions[sessionfound].students.splice(i, 1);
        }
      }
    }
  }
};

Data.prototype.addGroupName = function (group, session) {
  this.activeSessions[session].groupNames.push(group);
};

Data.prototype.addGroupObj = function (group, session) {
  var GROUP = {
    //Generall information
    name: null,
    noOfStudents: 0,
    students: [],
    //Exercise 1
    groupSituations: [],
    groupRisks: [],
    groupPoss: [],
    //Exercise 2
    groupDilemma: null,
    tempdilemma: null,
    dilemmasubmitted: false,
    analysissubmitted: false,
    groupReflexThoughts: [],
    groupPrinciples: [],
    groupConcreteValues: [],
    groupActionAlternatives: []
  };
  GROUP.name = group;
  this.activeSessions[session].groups.push(GROUP);
}

Data.prototype.addInitialThought = function (thought, session) {
  this.activeSessions[session].initialThoughts.unshift(thought);
}

Data.prototype.removeInitialThought = function (id, session) {
  this.activeSessions[session].initialThoughts.splice(id, 1);
}

Data.prototype.getGroupSituations = function (group, session) {
  for (var i in this.activeSessions[session].groups)
    if (this.activeSessions[session].groups[i].name == group) {
      return this.activeSessions[session].groups[i].groupSituations;
    }
}

//Removes input written by a student from their group 
Data.prototype.deleteGroupInput = function (group, session, id, type) {
  for (var i in this.activeSessions[session].groups)
    if (this.activeSessions[session].groups[i].name == group) {
      if (type == "reflex") {
        this.activeSessions[session].groups[i].groupReflexThoughts.splice(id, 1);
        return this.activeSessions[session].groups[i].groupReflexThoughts;
      }
      if (type == "principle") {
        this.activeSessions[session].groups[i].groupPrinciples.splice(id, 1);
        return this.activeSessions[session].groups[i].groupPrinciples;
      }
      if (type == "concretevalue") {
        this.activeSessions[session].groups[i].groupConcreteValues.splice(id, 1);
        return this.activeSessions[session].groups[i].groupConcreteValues;
      }
      if (type == "actionalternative") {
        this.activeSessions[session].groups[i].groupActionAlternatives.splice(id, 1);
        return this.activeSessions[session].groups[i].groupActionAlternatives;
      }
      if (type == "situation") {
        this.activeSessions[session].groups[i].groupSituations.splice(id, 1);
        return this.activeSessions[session].groups[i].groupSituations;
      }
      if (type == "risk") {
        this.activeSessions[session].groups[i].groupRisks.splice(id, 1);
        return this.activeSessions[session].groups[i].groupRisks;
      }
      if (type == "poss") {
        this.activeSessions[session].groups[i].groupPoss.splice(id, 1);
        return this.activeSessions[session].groups[i].groupPoss;
      }
    }
}

Data.prototype.getGroupRisks = function (group, session) {
  for (var i in this.activeSessions[session].groups)
    if (this.activeSessions[session].groups[i].name == group) {
      return this.activeSessions[session].groups[i].groupRisks;
    }
}

Data.prototype.getGroupPoss = function (group, session) {
  for (var i in this.activeSessions[session].groups)
    if (this.activeSessions[session].groups[i].name == group) {
      return this.activeSessions[session].groups[i].groupPoss;
    }
}

Data.prototype.getGroupDilemma = function (group, session) {
  for (var i in this.activeSessions[session].groups)
    if (this.activeSessions[session].groups[i].name == group) {
      return this.activeSessions[session].groups[i].groupDilemma;
    }
}

Data.prototype.getGroupReflexthoughts = function (group, session) {
  for (var i in this.activeSessions[session].groups)
    if (this.activeSessions[session].groups[i].name == group) {
      return this.activeSessions[session].groups[i].groupReflexThoughts;
    }
}

Data.prototype.getGroupPrinciples = function (group, session) {
  for (var i in this.activeSessions[session].groups)
    if (this.activeSessions[session].groups[i].name == group) {
      return this.activeSessions[session].groups[i].groupPrinciples;
    }
}

Data.prototype.getGroupConcreteValues = function (group, session) {
  for (var i in this.activeSessions[session].groups)
    if (this.activeSessions[session].groups[i].name == group) {
      return this.activeSessions[session].groups[i].groupConcreteValues;
    }
}

Data.prototype.getGroupActionAlternatives = function (group, session) {
  for (var i in this.activeSessions[session].groups)
    if (this.activeSessions[session].groups[i].name == group) {
      return this.activeSessions[session].groups[i].groupActionAlternatives;
    }
}

Data.prototype.addStudentToGroupObj = function (student, group, session) {
  for (var i in this.activeSessions[session].groups) {
    if (this.activeSessions[session].groups[i].name == group) {
      this.activeSessions[session].groups[i].noOfStudents += 1;
      this.activeSessions[session].groups[i].students.push(student);
    }
  }
}

//sets the number of groups to be created based on groupsize(number of students in eaxh group) and connected students
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

Data.prototype.addGroupDilemma = function (group, dilemma, session) {
  for (var i in this.activeSessions[session].groups) {
    if (this.activeSessions[session].groups[i].name == group) {
      this.activeSessions[session].groups[i].groupDilemma = dilemma;
    }
  }
};

Data.prototype.addGroupReflexThoughts = function (group, thoughts, session) {
  for (var i in this.activeSessions[session].groups) {
    if (this.activeSessions[session].groups[i].name == group) {
      for (var key in thoughts) {
        this.activeSessions[session].groups[i].groupReflexThoughts.unshift(thoughts[key]);
      }
    }
  }
};

Data.prototype.addGroupPrinciples = function (group, thoughts, session) {
  for (var i in this.activeSessions[session].groups) {
    if (this.activeSessions[session].groups[i].name == group) {
      for (var key in thoughts) {
        this.activeSessions[session].groups[i].groupPrinciples.unshift(thoughts[key]);
      }
    }
  }
};

Data.prototype.addGroupConcreteValues = function (group, thoughts, session) {
  for (var i in this.activeSessions[session].groups) {
    if (this.activeSessions[session].groups[i].name == group) {
      for (var key in thoughts) {
        this.activeSessions[session].groups[i].groupConcreteValues.unshift(thoughts[key]);
      }
    }
  }
};

Data.prototype.addGroupActionAlternatives = function (group, thoughts, session) {
  for (var i in this.activeSessions[session].groups) {
    if (this.activeSessions[session].groups[i].name == group) {
      for (var key in thoughts) {
        this.activeSessions[session].groups[i].groupActionAlternatives.unshift(thoughts[key]);
      }
    }
  }
};

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

Data.prototype.addGroupSituation = function (group, groupsituation, session) {
  for (var i in this.activeSessions[session].groups) {
    if (this.activeSessions[session].groups[i].name == group) {
      this.activeSessions[session].groups[i].groupSituations.unshift(groupsituation);
    }
  }
};

Data.prototype.addGroupRisk = function (group, grouprisk, session) {
  for (var i in this.activeSessions[session].groups) {
    if (this.activeSessions[session].groups[i].name == group) {
      this.activeSessions[session].groups[i].groupRisks.unshift(grouprisk);
    }
  }
};

Data.prototype.addGroupPoss = function (group, groupposs, session) {
  for (var i in this.activeSessions[session].groups) {
    if (this.activeSessions[session].groups[i].name == group) {
      this.activeSessions[session].groups[i].groupPoss.unshift(groupposs);
    }
  }
};

var data = new Data();

var server = app.listen(app.get('port'), function () {
  console.log('Server listening on port ' + app.get('port'));
});

var io = socket(server)
const studentsio = io.of('/students');

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

    //checks if student username already exists in a group(student has already been logged in)
    if (data.activeSessions[info.session].groups != []) {
      for (var i = 0; i < data.activeSessions[info.session].groups.length; i++) {
        for (var n = 0; n < data.activeSessions[info.session].groups[i].students.length; n++) {
          var studentname = data.activeSessions[info.session].groups[i].students[n].studentname;
          var id = data.activeSessions[info.session].groups[i].students[n].id;
          if (studentname == info.username && id == null) {
            //put student in the same group as it disconnected from
            data.activeSessions[info.session].groups[i].students[n].id = socket.id;
            studentsio.to(socket.id).emit('namespace', { 'session': info.session, 'group': data.activeSessions[info.session].groups[i].name });
            //ask the other students where they are
            socket.emit('wantcurrentlocation');
            //send student to same page as them
            socket.on('currentlocation', function (location) {
              studentsio.to(socket.id).emit('redirect', location);
            });
            //also send the group dilemma if such exists
            if (data.activeSessions[info.session].groups[i].groupDilemma != null) {
              studentsio.to(socket.id).emit('showdilemmareconnect', data.activeSessions[info.session].groups[i].groupDilemma);
            }
          }
        }
      }
    }
    //notify teacher that a student has logged in
    teacherconnection.emit("StudentLoggedIn", { username: info.username, session: info.session });
  });

  //listening for Student to want to display the inital dilemma thoughts
  socket.on('initialThoughtsStudent', function (session) {
    socket.emit('displayInitialThoughts', { 'session': session, 'thoughts': data.activeSessions[session].initialThoughts });
  });

  socket.on('disconnect', function () {
    console.log("studentnamespace with socketID: " + socket.id + " disconnected");
    data.removeStudent(socket.id);
    var studentconnections = Array.from(Object.keys(studentconnection.connected));
  });

  /** 
    Relevant to exercise 2: heteronomy autonomy  
  **/
  socket.on('thought', function (info) {
    data.addInitialThought(info.thought, info.session);
    teacherconnection.emit('displayThoughts', { 'session': info.session, 'thoughts': data.activeSessions[info.session].initialThoughts });
    studentconnection.emit('displayThoughts', { 'session': info.session, 'thoughts': data.activeSessions[info.session].initialThoughts });
  });

  socket.on('removeinitialthought', function (info) {
    data.removeInitialThought(info.id, info.session);
    teacherconnection.emit('displayThoughts', { 'session': info.session, 'thoughts': data.activeSessions[info.session].initialThoughts });
    studentconnection.emit('displayThoughts', { 'session': info.session, 'thoughts': data.activeSessions[info.session].initialThoughts });
  });

  socket.on('wantInitialThoughts', function (session) {
    studentconnection.emit('displayThoughts', { 'session': session, 'thoughts': data.activeSessions[session].initialThoughts });
  });

  socket.on('studentvote', function (obj) {
    //sending to all students except sender
    data.addVoteObj(obj, obj.session);
    socket.broadcast.emit('vote', obj);
    //and also to teacher
    teacherconnection.emit('vote', obj);
  });

  socket.on('studentwantvotes', function (session) {
    var votes = data.getVotes(session);
    console.log("student want votes: " + JSON.stringify(votes));
    socket.emit('studentshowvotes', { 'votes': votes, 'session': session });
  });

});

const teacherio = io.of('/teacher');
var teacherconnection = teacherio.on('connection', function (socket) {
  socket.on('teachergeneratesession', function (session) {
    data.addActiveSession(session);
    studentconnection.emit('activeSessionsNames', data.activeSessionsNames);
  });
  console.log("teacher with socketID:  " + socket.id + " connected");

  //To display sessions on the teacherpage
  socket.on('wantallsessions', function () {
    socket.emit('allsessions', data.activeSessionsNames);
  });

  //if teacher restarts a session it wants the groups from that session
  socket.on('wantgroups', function (session) {
    if (data.activeSessions[session].groupNames.length != 0) {
      socket.emit('sendgroups', { 'groups': data.activeSessions[session].groups, 'session': session });
    }
  });

  socket.on('wantstudents', function (session) {
    if (data.activeSessions[session].students.length != 0) {
      socket.emit('sendstudents', { 'students': data.activeSessions[session].students, 'session': session });
    }
  });

  //listering for teacher want to clear all workshopinput from server
  socket.on('clearallinput', function (session) {
    data.resetInputdata(session);
  });

  socket.on('disconnect', function () {
    console.log("client with socketID: " + socket.id + " disconnected");
    var allclientconnections = Array.from(Object.keys(teacherconnection.connected));
  });

  //deletes all sessions on 
  socket.on('resetsessions', function () {
    resetSessions();
  });

  //Relevent for teacher to route students to different pages(components)
  socket.on('navigateStudentsToComp', function (info) {
    //route students to component
    //TODO emit only to info.session groups
    studentconnection.emit('redirectcomponent', info)
  });

  /** 
    Relevant to exercise 1: Provocative
  **/
  socket.on('wantsituations', function (session) {
    var allsituations = [];
    for (var i in data.activeSessions[session].groups) {
      allsituations = allsituations.concat(data.activeSessions[session].groups[i].groupSituations);
    }
    socket.emit('collectsituations', { 'situations': allsituations, 'session': session });
  });

  socket.on('wantrisks', function (session) {
    var allrisks = [];
    for (var i in data.activeSessions[session].groups) {
      allrisks = allrisks.concat(data.activeSessions[session].groups[i].groupRisks);
    }
    allrisks = data.generatedRisks.concat(allrisks);
    socket.emit('collectrisks', { 'risks': allrisks, 'session': session });
  });
  //TODO make this one function
  socket.on('wantposs', function (session) {
    var allposs = [];
    for (var i in data.activeSessions[session].groups) {
      allposs = allposs.concat(data.activeSessions[session].groups[i].groupPoss);
    }
    allposs = data.generatedPoss.concat(allposs);
    socket.emit('collectposs', { 'poss': allposs, 'session': session });
  });

  /**
    Relevant to exercise 2
  **/
  //listening for teacher to want to display the inital dilemma thoughts
  socket.on('initialThoughts', function (session) {
    socket.emit('displayInitialThoughts', { 'thoughts': data.activeSessions[session].initialThoughts, 'session': session });
  });

  //send votes already sent to server by students before teacher reaches votepage
  socket.on('wantvotes', function (session) {
    var votes = data.getVotes(session);
    socket.emit('showvotes', { 'votes': votes, 'session': session });
  });
  /**
   * Teacher generating groups depending on number of connected students
   **/
  socket.on('generateGroups', function (info) {
    var groupnames = data.activeSessions[info.session].groupNames;
    // check if there already are groups
    if (groupnames.length != 0) {
      resetGroups(groupnames, info.session);
    }
    generateGroups(info.groupSize, info.session, socket);

    //namespace specific to groups
    var i;
    var len;
    for (i = 0, len = data.activeSessions[info.session].groupNames.length; i < len; i++) {
      io.of(data.activeSessions[info.session].groupNames[i]).on('connection', groupsmessages(i, info.session));
    } (i);
  });
});

function generateGroups(groupSize, session) {
  data.setNumGroups(groupSize, session);
  //create namespace for each group
  for (var i = 0, len = data.activeSessions[session].groupNum; i < len; i++) {
    var group = '/' + session.toString() + 'group' + i.toString();
    data.addGroupName(group, session);
    //groupobj to print to teacher
    data.addGroupObj(group, session);
  }

  var allstudents = data.activeSessions[session].students.slice();
  var g = 0;
  var currentGroup = data.activeSessions[session].groupNames[g];
  var count = 0;
  var len = allstudents.length;
  //send a random group to each connected student
  //uneven nr of students or uneven number of groups
  if (len % groupSize == 1) {
    //put student in group
    var index = Math.floor(getRandomArbitrary(0, allstudents.length));
    data.addStudentToGroupObj(allstudents[index], currentGroup, session);
    //route student to startpage just in case there are somewhere else
    studentconnection.to(allstudents[index].id).emit('redirectcomponent', { 'session': session, 'comp': 'start' });
    //send group to student
    studentconnection.to(allstudents[index].id).emit('namespace', { 'session': session, 'group': currentGroup });
    //delete used student
    allstudents.splice(index, 1);
    len = len - 1;
  }
  for (var i = 0; i < len; i++) {
    if (count < groupSize) {
      var index = Math.floor(getRandomArbitrary(0, allstudents.length));
      data.addStudentToGroupObj(allstudents[index], currentGroup, session);
      //route student to startpage just in case there are somewhere else
      studentconnection.to(allstudents[index].id).emit('redirectcomponent', { 'session': session, 'comp': 'start' });
      //send group to student
      studentconnection.to(allstudents[index].id).emit('namespace', { 'session': session, 'group': currentGroup });
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
  teacherconnection.emit('groupInfo', { 'session': session, 'groupObject': data.activeSessions[session].groups });
}

function resetGroups(groupnames, session) {
  //disconnect the students from the groups groups
  for (var i in groupnames) {
    const namespace = io.of(groupnames[i]);
    const connectedstudents = Object.keys(namespace.connected);
    connectedstudents.forEach(socketId => {
    namespace.connected[socketId].disconnect();
    });
    namespace.removeAllListeners();
    delete io.nsps[groupnames[i]];
  }
  //delete the groups of the session object
  data.activeSessions[session].groups = [];
  data.activeSessions[session].groupNames = [];
}

function resetSessions() {
  var sessions = data.activeSessionsNames;
  for (var s in sessions) {
    var session = data.activeSessions[data.activeSessionsNames[s]];
    var groupnames = session.groupNames;
    studentconnection.emit('redirectcomponent', { 'session': data.activeSessionsNames[s], 'comp': 'login' });
    studentconnection.emit('studentresetsessions', data.activeSessionsNames[s]);
    resetGroups(groupnames, data.activeSessionsNames[s]);
  }
  data.activeSessions = {};
  data.activeSessionsNames = [];
}

function groupsmessages(index, session) {
  return function (socket) {
    //listening for studens disconnecting from gropus
    socket.on('disconnect', function () {
      if (data.activeSessions[session] != undefined) {
        console.log("Student with socketID: " + socket.id + " disconnected from group: " + data.activeSessions[session].groupNames[index]);
      }
    });

    console.log("A student joined a group " + data.activeSessions[session].groupNames[index]);
    //update groupmembers on dilemma on keyup
    socket.on('dilemmakeyup', function (info) {
      data.activeSessions[info.session].groups[index].tempdilemma = info.dilemma;
      io.of(data.activeSessions[info.session].groupNames[index]).emit('dilemmakeyup', info);
    });

    socket.on('wantdilemma', function (session) {
      var tempdilemma = data.activeSessions[session].groups[index].tempdilemma;
      //if one student has started editing dilemma and another comes to that page at a later step in time
      io.of(data.activeSessions[session].groupNames[index]).emit('dilemmakeyup', { 'session': session, 'dilemma': tempdilemma });
      //makes sure that if other student has submitted dilemma inital page load will show that to the others students in that group
      if (data.activeSessions[session].groups[index].dilemmasubmitted == true) {
        io.of(data.activeSessions[session].groupNames[index]).emit('showdilemma', { 'dilemma': tempdilemma, 'notsubmitted': false, 'session': session });
      }
    });

    socket.on('dilemma', function (info) {
      data.activeSessions[info.session].groups[index].dilemmasubmitted = true;
      data.addGroupDilemma(data.activeSessions[info.session].groupNames[index], info.dilemma, info.session);
      io.of(data.activeSessions[info.session].groupNames[index]).emit('showdilemma', info);
    });

    socket.on('edit', function (info) {
      data.activeSessions[info.session].groups[index].dilemmasubmitted = false;
      io.of(data.activeSessions[info.session].groupNames[index]).emit('editdilemma', info);
    });

    //collecting reflexthoughts
    socket.on('reflexthoughts', function (info) {
      data.addGroupReflexThoughts(data.activeSessions[info.session].groupNames[index], info.thoughts, info.session);
      //get reflex thoughts here
      var reflexthoughts = data.getGroupReflexthoughts(data.activeSessions[info.session].groupNames[index], info.session);
      //sending reflexthoughts within each group
      io.of(data.activeSessions[info.session].groupNames[index]).emit('showgroupreflexthoughts', reflexthoughts);
    });

    //collecting principles
    socket.on('principles', function (info) {
      data.addGroupPrinciples(data.activeSessions[info.session].groupNames[index], info.principles, info.session);
      //get group principles
      var principles = data.getGroupPrinciples(data.activeSessions[info.session].groupNames[index], info.session);
      //sending principles within each group
      io.of(data.activeSessions[info.session].groupNames[index]).emit('showgroupprinciples', principles);
    });

    //collecting concreteValues
    socket.on('concretevalues', function (info) {
      data.addGroupConcreteValues(data.activeSessions[info.session].groupNames[index], info.concretevalues, info.session);
      var concretevalues = data.getGroupConcreteValues(data.activeSessions[info.session].groupNames[index], info.session);
      //sending concretevalues within each group
      io.of(data.activeSessions[info.session].groupNames[index]).emit('showgroupconcretevalues', concretevalues);
    });

    //collecting action alternatives
    socket.on('actionalternatives', function (info) {
      data.addGroupActionAlternatives(data.activeSessions[info.session].groupNames[index], info.actionalternatives, info.session);
      var actionalternatives = data.getGroupActionAlternatives(data.activeSessions[info.session].groupNames[index], info.session);
      //sending action alternatives within each group
      io.of(data.activeSessions[info.session].groupNames[index]).emit('showgroupactionalternatives', actionalternatives);
    });

    ///exercise 1
    //collecting situations for each group
    socket.on('groupsituations', function (info) {
      data.addGroupSituation(data.activeSessions[info.session].groupNames[index], info.situation, info.session);
      //sending situations within each group
      var groupsitu = data.getGroupSituations(data.activeSessions[info.session].groupNames[index], info.session);
      io.of(data.activeSessions[info.session].groupNames[index]).emit('showgroupsituations', { situations: groupsitu, session: info.session });
    });

    socket.on('wantgroupsituations', function (session) {
      var groupsitu = data.getGroupSituations(data.activeSessions[session].groupNames[index], session);
      io.of(data.activeSessions[session].groupNames[index]).emit('showgroupsituations', { 'situations': groupsitu, 'session': session });
    });

    //updating server data if students removes a situation input and notify group
    socket.on('removesituation', function (info) {
      var groupsitu = data.deleteGroupInput(data.activeSessions[info.session].groupNames[index], info.session, info.id, "situation");
      io.of(data.activeSessions[info.session].groupNames[index]).emit('showgroupsituations', { 'session': info.session, 'situations': groupsitu });
    });

    //collecting risks for each group
    socket.on('grouprisks', function (info) {
      data.addGroupRisk(data.activeSessions[info.session].groupNames[index], info.risks, info.session);
      var groupRisks = data.getGroupRisks(data.activeSessions[info.session].groupNames[index], info.session);
      //sending risks within each group
      io.of(data.activeSessions[info.session].groupNames[index]).emit('showgrouprisks', { 'session': info.session, 'risks': groupRisks });
    });

    socket.on('wantgrouprisks', function (session) {
      var grouprisk = data.getGroupRisks(data.activeSessions[session].groupNames[index], session);
      io.of(data.activeSessions[session].groupNames[index]).emit('showgrouprisks', { 'risks': grouprisk, 'session': session });
    });

    //updating server data if students removes a risk input and notify group
    socket.on('removerisk', function (info) {
      var groupRisks = data.deleteGroupInput(data.activeSessions[info.session].groupNames[index], info.session, info.id, "risk");
      //data.groupRisks[data.groupNames[index]].splice(id, 1);
      io.of(data.activeSessions[info.session].groupNames[index]).emit('showgrouprisks', { 'session': info.session, 'risks': groupRisks });
    });

    //collecting possibilies for each group
    socket.on('groupposs', function (info) {
      data.addGroupPoss(data.activeSessions[info.session].groupNames[index], info.poss, info.session);
      var groupPoss = data.getGroupPoss(data.activeSessions[info.session].groupNames[index], info.session);
      //sending possibilies within each group
      io.of(data.activeSessions[info.session].groupNames[index]).emit('showgroupposs', { 'session': info.session, 'poss': groupPoss });
    });

    socket.on('wantgroupposs', function (session) {
      var groupposs = data.getGroupPoss(data.activeSessions[session].groupNames[index], session);
      io.of(data.activeSessions[session].groupNames[index]).emit('showgroupposs', { 'poss': groupposs, 'session': session });
    });

    //updating server data if students removes a possibiliey input and notify group
    socket.on('removeposs', function (info) {
      var groupPoss = data.deleteGroupInput(data.activeSessions[info.session].groupNames[index], info.session, info.id, "poss");
      io.of(data.activeSessions[info.session].groupNames[index]).emit('showgroupposs', { 'session': info.session, 'poss': groupPoss });
    });
    //end of exercise 1

    socket.on('wantgroupreflex', function (session) {
      var groupreflex = data.getGroupReflexthoughts(data.activeSessions[session].groupNames[index], session);
      io.of(data.activeSessions[session].groupNames[index]).emit('showgroupreflexthoughts', groupreflex);
    });

    socket.on('wantgroupprinciples', function (session) {
      var groupprin = data.getGroupPrinciples(data.activeSessions[session].groupNames[index], session);
      io.of(data.activeSessions[session].groupNames[index]).emit('showgroupprinciples', groupprin);
    });

    socket.on('wantgroupconcretevalues', function (session) {
      var groupcon = data.getGroupConcreteValues(data.activeSessions[session].groupNames[index], session);
      io.of(data.activeSessions[session].groupNames[index]).emit('showgroupconcretevalues', groupcon);
    });

    socket.on('wantgroupactionalternatives', function (session) {
      var groupact = data.getGroupActionAlternatives(data.activeSessions[session].groupNames[index], session);
      io.of(data.activeSessions[session].groupNames[index]).emit('showgroupactionalternatives', groupact);
    });

    socket.on('wantissummarysubmitted', function (session) {
      var submitted = data.activeSessions[session].groups[index].analysissubmitted;
      io.of(data.activeSessions[session].groupNames[index]).emit('issummarysubmitted', { 'session': session, 'submitted': submitted });
    });
    
    //sending summary to grooups
    socket.on('wantsummary', function (info) {
      //sending all groups input on summary page first shown within each group
      io.of(data.activeSessions[info.session].groupNames[index]).emit('summarydata',
        {
          'actionAlternatives': data.getGroupActionAlternatives(data.activeSessions[info.session].groupNames[index], info.session),
          'concreteValues': data.getGroupConcreteValues(data.activeSessions[info.session].groupNames[index], info.session),
          'principles': data.getGroupPrinciples(data.activeSessions[info.session].groupNames[index], info.session),
          'reflexThoughts': data.getGroupReflexthoughts(data.activeSessions[info.session].groupNames[index], info.session)
        });
    });
    
    //updating server data if students removes a summary input and notify group
    socket.on('removesummaryinput', function (info) {

      var group = data.activeSessions[info.session].groupNames[index];
      var thoughts = data.deleteGroupInput(group, info.session, info.indx, info.inputtype);

      if (info.inputtype == "reflex") {
        io.of(group).emit('showgroupreflexthoughts', thoughts);
      }
      if (info.inputtype == "principle") {
        io.of(group).emit('showgroupprinciples', thoughts);
      }
      if (info.inputtype == "concretevalue") {
        io.of(group).emit('showgroupconcretevalues', thoughts);
      }
      if (info.inputtype == "actionalternative") {
        io.of(group).emit('showgroupactionalternatives', thoughts);
      }
    });

    //listening for groups to submit their final analysis
    socket.on('submitanalysis', function (session) {
      data.activeSessions[session].groups[index].analysissubmitted = true;
      var groupname = data.activeSessions[session].groupNames[index];
      teacherconnection.emit('showanalysis', {
        //sending analysis to teacher
        'session': session,
        'group': groupname,
        'dilemma': data.getGroupDilemma(groupname, session),
        'actionAlternatives': data.getGroupActionAlternatives(groupname, session),
        'concreteValues': data.getGroupConcreteValues(groupname, session),
        'principles': data.getGroupPrinciples(groupname, session),
        'reflexThoughts': data.getGroupReflexthoughts(groupname, session)
      });
      //notify group that analysis is submitted
      io.of(groupname).emit('analysissubmitted', 'The analysis is submitted');
    });
  }
};