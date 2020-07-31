const express = require('express');
const mongoose = require('mongoose');

const Product = require('../models/product');
const multer = require('multer');


const storage = multer.diskStorage({
    destination: function(req, file, cd ){
       cd(null, '.uploads/');
    },
    filename: function(req, file, cd ){
       cd(null, new Date().toISOString() + file.originalname);
    }    
});

const fileFilter = (req, file, cd) =>{
    // reject  a file
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
        cd(null, true);
    }else{
        cd(null, false);
    }    
}
const upload = multer({ 
    storage: storage,
});
const router = express.Router();
 
       const response ={
           count: docs.length,
           products: docs.map(doc =>{
               return {
                   name: doc.name,
                   price: doc.price,
                   productImage:doc.productImage,
                   _id: doc._id,
                   request:{
                       type: "GET",
                       url:'http://localhost:3000/products/' + doc._id
                   }
               }
           })
       };

       res.status(200).json(response);
   }).catch(err =>{
       console.log(err);
       res.status(500).json({
           error:err
       });

   });
});

router.post('/',upload.single('productImage'),(req, res, next)=>{
     console.log(req.file)
     const product = new Product({
       _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price,
        productImage: req.file.path 
     });

     product.save()
     .then(result => {
         console.log(result)
         res.status(201).json({
            message: 'Handling the post request via node routes ',
            createdProduct:{
                name: result.name,
                price: result.price,
                _id: result.id,
                request:{
                    type: 'GET',
                    url: 'http://localhost:3000/products/' + result._id
                }
            }
        });
     }).catch(err => {
         console.log(err)
         res.status(500).json({
             error:err
         })
     })
});

router.get("/:productId", (req, res, next)=>{
    const id = req.params.productId;
    Product.findById(id)
    .select('name price _id productImage')
    .exec()
    .then(doc   => {
        
           if(doc){
          res.status(201).json({
              product: doc,
              request: {
                  type: 'GET',
                  description: 'GET_ALL_PRODUCTS',
                  url: 'http://localhost:3000/products'
              }
          });
           } else {
           res.status(404).send({message:'No valid entry for provided ID.'});
           }
     })
     .catch(err => {
         console.log(err);
         res.status(500).json({error:err})
            })
        
});

router.patch('/:productId',(req,res,next)=>{
  const id = req.params.productId;
  const updateOps = {};
  for (const ops of req.body){0
      updateOps[ops.propName] = ops.value;
  }
  Product.update({ _id: id},{$set: updateOps})
  .exec()
  .then(result =>{
      console.log(result);
      res.status(200).json({
          message: 'Product Updated',
          request:{
              type: 'GET',
              url: 'http://localhost:3000/products/' + id
          }
      });
  })
  .catch(err => {
      console.log(err)
      res.status(500).json({
            error:err
      })
  });
  
});

router.delete('/:productId',(req,res,next)=>{
     const id = req.params.productId;
     Product.remove({_id: id})
     .exec()
     .then(result => {
         res.status(200).json(result);
     }).catch(err => {
         console.log(err);
         res.status(500).json({
             message: 'Product Deleted',
            request: {
                type: 'POST',
                url: 'http://localhost:3000/products',
                body: { name: 'String',price:'Number'}
            }
         });
     });
 });


module.exports = router;

