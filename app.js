const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const expressLayouts = require('express-ejs-layouts');
const bcrypt=require("bcryptjs");
const passport=require("passport");
const flash=require("connect-flash");
const session=require("express-session")
const GooglerStrategy=require("passport-google-oauth").OAuthStrategy
const app = express();
const {ensureAuthenticated}=require("./auth")
require('./passport')(passport);
const User=require('./user');
const Note=require("./notes")
mongoose.connect("mongodb+srv://vineetk242000:vineet001@keep-notes.aas1c.mongodb.net/User?retryWrites=true&w=majority", {useUnifiedTopology: true},
console.log("Mongoose connected"));


app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static("public"));

// Express session

app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));


app.use(passport.initialize());
app.use(passport.session());


app.use(flash());

app.use((req,res,next)=>{
 res.locals.error=req.flash("error");
 next();
})


//passport middleware


app.use(function(err, req, res, next) {
  console.log(err);
});

app.get("/",function(req,res){
  res.render("home1.ejs")
})
 
app.get("/dashboard",ensureAuthenticated,function(req,res){
  Note.find({user:req.user._id.toString()}, function(err, posts){
    res.render("home", {
      user:req.user,
      posts:posts
      });
  });
})

app.get("/sign_up",function(req,res){
  res.render("sign_up.ejs")
});

app.post("/sign_up",function(req,res){

  const { name,email,pass,pass2}=req.body;
  let errors=[];


  if(!name || !email || !pass || !pass2){
    errors.push({msg: "Please fill in all fields"})
  }

  if(pass!=pass2){
    errors.push({msg:"Password do not match"});
  }

  if(pass.length<6){
    errors.push({msg:"Password should be at least 6 characters long" })
  }

  if(errors.length >0){
    res.render('sign_up.ejs',{
      errors,
      name,
      email,
      pass,
      pass2
    })
  }else{
   User.findOne({email:email})
   .then(user =>{
     if(user){
        //user exists
        errors.push({msg:"Email is already Registered"})
        res.render('sign_up.ejs',{
          errors,
          name,
          email,
          pass,
          pass2
        })
      }else{
        const newUser = new User({
          name,
          email,
          pass
        });

        //password encryption
        bcrypt.genSalt(10, function(err, salt) {
          bcrypt.hash(newUser.pass, salt, function(err, hash) {
              if(err) throw err;
              newUser.pass=hash;
              newUser.save()
              .then(user =>{
                res.render("success.ejs");
              })
              .catch(err=> console.log(err));
          });
      });

      }
    
    })
  }
})


app.get("/sign_in",function(req,res){
  res.render("sign_in.ejs")
})



app.post("/sign_in",bodyParser.json(),function(req,res,next){
  const {email,pass}=req.body;
    passport.authenticate('local', { 
    successRedirect: '/dashboard',
    failureRedirect:"/sign_in",
    failureFlash: true,
  })(req,res,next);

})

app.get("/logout",function(req,res){
 req.logout();
 req.flash("error","You are logged out")
res.redirect("/sign_in");
})



app.get("/new",ensureAuthenticated,function(req,res){
  res.render("new.ejs",{
    user:req.user._id
  });
});

app.post("/new",function(req,res){
  const{title,content,user}=req.body;
  const newNote= new Note({
      title:title,
      content:content,
      user:user
  })
  newNote.save();
  res.redirect("/dashboard");
})




app.get("/success",function(req,res){
  res.render("success.ejs")
});


  
  
  

app.listen(3000, function() {
  console.log("Server started on port 3000");
});



//authenticated
