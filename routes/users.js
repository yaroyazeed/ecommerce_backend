const {User} = require('../models/user')
const express = require('express')
const bcrypt = require('bcryptjs')
const router = express.Router();
const jwt = require('jsonwebtoken')
const { token } = require('morgan')


router.get(`/`, async (req, res) => {
    const userList = await User.find().select('-passwordHash')

    if (!userList) {
        res.status(500).json({ success: false })
    }
    res.send(userList)
})

//GET single user
router.get('/:id', async (req, res) => {
    //.select() choose which fields to display .select('-') remove fields from result
    const user = await User.findById(req.params.id).select('-passwordHash')

    if (!user) {
        res.status(500).json({ message: 'No user with given ID.' })
    }
    res.status(200).send(user)
})

//Create user
router.post('/', async (req, res) => {
    var user = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.appartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country,
    })
    user = await user.save()

    if (!user) {
        return res.status(404).send('The user cannot be created or registered')
    }
    res.send(user)
})

//User login
router.post('/login', async (req, res) => {
    const user = await User.findOne({ email: req.body.email })
    const secret = process.env.secret

    if (!user) {
        return res.status(400).send('User not found')
    }

    if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
        const token = jwt.sign(
            {
                userID: user.id,
                isAdmin: user.isAdmin,
            },
            secret,
            { expiresIn: '1d' }
        )

        return res.status(200).send({ user: user.email, token: token })
    } else {
        res.status(400).send('Password is wrong')
    }

    // return res.status(200).send(user)
})

module.exports = router;