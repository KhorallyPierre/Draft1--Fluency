module.exports = function(app, passport, db) {

  // normal routes ===============================================================

  // show the home page (will also have our login links)


  // PROFILE SECTION =========================
  //  Create (POST) - Make match between users
  // url to access this information localhost:1000/pair/Spanish
  // create
  app.post('/userProfile', isLoggedIn, function(req, res) {
    const profileObject = {
      email: req.body.email,
      userName: req.body.userName,
      proficiency: req.body.proficiency,
      language: req.body.language,
      learning: req.body.learning
    }
    db.collection('userProfile').insertOne(profileObject, (err, result) => {
      if (err) {
        res.redirect('request failed, try again')
      } else {
        res.redirect('profile.html')
      }
    })
  });


// UPLOAD PROFILE PICTURE // ======================

app.post('/picture', (req, res) => {
  if(req.files){
    console.log(req.files)
    var file = req.files.file
    var fileName = decodeURIComponent(file.name)
    console.log(fileName)

    file.mv('public/uploads/'+fileName, function (err){
      if (err) {
        res.send(err)
      } else {

        res.redirect('/userProfile')
      }
    })
    db.collection('picture').save({name: req.body.name, img: "/uploads/" + fileName, thumbUp: 0, thumbDown:0}, (err, result) => {
      if (err) return console.log(err)
      console.log('saved to database')

    })
  }

})



app.delete('/picture', (req, res) => {
  console.log("trying to delete image", decodeURIComponent(req.body.img))

  db.collection('picture').findOneAndDelete({img: decodeURIComponent(req.body.img)} , (err, result) => {
    if (err) return res.send(500, err)
    res.send('picture deleted!')
  })
})
//==============//===========================================


// ======================= PAIRING OF USERS THAT WANT RESOURCES THE OTHER ONE HAS

  // who speaks desired langugage gets chosen /read
  // get is reading
  app.get('/pair/:language', /*isLoggedIn,*/ function(req, res) {
    console.log('language', req.params.language)
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
    }, (err, result) => {
      if (err) return console.log(err)
      db.collection('requests').find({
        status: "waiting"
      }).toArray((err, requests) => {
        console.log('chat requests', requests)
        res.render('profile.ejs', {
          user: req.user,
          userProfile: result,
          requests: requests

        })
      })
    });
  })
  app.get('/', function(req, res) {
    res.render('index.ejs', {

    })

  });

  // ============ DIRECT TO VIDEO ROOM WHERE STUDENT WAITS FOR TEACHER

  //
  // implement tips on how to be a good teacher or how to learn
  // countdown
  // alert: "we've found you a match!"

  app.get('/profile', isLoggedIn, function(req, res) {
    db.collection('messages').findOne({
      email: req.user.local.email
    }, (err, result) => {
      if (err) return console.log(err)
      // inside find() we need a filter to find messages addressed to a
      //specific user (whoever is logged in)
      db.collection('messages').find({
        message: req.user.local.message
      }).toArray((err, messages) => {
        // not sure about my console.log below
        console.log('the displayed message is', req.user.local.message, messages)
        res.render('profile.ejs', {
          user: req.user,
          userProfile: result,
          // not sure about below
          messages: messages

        })
      })
    });
  })


  // other person (TEACHER) gets an alert that someone would like to chat
  // - they can say yes or no and they get brought to the same room
  //push button, then you're connected

  // put TEACHER INTO CHAT ROOM WITH WAITING STUDENT




  // figure out web rtc implementation




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

  app.post('/pair', isLoggedIn, function(req, res) {
    const profileObject = {
      language: req.body.language,
      learning: req.body.learning
    }
    db.collection('requests').insertOne(profileObject, (err, result) => {
      db.collection('userProfile').findOne({
        languages: {0:{language:'English'}}
        // {  $elemMatch: {
            // language: req.params.language,
            // teachOrLearn: "teach"
        //   }
        // }
        // email: req.user.email
      }, (error, pairing) => {
        console.log('HELOOOOOOO', pairing)
        if (error) {
          res.redirect('request failed, try again')
        } else {
          res.redirect('/profile')
        }
        // if () ? //insert button here//  : "could not find a match"
      })

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
