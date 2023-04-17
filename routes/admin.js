var express = require('express');
var router = express.Router();
let  FieldModel = require('../models/fields')
const BookingModel = require('../models/bookings')

function checkAdmin(req, res, next){
    if(req.session.admin){
        console.log("Check Admin "+req.session.admin)
        next()
    }else{
        res.redirect('/admin/login')
    }
}


/* GET users listing. */
router.get('/',checkAdmin,async function(req, res, next) {

    let fields = await FieldModel.find().lean()
    res.render('admin/home',{admin:true, fields,isLoggedIn:req.session.admin})
});


router.get('/login',async function(req, res, next) {
    res.render('admin/login',{admin:true})
});

router.post('/login',async function(req, res, next) {
    if(req.body.email == "admin@gmail.com" && req.body.password == "admin"){
        req.session.admin = true
        res.redirect('/admin')
    }else{
        res.redirect('/admin/login')
    }
});

router.get('/logout',async function(req, res, next) {
    req.session.admin = false
    res.redirect('/admin/login')
});




router.get('/add-fields',checkAdmin, function(req, res, next) {
    res.render('admin/addfields',{admin:true, isLoggedIn:req.session.admin})
  });

router.post('/add-fields',checkAdmin, function(req, res, next) {

    let field = new FieldModel({
        name: req.body.fieldName,
        location: req.body.fieldLocation,
        price: req.body.fieldPrice,
        fieldPicture: " ",
        // description: req.body.fieldDescription
    })

    if(req.files){
        let file = req.files.fieldPicture
        filename = Date.now()
        path = `public/images/fields/${filename}.${file.mimetype.split('/')[1]}`
        file.mv(path, function(err){
            if(err){
                console.log(err)
            }else{
                field.fieldPicture = `images/fields/${filename}.${file.mimetype.split('/')[1]}`
                console.log("File uploaded")
                field.save(function(err){
                    if(err){
                        console.log(err)
                        res.redirect('/admin/add-fields')

                    }else{
                        console.log("Field added")
                        res.redirect('/admin')
                    }
                })
            }
        }
        )
    }
  }); 


  router.get('/view-bookings',checkAdmin, async function(req, res, next) {
    let bookings = await BookingModel.find().lean()
    console.log(bookings)
    res.render('admin/viewbookings',{admin:true, bookings,isLoggedIn:req.session.admin})
    });


  
  
  router.get('/delete/:id',checkAdmin, async function(req, res, next) {
    let field = await FieldModel.findByIdAndDelete(req.params.id)
    res.redirect('/admin')
    });


module.exports = router;
