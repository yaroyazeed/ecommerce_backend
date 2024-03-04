const {Order} = require('../models/order')
const express = require('express');
const {OrderItem} = require('../models/order-item');
const router = express.Router();


router.get(`/`, async (req, res) => {
    const orderList = await Order.find().populate('user', 'name').sort({'dateOrdered': -1}); //order by date newest to oldest

    if(!orderList){
        res.status(500).json({success: false})
    }
    res.send(orderList)
})

router.get(`/:id`, async (req, res) => {
    const order = await Order.findById(req.params.id)
    .populate('user', 'name')
    .populate({path : 'orderItems', populate: {
        path: 'product', populate: 'category'}
    })

    if(!order){
        res.status(404).json({success: false, message: 'Order not found'})
    }
    else{
        res.send(order)
    }
})

router.post(`/`, async (req, res) => {
    const orderItemsIds = Promise.all(req.body.orderItems.map(async orderItem => {
        let newOrderItem = new OrderItem({
            quantity: orderItem.quantity,
            product: orderItem.product
        })
        newOrderItem = await newOrderItem.save();

        return newOrderItem._id;
    }))

    const orderItemsIdsResolved = await orderItemsIds;

    let order = new Order({
        orderItems: orderItemsIdsResolved,
        shippingAddress1: req.body.shippingAddress1,
        shippingAddress2: req.body.shippingAddress2,
        city: req.body.city,
        zip: req.body.zip,
        country: req.body.country,
        phone: req.body.phone,
        status: req.body.status,
        totalPrice: req.body.totalPrice,
        user: req.body.user,
    })
    order = await order.save();

    if(!order)
    return res.status(404).send('The order cannot be created')

    res.send(order)
})

router.put('/:id', async (req, res) => {
    const order = await Order.findByIdAndUpdate(
        req.params.id,
        {
            status: req.body.status
        },
        {
            //Return updated data
            new: true
        }
    )

    if(!order){
        return res.status(404).send('The order cannot be updated')
        }
        res.send(order)
})

router.delete('/:id', (req, res) => {
    Order.findByIdAndRemove(req.params.id).then(async order => {
        if(order){
            await order.orderItems.map(async orderItem => {
                await OrderItem.findByIdAndRemove(orderItem)
            })
            return res.status(200).json({
                success: true,
                message: 'The order has been deleted'
            })
        } else{
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            })
        }
    }).catch(err => {
        return res.status(500).json({ success: false, error: err})
    })
})

module.exports = router;