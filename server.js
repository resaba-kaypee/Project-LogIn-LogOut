if(process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const initPassport = require('./passport-config');
const methodOverride = require('method-override');


const app = express();
const port = process.env.PORT || 3000;
initPassport(passport, 
  email => users.find(user => user.email === email),
  id => users.find(user => user.id === id));
const users = [];

app.set('view-engine', 'ejs');
app.use(express.urlencoded({ extended: false}));
app.use(flash())
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

app.get('/', checkAuthenticated, (req, res) => {
  res.render('index.ejs', { name: req.user.name });
})
//log in
app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}))
//get user
app.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('login.ejs');
})
//register user
app.post('/register', checkNotAuthenticated, async (req, res) => {
  try{
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    users.push({
      id: Date.now().toString(),
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword
    });
    res.redirect('/login');
  } catch {
    res.redirect('/register')
  }
})

app.get('/register', checkNotAuthenticated, (req, res) => {
  res.render('register.ejs');
})

app.listen(port, (error) => {
  if(error) throw error;
  else console.log('Server started listening on port: ' + port);
});

app.delete('/logout', (req, res) => {
  req.logOut();
  res.redirect('/login')
})

function checkAuthenticated(req, res, next){
  if(req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login')
}
function checkNotAuthenticated(req, res, next){
  if(req.isAuthenticated()) {
    return res.redirect('/');
  }
  next();
}