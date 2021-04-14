module.exports = function(app, passport, db) {

  // normal routes ===============================================================

  // show the home page (will also have our login links)


  // PROFILE SECTION =========================
  //     Create (POST) - Make match between users
  // url to access this information localhost:1000/pair/Spanish
  // create
  app.post('/userProfile', isLoggedIn, function(req, res) {
    const profileObject = {
      email: req.body.email,
      userName: req.body.userName,
      proficiency: req.body.proficiency,
      language: req.body.language,
      learning: req.body.learning,
      images: req.body.image
    }
    db.collection('userProfile').insertOne(profileObject, (err, result) => {
      if (err) {
        res.redirect('request failed, try again')
      } else {
        res.redirect('profile.html')
      }
    })
  });

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
  // THIS PUTS LANGAUGE ON USER PROFILE
  app.post('/addLanguage', /*isLoggedIn,*/ function(req, res) {
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
          res.redirect('/userProfile')
        } else {
          res.redirect('/profile')
        }
      })
  });

  // displaying profile where video message is coming from ???
  app.get('/profile', isLoggedIn, function(req, res) {
    db.collection('userProfile').findOne({
      email: req.user.local.email
    }, (err, userProfile) => {
      if (err) return console.log(err)
      // inside find() we need a filter to find messages addressed to a
      //specific user (whoever is logged in)
      db.collection('requests').find({
        status: "waiting"
        // maybe only find reqeusts from the last hour
        // if over an hour it's too old
      }).toArray((err, requests) => {
        console.log('chat requests', requests)
        let found = null
        for (let i = 0; i < userProfile.languages.length; i++){
          if (userProfile.languages[i].teachOrLearn === "teach") {
            found = requests.find(request => request.language === userProfile.languages[i].language);

          }
        }
        console.log('we found a teacher', found)
        res.render('profile.ejs', {
          user: req.user,
          userProfile: userProfile,
          requests: requests,
          found: found


        })
      })
    });
  })
  app.get('/', function(req, res) {
    res.render('index.ejs', {

    })

  });

  // direct to waitng room for people who want to chat
  // implement tips on how to be a good teacher or how to learn
  // countdown
  // alert: "we've found you a match!"
  // other person gets an alert that someone would like to chat
  // - they can say yes or no and they get brought to the same room
  //push button, then you're connected
  app.get('/profile', isLoggedIn, function(req, res) {
    console.log('hi im the thing youre looking for', req)
    db.collection('messages').findOne({
      email: req.user.local.email
    }, (err, result) => {
      if (err) return console.log(err)
      // inside find() we need a filter to find messages addressed to a
      //specific user (whoever is logged in)
      db.collection('userProfile').find({
        picture: req.user.local.picture

      }).toArray((err, messages) => {
        // not sure about my console.log below
        console.log('the displayed message is', req.user.local.message, messages)
        res.render('profile.ejs', {
          user: req.user,
          userProfile: result,
          picture: req.user.local.picture

        })
      })
    });
  })

  // upload profile picture ===========
  app.post('/picture', (req, res) => {
    if (req.files) {
      console.log(req.files)
      var file = req.files.file
      var fileName = decodeURIComponent(file.name)
      console.log(fileName)

      file.mv('uploads/'+fileName, function(err) {
        if (err) {
          res.send(err)
        } else {

          res.redirect('/userProfile')
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

  // app.put('/userProfile', (req, res) => {
  //   if (req.files) {
  //     console.log('message', req.body)
  //     var file = req.files.file
  //     var fileName = decodeURIComponent(file.name)
  //     console.log(fileName)
  //
  //     file.mv('public/uploads/' + fileName, function(err) {
  //       if (err) {
  //         res.send(err)
  //       } else {
  //
  //         res.redirect('/userProfile')
  //       }
  //     })
  //     db.collection('userProfile').save({
  //       name: req.body.name,
  //       img: "/uploads/" + fileName
  //     }, (err, result) => {
  //       if (err) return console.log(err)
  //       console.log('saved to database')
  //
  //     })
  //   }
  //
  // })



  // then figure out combining matching of two people (student and teacher ) and putting them in the same room


  // what if no one wants to teach?


  // figure out web rtc implementation



  // CREATE A USER IN PROCESS OF PAIRING  ==================================



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

  app.get('/pair', isLoggedIn, function(req, res) {
    const profileObject = {
      language: req.query.language,
      learning: req.query.learning
    }
    // web mail - like application instead
    // every teacher gets an update on how many people are ready to learn
    // more passive
    // creating requests for people who are ready to chat
    // while theyre waiting, user will see request - they will initiate the call
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
