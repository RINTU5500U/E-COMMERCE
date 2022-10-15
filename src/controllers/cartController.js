const mongoose = require("mongoose")
const userModel = require("../models/userModel")
const productModel = require("../models/productModel")
const cartModel = require("../models/cartModel")
const { ElasticInference } = require("aws-sdk")

const createCart = async function (req, res) {
    try {
        let user_id = req.params.userId
        let reqbody = req.body
        const { cart_id, productId, ...a } = reqbody
        if (Object.keys(a).length > 0)
            return res.
                status(400).
                send({ status: false, message: "invalid request in requestBody" })
        if (productId) {
            if (!mongoose.isValidObjectId(productId))
                return res.
                    status(400).
                    send({ status: false, message: "productId is not valid" })
            let data = await productModel.findOne( {_id:productId })
            console.log(data)
            if (data.isDeleted==true)
                return res.
                    status(404).
                    send({ status: false, message: "product is not exist" })
        }
        if (cart_id) {
            if (!mongoose.isValidObjectId(cart_id))
                return res.
                    status(400).
                    send({ status: false, message: "cart_id is not valid" })
            let data = await cartModel.findOne({ _id: cart_id })
            if (data.items.length==0 && data.totalPrice==0 && data.totalItems==0)
                return res.
                    status(404).
                    send({ status: false, message: "cart is not present or cart does not contain any data" })
        }

        if (cart_id == "undefined" || !cart_id) {
            let result = await cartModel.findOne({ userId: user_id })
            if (result == null) {
                if (productId == "undefined" || !productId) {
                    let obj = new Object()
                    obj.userId = user_id
                    obj.totalPrice=0
                    obj.totalItems=0
                    let data = await cartModel.create(obj)
                    return res.
                        status(201).
                        send({ status: true, message: "Cart Created Successfully", data: data })
                } else {
                    let obj = new Object()
                    let price=await productModel.findById(productId).select({_id:0,price:1})
                    let total=price.price 
                    obj.userId = user_id
                    let d = {}
                    d.productId = productId
                    d.quantity = 1
                    obj.items = d
                    obj.totalPrice=total
                    obj.totalItems=1
                    let data = await cartModel.create(obj)
                    return res.
                        status(200).
                        send({ status: true, message: "Product Added successfully in the Cart", data: data })
                }
            } else {
                if (productId == "undefined" || !productId) {
                    let result = await cartModel.find({ userId: user_id })
                    return res.
                        status(200).
                        send({ status: true, message: "Added Product list in Cart", data: result })
                }
                let flag = false
                let total=await productModel.findById(productId).select({_id:0,price:1})
                let data = await cartModel.findOne({ userId: user_id }).select({ _id: 0, items: 1 ,totalPrice:1})
                let a = data.items
                let price=data.totalPrice
                for (let i = 0; i < a.length; i++) {
                    if (a[i].productId == productId) {
                        a[i].quantity++
                        price+=total.price
                        flag = true
                    }
                }
                if (flag == false) {
                    let d = {}
                    d.productId = productId
                    d.quantity = 1
                    a.push(d)
                    price+=total.price
                }
                let result = await cartModel.findOneAndUpdate({ userId: user_id }, { $set: { items: a ,totalPrice:price,totalItems:a.length} }, { returnOriginal: false })
                return res.
                    status(200).
                    send({ status: true, message: "Product Added Successfully in the cart", data: result })
            }
        } else {
            if (productId == undefined || !productId)
                return res.
                    status(400).
                    send({ status: false, message: "productID is missing" })
            let flag = false
            let total=await productModel.findById(productId).select({_id:0,price:1})
            let data = await cartModel.findOne({ _id: cart_id }).select({ _id: 0, items: 1 ,totalPrice:1})
            let a = data.items
            let price=data.totalPrice
            for (let i = 0; i < a.length; i++) {
                if (a[i].productId == productId) {
                    a[i].quantity++
                    price+=total.price
                    flag = true
                }
            }
            if (flag == false) {
                let d = {}
                d.productId = productId
                d.quantity = 1
                a.push(d)
                price+=total.price
            }
            let result = await cartModel.findOneAndUpdate({ _id: cart_id }, { $set: { items: a ,totalPrice:price,totalItems:a.length} }, { returnOriginal: false })
            return res.
                status(200).
                send({ status: true, message: "Product Added in the Cart", data: result })
        }
    } catch (error) {
        res.
            status(500).
            send({ status: false, message: error.message })
    }
}



module.exports = { createCart }