const {Product} = require('../models/product')
const {Category} = require('../models/category')
const express = require('express')
const router = express.Router();
const mongoose = require('mongoose')


//GET list of products
router.get(`/`, async (req, res) => {
    // const productList = await Product.find();

    //Get specific fields of products
    //Separate each field by space && add '-' to exclude a field
    // const productList = await Product.find().select('name image description category -_id').populate('category');

    //Filter product list by category allowing user to parse query params
    let filter = {}
    if(req.query.categories){
        filter = {category: req.query.categories.split(',')}
    }

    const productList = await Product.find(filter).populate('category');



    if(!productList){
        res.status(500).json({success: false})
    }
    res.send(productList)
})

//GET single product by ID
router.get(`/:id`, async (req, res) => {
    // const product = await Product.findById(req.params.id);
    //GET the details of object ID included e.g category
    const product = await Product.findById(req.params.id).populate('category');
 
    if(!product){
        res.status(500).json({success: false, message: 'Product not found'})
    }
    else{
        res.send(product)
    }
})


//POST a new product
router.post(`/`, async (req, res) => {
    
    //Validate if provided category exists
    const category = await Category.findById(req.body.category)
    if(!category){
        return res.status(400).send('Invalid category')
    }
    
    var product = new Product({
       name: req.body.name,
       description: req.body.description,
       richDescription: req.body.richDescription,
       image: req.body.image,
       brand: req.body.brand,
       price: req.body.price,
       category: req.body.category,
       countInStock: req.body.countInStock,
       rating: req.body.rating,
       numReviews: req.body.numReviews,
       isFeatured: req.body.isFeatured,
   })

   product = await product.save()
   
   if(!product){
       return res.status(500).send('The product cannot be created')
   }
   res.send(product)
})

//Update product
router.put(`/:id`, async (req, res) => {
    //validate if product ID exists
    if(!mongoose.isValidObjectId(req.params.id)){
        res.status(400).send('Invalid product ID')
    }

    //Validate if provided category exists
    const category = await Category.findById(req.body.category)
    if(!category){
        return res.status(400).send('Invalid category')
    }
     
    const product = await Product.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            description: req.body.description,
            richDescription: req.body.richDescription,
            image: req.body.image,
            brand: req.body.brand,
            price: req.body.price,
            category: req.body.category,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            numReviews: req.body.numReviews,
            isFeatured: req.body.isFeatured, 
        },
        {
            //Return updated data
            new: true
        }
    )

    if(!product){
        return res.status(500).send('The Product cannot be updated')
        }
        res.send(product)
})

//Delete product
router.delete(`/:id`, (req, res) => {
    Product.findByIdAndDelete(req.params.id).then(product => {
        if(product){
            return res.status(200).json({
                success: true,
                message: 'The product has been deleted'
            })
        } else{
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            })
        }
    }).catch(err => {
        return res .status(400).json({ success: false, error: err})
    })
})


//Get count on products
router.get(`/get/count`, async (req, res) => {
    const productCount = await Product.countDocuments();


    if(!productCount){
        res.status(500).json({success: false})
    }
    res.send({productCount: productCount})
})


//Get Featured products and limit the number
router.get(`/get/featured/:count`, async (req, res) => {
    const count = req.params.count ? req.params.count: 0
    //find all products with isFeatured true
    const products = await Product.find({isFeatured: true}).limit(+count);


    if(!products){
        res.status(500).json({success: false})
    }
    res.send(products)
})



module.exports = router;