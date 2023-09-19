const express = require('express')
const app = express()
const morgan = require('morgan')
const mongoose = require('mongoose')
require('dotenv/config')
const cors = require('cors')
const authJwt = require('./helpers/jwt')
const errorHandler = require('./helpers/error-handler')

//Middleware
app.use(cors())
app.options('*', cors())
app.use(express.json())
app.use(morgan('tiny'))
app.use(authJwt())
app.use(errorHandler)

//Routes
const productRoutes = require('./routes/products')
const categoriesRoutes = require('./routes/categories')
const ordersRoutes = require('./routes/orders')
const usersRoutes = require('./routes/users')
// const authJwt = require('./helpers/jwt')

const api = process.env.API_URL

app.use(`${api}/products`, productRoutes)
app.use(`${api}/categories`, categoriesRoutes)
app.use(`${api}/orders`, ordersRoutes)
app.use(`${api}/users`, usersRoutes)

//Database Connection
mongoose
    .connect(process.env.DB_CONNECTION_STRING)
    .then(() => {
        console.log('Connection is ready!')
    })
    .catch((err) => {
        console.log(err)
    })

//Server
app.listen(3000, () => {
    console.log('Serer is running on http://localhost:3000')
})
