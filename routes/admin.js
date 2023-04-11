var express = require('express');
var router = express.Router();
let  FieldModel = require('../models/fields')

/* GET users listing. */
router.get('/',async function(req, res, next) {
    let fields = await FieldModel.find().lean()
    res.render('admin/home',{admin:true, fields})
});

router.get('/add-fields', function(req, res, next) {
    res.render('admin/addfields',{admin:true})
  });

router.post('/add-fields', function(req, res, next) {

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
  
  
  router.get('/delete/:id', async function(req, res, next) {
    let field = await FieldModel.findByIdAndDelete(req.params.id)
    res.redirect('/admin')
    });


module.exports = router;
