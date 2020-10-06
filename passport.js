const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

// Load User model
const User = require('./user');


module.exports = function(passport) {
  let errors =[];
  passport.use(
    new LocalStrategy({usernameField:"email",passwordField:"pass"},(email,pass,done)=>{
  
      User.findOne({email:email})
      .then(user =>{
        if(!user){
          return done(null,false,errors.push({msg:" This email is not Registered"}));
        }
  
  
        bcrypt.compare(pass,user.pass,(err,isMatch) => {
          if (err) throw err;
          if(isMatch){
            return done(null,user);
          }else{
            return done(null,false,errors.push({msg:"Password Incorrect"}));
          }
        });
      })
     
    })
  );

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  
  passport.deserializeUser(function(id, done) {
    User.findById({_id:id}).then(user => {
      done(null, user);
  })
  .catch(err => {
      throw err;
  }) 
  });
}