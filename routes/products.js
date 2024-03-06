const {Product} = require('../models/product')
const {Category} = require('../models/category')
const express = require('express')
const router = express.Router();
const mongoose = require('mongoose')
const multer = require('multer')


const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg',
    'image/webp': 'webp'
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype]
        let uploadError = new Error('Invalid image type')

        if(isValid){
            uploadError = null
        }
      cb(uploadError, 'public/uploads')
    },
    filename: function (req, file, cb) {
    //   const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const filename = file.originalname.replace(' ', '-')
    const extension = FILE_TYPE_MAP[file.mimetype]
    cb(null, `${filename}-${Date.now()}.${extension}`)
    //   cb(null, file.fieldname + '-' + uniqueSuffix)
    }
  })

  const uploadOptions = multer({ storage: storage })
//   const upload = multer({ storage: storage })

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
router.post(`/`, uploadOptions.single('image'), async (req, res) => {
    
    //Validate if provided category exists
    const category = await Category.findById(req.body.category)
    if(!category){return res.status(400).send('Invalid category')}

    const file = req.file
    if(!file){return res.status(400).send('No image in the request')}

    const fileName = req.file.filename
    const basePath = `${req.protocol}://${req.get('host')}/public/upload/`
    
    var product = new Product({
       name: req.body.name,
       description: req.body.description,
       richDescription: req.body.richDescription,
       image: `${basePath}${fileName}`,
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
router.put(`/:id`,uploadOptions.single('image'), async (req, res) => {
    //validate if product ID exists
    if(!mongoose.isValidObjectId(req.params.id)){
        res.status(400).send('Invalid product ID')
    }

    //Validate if provided category exists
    const category = await Category.findById(req.body.category)
    if(!category){
        return res.status(400).send('Invalid category')
    }

    const product = await Product.findById(req.params.id)
    if(!product){
        return res.status(400).send('Invalid product')
    }

    const file = req.file
    let imagePath

    if (file) {
        const fileName = req.file.filename
        const basePath = `${req.protocol}://${req.get('host')}/public/upload/`
        imagePath = `${basePath}${fileName}`
    } else {
        imagePath = product.image
    }
     
    const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            description: req.body.description,
            richDescription: req.body.richDescription,
            image: imagePath,
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

    if(!updatedProduct){
        return res.status(500).send('The Product cannot be updated')
        }
        res.send(updatedProduct)
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

//Update product image gallery by uploading multiple images
router.put(`/gallery-images/:id`,
uploadOptions.array('images', 10),
async (req, res) => {
    if(!mongoose.isValidObjectId(req.params.id)){
        return res.status(400).send('Invalid product ID')
    }
    const files = req.files
    let imagesPaths = []
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`
    if (files) {
        files.map((file) => {
            imagesPaths.push(`${basePath}${file.filename}`)
        })
    }
    
    const product = await Product.findByIdAndUpdate(
        req.params.id,
        {
            images: imagesPaths,
        },
        {new: true}
    )

    if(!product){
        return res.status(500).send('The gallery cannot be updated')
    }
    res.send(product)
})

module.exports = router;