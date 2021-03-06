const express = require('express');
const mongoose = require('mongoose');

const Product = require('../models/product') 
const Order = require('../models/order')


const router = express.Router();



router.get('/',(req,res,next)=>{
    Order.find()
     .select('product quantity _id')
     .populate('product')
     .exec()
     .then(result =>{
      res.status(200).json({
        count: result.length,
        orders: result.map(doc =>{
          return {
             _id: doc._id,
             product: doc.product,
             quantity: doc.quantity,
             request:{
              type: 'GET',
              url:'http://localhost:3000/orders/' + doc._id
            }
          }
        })
       
      })
    })
    .catch(err=>{
           console.log(err)
           res.status.json({
             error:err
           })
    })
});


router.post('/',(req,res,next)=>{
  Product.findById(req.body.productId)
  .then(product => {
    if(!product){
      return res.status(404).json({
        message: "Product not found"
      });
    }
    const order = new Order({
      _id: mongoose.Types.ObjectId(),
      quantity: req.body.quantity,
      product: req.body.productId
  
    })
   return order.save()
  }) .then(result =>{
            res.status(201).json({
              message:'Order stored',
              createdOrder:{
                _id: result._id,
                product: result.product,
                quantity: result.quantity
              },
              request: {
                type : 'GET',
                url: 'http://localhost:3000/orders/' + result.id
              }
            })
          }).catch(err =>{
            res.status(500).json({
              error:err
              
            })
          })
        }) 
router.get('/:orderId',(req, res, next)=>{
   Order.findById(req.params.orderId)
   .populate('product','name')
   .exec()
   .then(order =>{
     if(!order){
       return res.status(404).json({
         message: "order not found"
       }) ;
     }
    res.status(200).json({
      order: order,
      request:{
        type:'GET',
        url: 'http://localhost:3000/orders'
      }
    })
   }).catch(err =>{
    res.status(500).json({
      error:err
    })
  })
})

router.delete('/:orderId',(req, res, next)=>{
   Order.remove({_id: req.params.orderId})
   .exec()
   .then(order =>{
    res.status(200).json({
      message: 'order deleted',
      request:{
        type:'POST',
        url: 'http://localhost:3000/orders',
         body: { productId:"ID",quantity:"Number"}
      }
    })
   .catch(err => {
     res.status(500).json({
       error:err
     })
   })
})
})


module.exports = router;