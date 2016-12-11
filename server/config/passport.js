const LocalStrategy = require('passport-local').Strategy;
const Models = require('../models/models.js');
const db = require('../db/db.js');

module.exports = function(passport) {
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  passport.deserializeUser(function(id, done) {
    db.query('select * from users where id = ?', [id], function(err, result) {
        done(err, result[0]);
    });
  });
  passport.use('local-signin', new LocalStrategy(function(username, password, done) {
    Models.users.get(username, function(err, result) {
      console.log('Inside login result: ', result);
      if (err) { return done(err); }
      if (!result.length) {
        console.log('no account found');
        return done(null, false);
      }
      if (!(Models.users.checkPassword(password, result[0].password))) {
        console.log('wrong password', password);
        return done(null, false);
      }
      console.log('signin complete!');
      return done(null, result[0]);
    });
  }));

  passport.use('local-signup', new LocalStrategy(function(username, password, done) {
    Models.users.get(username, function(err, rows) {
      if (err) {
        return done(err); }
      if (rows[0]) {
        return done(null, false);
      } else {
        var newUser = new Object();
        newUser.username = username;
        newUser.password = password;
        Models.users.post(username, password, function(err, results) {
          console.log(results);
          if (err) {
            console.error(err);
          }
          console.log('Account added');
          newUser.id = results.insertId;
          console.log(newUser);
          return done(null, newUser);
        });
      }
    });
  }));

}