var express = require('express');
var router = express.Router();
const User = require('../models/users');
const moment =  require('moment')
const FieldModel = require('../models/fields')
const BookingModel = require('../models/bookings')

/* GET home page. */
router.get('/', async function(req, res, next) {
  console.log(req.session);
  const fields = await FieldModel.find().lean()
  if(req.session.user){
    res.render('index',{user:req.session.user,fields});
  } else {
    res.render('index',{fields});
  }
});


router.get('/checkout/:id',async (req,res)=>{


  if(!req.session.user){
    return res.redirect('/login')
  }
  

  const id = req.params.id

   field = await FieldModel.findById(id).lean()


  if(req.session.error){
    const error = req.session.error
    req.session.error = null
    
    return res.render('pages/single-turf',{field,error,user:req.session.user})
  }
  return res.render('pages/single-turf',{field,user:req.session.user})



  // res.render('pages/single-turf')
})

router.post('/checkout/:id',async (req,res)=>{
  const {startTime,endTime,date} = req.body
  console.log(req.body);

  const id = req.params.id
  
  const field = await FieldModel.findById(id).lean()

  const booking = new BookingModel({
    userId: req.session.user.phoneNumber,
    fieldId: field._id,
    fieldName: field.name,
    date: date,
    start: startTime,
    end: endTime,
    price : field.price * (endTime - startTime)
  })

  booking.save((err)=>{
    if(err){
      console.log(err);
      req.session.error = "Error booking field"
      return res.send({status:500,message:"Booking Failed"})
    } else {
      req.session.error = "Field booked successfully"
      return res.send({status:200,message:"Booking Successful",data:booking})
    }
  })

  })


router.get('/bookings',async (req,res)=>{
  if(!req.session.user){
    return res.redirect('/login')
    }
    const bookings = await BookingModel.find({userId:req.session.user.phoneNumber}).lean()
    console.log(bookings);
    res.render('pages/bookings',{user:req.session.user,bookings})
  })  



/* GET Login page. */
router.get('/login', function(req, res, next) {
  res.render('pages/login',{user:req.session.user});
});

/* GET Login page. */
router.post('/login', function(req, res, next) {
  console.log(req.body);
  const { phoneNumber, password } = req.body;
    try {
      if(phoneNumber && password){
        User.findOne({phoneNumber: Number(phoneNumber)}, (err, user) => {
          if(err){
            console.log(err);
            res.status(500).send('Error logging in please try again.');
          } else {
            if(!user){
              res.status(401).send('Phone Number or password incorrect');
            } else {
              if(user.password === password){
                const userdata = {
                  name: user.name,
                  phoneNumber: user.phoneNumber
                }
                req.session.user = userdata;
                res.redirect('/');
              } else {
                res.status(401).send('Phone Number or password incorrect');
              }
            }
          }
        });
      } else {
        res.status(500).send('All fields are required.');
      }
    } catch (error) {
      console.log(error.message);
    }
   
});


/* GET Signup page. */
router.get('/signup', function(req, res, next) {
  res.render('pages/signup');
});

/* Post Signup page. */
router.post('/signup', function(req, res, next) {
  console.log(req.body);
  const { name, phoneNumber, password } = req.body;
  if(name && phoneNumber && password ){
    const user = new User({
      name,
      phoneNumber,
      password

    });

    user.save((err, result) => {
      if(err){
        console.log(err);
        // res.status(500).send('Error registering new user please try again.');
        res.redirect('/signup')

      } else {
        const user = {
          name: result.name,
          phoneNumber: result.phoneNumber

        }
        req.session.user = user;
        res.redirect('/');
      }
    });
  } else {
    res.status(500).send('All fields are required.');
  }
});



/* GET Logout page. */
router.get('/logout', function(req, res, next) {
  if(req.session.user){
    req.session.destroy();
  }
  res.redirect('/');
});




module.exports = router;
