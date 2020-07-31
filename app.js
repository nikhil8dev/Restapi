const express = require('express');

const morgan = require('morgan')

const bodyParser = require('body-parser')  

const productRoutes = require('../New folder/routes/product');

const orderRoutes = require('../New folder/routes/orders');

const mongoose = require('mongoose');

const app = express();


//connect to mongodb
mongoose.connect('mongodb://localhost:27017');


//on connection

mongoose.connection.on('connected',()=>{
    console.log('Connected to database mongodb @ 27017')
});

mongoose.connection.on('error',(err)=>{
    if(err){
        console.log('Error in Databaase connection:'+err)
    }
})

mongoose.Promise = global.Promise;

app.use(morgan('dev'));

app.use('/uploads', express.static('uploads'));

app.use(bodyParser.urlencoded({extended:false}));

app.use(bodyParser.json());



app.use((req, res, next)=>{
    res.header("Access-Control-Allow-Origin","*");
    res.header(
        "Access-Control-Allow-Headers",
        'Origin, X-Requested-With, Content-Type, Accept, Authoriation'
    );
    if(req.method === 'OPTIONS'){
        res.header('Access-Control-Allow-Methods','PUT, POST, PATCH, DELETE, GET');
        return  res.status(200).json({});
    }
    next();
})


app.use('/products',productRoutes);




app.use('/orders',orderRoutes);


app.use((req, res, next)=>{
    const error = new Error('Not fond')
    error.status = 404;
    next(error);
});

app.use((error, req, res, next)=>{
    res.status(error.status || 500);
    res.json({
        error:{
            message: error.message
        }
    });
});
module.exports = app;