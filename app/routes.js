module.exports = function(app, passport, db) {

  // video chatroom
  app.get('/videoChat/:room', (req, res) => {
    console.log('videochat', req.params.room)
    res.render('videoRoom', {
      roomId: req.params.room
    })
  })


  // assessment Page gets rendered
  app.get('/assessment', isLoggedIn, function(req, res) {
    res.render('assessment.ejs', {
      user: req.user,
      // userProfile: req.userProfile
      areServicesNeeded: Boolean(req.found)
    })
  })

  // assessment Page gets rendered
  app.get('/right-sidebar', isLoggedIn, function(req, res) {
    res.render('right-sidebar.ejs', {
      user: req.user,
      // userProfile: req.userProfile
      areServicesNeeded: Boolean(req.found)
    })
  })

  app.get('/left-sidebar', isLoggedIn, function(req, res) {
    res.render('left-sidebar.ejs', {
      user: req.user,
      // userProfile: req.userProfile
      areServicesNeeded: Boolean(req.found)
    })
  })


  





  // next is a value and a function that tells it when its done
  // middleware created
  function servicesNeeded(req, res, next) {
    db.collection('userProfile').findOne({
      email: req.user.local.email
    }, (err, userProfile) => {
      if (err) return console.log(err)
      let languages = userProfile.languages.filter(element => element.teachOrLearn ==
        "teach").map(element => element.language)
      console.log('languages I teach', languages)
      if (!languages) {
        languages = []
      }
      // inside find() we need a filter to find a teacher
      // get an array of all the languages user teaches
      // use that array with mongo DB $in to find the requests
      //of students who want to lean that langauge
      // finds students
      // pick first one and match wit that student
      db.collection('requests').find({
        status: "waiting",

        language: {
          $in: languages
        },
        fromUser: {
          $ne: userProfile.email
        }
      }).toArray((err, requests) => {
        console.log('chat requests', requests)
        let found = null
        if (!requests) {
          requests = []
        }
        // pick one of the requests
        // needs to be random later on
        if (requests.length != 0) {
          found = requests[0]
        }
        // for (let i = 0; i < userProfile.languages.length; i++) {
        //   if (userProfile.languages[i].teachOrLearn === "teach") {
        //     found = requests.find(request => request.language === userProfile.languages[i].language);
        //   }
        // }
        req.userProfile = userProfile
        req.requests = requests
        req.found = found
        console.log('we found a teacher', found)
        next()
      })
    });
  }


  // normal routes ===============================================================

  // show the home page (will also have our login links)


  // PROFILE SECTION =========================
  //     Create (POST) - Make match between users
  // url to access this information localhost:1000/pair/Spanish
  // create
  // app.post('/userProfile', isLoggedIn, function(req, res) {
  //   const profileObject = {
  //     email: req.body.email,
  //     userName: req.body.userName,
  //     proficiency: req.body.proficiency,
  //     language: req.body.language,
  //     learning: req.body.learning,
  //     images: req.body.image
  //   }
  //   db.collection('userProfile').insertOne(profileObject, (err, result) => {
  //     if (err) {
  //       res.redirect('request failed, try again')
  //     } else {
  //       res.redirect('profile.html')
  //     }
  //   })
  // });

  //
  // who speaks desired langugage gets chosen /read
  // get is reading
  app.get('/pair/:language', /*isLoggedIn,*/ function(req, res) {
    // console.log('language', req.params.language)
    db.collection('userProfile').find({
      languages: {
        $elemMatch: {
          language: req.params.language,
          teachOrLearn: "teach"
        }
      }
    }).toArray((err, result) => {
      // console.log('paired choices', result)
      const randomPair = Math.floor(Math.random() * result.length)
      if (err) return console.log(err)
      res.send(result[randomPair])
    })
  });


  // THIS PUTS LANGUAGE ON USER PROFILE
  app.post('/addLanguage', isLoggedIn, function(req, res) {
    console.log('addLanguage', req.body)
    const fluency = parseInt(req.body.country) + parseInt(req.body.teach) + parseInt(req.body.help)
    const languageObject = {
      language: req.body.language,
      teachOrLearn: req.body.teachOrLearn,
      fluency: fluency

    }
    db.collection('userProfile').findOneAndUpdate(
      //filter
      {
        email: req.user.local.email
      },
      //update
      {
        $push: {
          "languages": languageObject
        }
      }, (err, result) => {
        if (err) {
          console.log("addLanguage", err)
          res.redirect('/profile')
        } else {
          res.redirect('/profile')
        }
      })
  });

  // displaying people in need of specific services (ends by rendering the profile)
  //express knows to run servicesNeeded middleware -
  app.get('/profile', isLoggedIn, servicesNeeded, function(req, res) {
    db.collection('requests').find({
        fromUser: req.user.local.email
      }

    ).toArray((err, myRequests) => {
      res.render('profile.ejs', {
        user: req.user,
        userProfile: req.userProfile,
        requests: req.requests,
        found: req.found,
        myRequests: myRequests,
        // if req.found is a value services will be true, if null, false
        areServicesNeeded: Boolean(req.found)
      })
    })
  })






  app.get('/', function(req, res) {
    res.render('index.ejs', {

    })

  });

  // duplicate profile route
  // not sure what this does
  //   app.get('/profile', isLoggedIn, servicesNeeded, function(req, res) {
  //     console.log('teacher available', req)
  //     db.collection('messages').findOne({
  //       email: req.user.local.email
  //     }, (err, result) => {
  //       if (err) return console.log(err)
  //       // inside find() we need a filter to find messages addressed to a
  //       //specific user (whoever is logged in)
  //       db.collection('userProfile').find({
  //         picture: req.user.local.picture
  //
  //       }).toArray((err, messages) => {
  //         // not sure about my console.log below
  //         console.log('the displayed message is', req.user.local.message, messages)
  //         res.render('profile.ejs', {
  //           user: req.user,
  //           userProfile: result,
  //           picture: req.user.local.picture,
  //           areServicesNeeded: Boolean(req.found)
  //
  //         })
  //       })
  //     });
  //   })

  // upload profile picture ===========
  app.post('/picture', (req, res) => {
    if (req.files) {
      console.log(req.files)
      var file = req.files.file
      var fileName = decodeURIComponent(file.name)
      console.log(fileName)

      file.mv('uploads/' + fileName, function(err) {
        if (err) {
          res.send(err)
        } else {

          res.redirect('/profile')
        }
      })
      db.collection('userProfile').save({
        name: req.body.name,
        img: "/uploads/" + fileName
      }, (err, result) => {
        if (err) return console.log(err)
        console.log('saved to database')

      })
    }

  })




  // then figure out combining matching of two people (student and teacher ) and putting them in the same room
  // web rtc implementation
  // we need requests accepted by a teacher to lead to video Page

  // reading paired match
  // add event listeners so that when button is clicked, teacher is redirected to video chat room
  // student recieves an alert " A teacher is waiting for you. Go to your profile to accept"
  // on student profile page - they click and meet teacher in chat room

  app.get('/pair/:language', /*isLoggedIn,*/ function(req, res) {
    // console.log('language', req.params.language)
    db.collection('userProfile').find({
      languages: {
        $elemMatch: {
          language: req.params.language,
          teachOrLearn: "teach"
        }
      }
    }).toArray((err, result) => {
      // console.log('paired choices', result)
      const randomPair = Math.floor(Math.random() * result.length)
      if (err) return console.log(err)
      res.send(result[randomPair])
    })
  });




  // LOGOUT ==============================
  app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
  });

  // // message board routes ===============================================================
  //
  // app.post('/messages', (req, res) => {
  //   db.collection('messages').save({
  //     name: req.body.name,
  //     msg: req.body.msg,
  //     thumbUp: 0,
  //     thumbDown: 0
  //   }, (err, result) => {
  //     if (err) return console.log(err)
  //     console.log('saved to database')
  //     res.redirect('/profile')
  //   })
  // })
  //
  // app.put('/messages', (req, res) => {
  //   db.collection('messages')
  //     .findOneAndUpdate({
  //       name: req.body.name,
  //       msg: req.body.msg
  //     }, {
  //       $set: {
  //         thumbUp: req.body.thumbUp + 1
  //       }
  //     }, {
  //       sort: {
  //         _id: -1
  //       },
  //       upsert: true
  //     }, (err, result) => {
  //       if (err) return res.send(err)
  //       res.send(result)
  //     })
  // })
  //
  // app.put('/messages/down', (req, res) => {
  //   db.collection('messages')
  //     .findOneAndUpdate({
  //       name: req.body.name,
  //       msg: req.body.msg
  //     }, {
  //       $set: {
  //         thumbUp: req.body.thumbUp - 1
  //       }
  //     }, {
  //       sort: {
  //         _id: -1
  //       },
  //       upsert: true
  //     }, (err, result) => {
  //       if (err) return res.send(err)
  //       res.send(result)
  //     })
  // })

  // app.delete('/messages', (req, res) => {
  //   db.collection('messages').findOneAndDelete({
  //     name: req.body.name,
  //     msg: req.body.msg
  //   }, (err, result) => {
  //     if (err) return res.send(500, err)
  //     res.send('Message deleted!')
  //   })
  // })

  // =================================== PAIRING PPL TO VIDEO CHAT



  //needs to create video request in request collection on mongodb
  // needs to redirect user to a res.redirect to the video page
  // implement github code

  app.get('/pair', isLoggedIn, servicesNeeded, function(req, res) {
    const profileObject = {
      language: req.query.language,
      learning: req.query.learning
    }
    // people who made requests will wait until someone is available
    console.log("profile object", profileObject)
    db.collection('requests').insertOne({
      fromUser: req.user.local.email,
      time: new Date,
      language: req.query.learning,
      status: "waiting",
      toUser: null


      // },
      // (error, paired) => {
      // var possibleTeacher = []
      // for (el of result) {
      //   el.languages.forEach(lang => {
      //     if (lang.language === req.query.learning && lang.teachOrLearn === 'teach')
      //       possibleTeacher.push({
      //         user: el.email,
      //         fluency: lang.fluency
      //       });
      // });
      // }
      // console.log(possibleTeacher)
    }, (error, pairing) => {
      console.log('HELOOOOOOO', pairing)
      if (error) {
        res.redirect('request failed, try again')
      } else {
        res.redirect('/profile')
      }
      // if () ? //insert button here//  : "could not find a match"
    })
  });



  // =============================================================================
  // AUTHENTICATE (FIRST LOGIN) ==================================================
  // =============================================================================

  // locally --------------------------------
  // LOGIN ===============================
  // show the login form
  app.get('/login', function(req, res) {
    res.render('login.ejs', {
      message: req.flash('loginMessage')
    });
  });

  // process the login form
  app.post('/login', passport.authenticate('local-login', {
    successRedirect: '/profile', // redirect to the secure profile section
    failureRedirect: '/login', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }));

  // SIGNUP =================================
  // show the signup form
  app.get('/signup', function(req, res) {
    res.render('signup.ejs', {
      message: req.flash('signupMessage')
    });
  });

  // process the signup form
  app.post('/signup', passport.authenticate('local-signup', {
    // COMMENTED OUT to allow the function below to run after passport creates a user
    // successRedirect: '/profile', // redirect to the secure profile section
    failureRedirect: '/login', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }), function signupCallback(req, res, err) {
    console.log("signup callback, user:", req.user, err);
    db.collection('userProfile').save({
      email: req.body.email,
      userId: req.user._id,
      languages: []
    }, (err, result) => {
      if (err) return console.log(err)
      console.log('saved to database userProfile')
      res.redirect('/profile')
    })
  });
  // app.post('/signup', passport.authenticate('local-signup', {
  //   successRedirect: '/profile', // redirect to the secure profile section
  //   failureRedirect: '/signup', // redirect back to the signup page if there is an error
  //   failureFlash: true // allow flash messages
  // }));

  // =============================================================================
  // UNLINK ACCOUNTS =============================================================
  // =============================================================================
  // used to unlink accounts. for social accounts, just remove the token
  // for local account, remove email and password
  // user account will stay active in case they want to reconnect in the future

  // local -----------------------------------
  app.get('/unlink/local', isLoggedIn, function(req, res) {
    var user = req.user;
    user.local.email = undefined;
    user.local.password = undefined;
    user.save(function(err) {
      res.redirect('/profile');
    });
  });

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
    return next();

  res.redirect('/');
}
