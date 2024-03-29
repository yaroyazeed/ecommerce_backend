const { User } = require('../models/user')
const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
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

router.post('/register', async (req, res) => {
    var user = new User({
        name: req.body.name,
        email: req.body.email,
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
        return res.status(404).send('The user cannot be created')
    }
    res.send(user)
})

//GET count
router.get(`/get/count`, async (req, res) => {
    const userCount = await User.countDocuments()

    if (!userCount) {
        res.status(500).json({ success: false })
    }
    res.send({ userCount: userCount })
})

//DELETE user
router.delete('/:id', (req, res) => {
    User.findByIdAndDelete(req.params.id)
        .then((user) => {
            if (user) {
                return res.status(200).json({
                    success: true,
                    message: 'The user has been deleted',
                })
            } else {
                return res.status(404).json({
                    success: false,
                    message: 'User not found',
                })
            }
        })
        .catch((err) => {
            return res.status(400).json({ success: false, error: err })
        })
})

module.exports = router
