/*
    Video: https://www.youtube.com/watch?v=Va9UKGs1bwI
    Don't forget to disable less secure app from Gmail: https://myaccount.google.com/lesssecureapps TODO:
*/




var express = require('express'),
  mongoose = require('mongoose'),
  nodemailer = require('nodemailer'),
  bodyParser = require('body-parser');
require('dotenv').config();

const app = express();

//ENTER YOUR EMAIL INFORMATION IN THESE FIELDS........................................................................
var senderEmail = "....";
var senderPassword = "....";
//......................................................................................................................

// Getting data in json format
app.use(bodyParser.urlencoded({extended:true}));


// Setting express engine
app.set('view engine', 'ejs');
app.use(express.static("views"));

const emailSchema = new mongoose.Schema({
  email:{
    type: String,
    required: true
  },
  otp:{
    type: String,
    required: true
  }
});

mongoose.connect('mongodb://localhost:27017/email_verify', {useNewUrlParser: true});

const Email = mongoose.model('email', emailSchema);

app.get('/', function(req, res){
  res.render('register');
});



app.post('/register', function(req, res){
  console.log(req.body);
  Email.find({email:req.body.email}, function(err, found){
    if(found.length){
      console.log('This email is already registerd. Try some other email.');
    }
  });

  const newemail = new Email({
    email:req.body.email,
    otp: randomInt(1001, 9999)
  });
  newemail.save();

  let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
          user: senderEmail, // TODO: your gmail account
          pass: senderPassword // TODO: your gmail password
      }
  });

  // Step 2
  let mailOptions = {
      from: senderEmail, // TODO: email sender
      to: req.body.email, // TODO: email receiver
      subject: 'Nodemailer - Test',
      text: 'Your one time OTP is ' + newemail.otp
  };

  // Step 3
  transporter.sendMail(mailOptions, (err, data) => {
      if (err) {
          return console.log(err);
      }
      return console.log('Email sent!!!');
  });

  res.render('checkOtp', {email: req.body.email});
});

app.post('/checkotp', function(req, res){
  const email = req.body.email;
  const otp =  req.body.otp;
  Email.findOne({email: email}, function(err, found){
    if(err)
    console.log(err);

    if(found){
      if(found.otp === otp)
      res.send('Verified');
      else {
        res.send('OTP not correct');
      }
    }
    else{
      res.send('Email not registered');
    }
  })
});




function randomInt(low, high) {
    return Math.floor(Math.random() * (high - low) + low)
}

app.listen(3000, function(){
  console.log('Server is running');
});
