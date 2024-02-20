var express = require('express');
var router = express.Router();
const User = require('../models/users');
const moment =  require('moment')
const FieldModel = require('../models/fields')
const BookingModel = require('../models/bookings');
const bookings = require('../models/bookings');

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

   const bookings = BookingModel.find({fieldId:id}).lean()


  if(req.session.error){
    const error = req.session.error
    req.session.error = null
    
    return res.render('pages/single-turf',{field,error,user:req.session.user})
  }
  return res.render('pages/single-turf',{field,user:req.session.user,bookings})



  // res.render('pages/single-turf')
})

router.post('/checkout/:id',async (req,res)=>{
  const {startTime,endTime,date} = req.body
  console.log(req.body);

  const start = startTime; // start time of the new booking
  const end = endTime; // end time of the new booking
  // Define the filter to check for overlapping bookings
  const filter = {
    fieldId: req.params.id,
    isCancelled : true,
    date: date,
    $or: [
      { start: { $lt: end }, end: { $gt: start } }, // Existing booking starts before new booking ends and ends after new booking starts
      { start: { $gte: start, $lte: end } }, // Existing booking starts during new booking
      { end: { $gte: start, $lte: end } } // Existing booking ends during new booking
    ]
  };

  const existingBooking = await BookingModel.findOne(filter);


  if (existingBooking) {
    // throw new Error('Time slot is already booked');
    return res.send({status:500,message:"Time slot is already booked"})
  }
  
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
      // return res.redirect('/sucesss')
    }
  })
  })

  router.get('/success',async (req,res)=>{
    return res.render('pages/sucessPage')

  })


router.get('/bookings',async (req,res)=>{
  if(!req.session.user){
    return res.redirect('/login')
    }
    const bookings = await BookingModel.find({userId:req.session.user.phoneNumber}).lean()
    console.log(bookings);
    res.render('pages/bookings',{user:req.session.user,bookings})
  })  



  // router.post('/bookings/:id',async (req,res)=>{
  //     const bookings = await BookingModel.find({fieldId:req.params.id}).lean()
  //     console.log(bookings);
  //     res.send(bookings)
  //   }
  // )


  router.post('/bookings/:id', async (req, res) => {
    const currentDate = new Date();
    const bookings = await BookingModel.find({
      fieldId: req.params.id,
      isCancelled : false,
      date: { $gte: currentDate.toISOString().slice(0, 10) } // filter by date greater than or equal to today's date
    }).lean();
  
    console.log(bookings);
    res.send(bookings);
  });

  router.get('/bookings/cancel/:id', async (req, res) => {
    let booking = await BookingModel.findById(req.params.id)
    booking.isCancelled = true;
    booking.save();      
    res.redirect("/bookings");
  });

  router.get('/confirmBooking/:id/:data', async (req, res) => {
    console.log(req.params.data)
    data = JSON.parse(Buffer.from(req.params.data, 'base64').toString());
    let fieldId = req.params.id
    data = {...data,fieldId}
    res.render("pages/confirmBooking",{data,user:req.session.user});
  });



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
              // res.status(401).send('Phone Number or password incorrect');
              let message = "Phone number or password incorrect"
              res.render('pages/login',{errorMessage: message});
            } else {
              if(user.password === password){
                const userdata = {
                  name: user.name,
                  phoneNumber: user.phoneNumber
                }
                req.session.user = userdata;
                res.redirect('/');
              } else {
                // res.status(401).send('Phone Number or password incorrect');
                let message = "Phone number or password incorrect"
                res.render('pages/login',{errorMessage: message});
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
