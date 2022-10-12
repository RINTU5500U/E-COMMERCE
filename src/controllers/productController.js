const mongoose = require("mongoose")
const aws = require("../utilities/aws")
const productModel = require("../models/productModel")
const { isValidName, isValidPrice, isValidAddress, isValidInstallments, isValidProfile } = require("../utilities/validator")

const createProduct = async function (req, res) {
    try {

        let reqbody = req.body
        let files = req.files

        if (Object.keys(reqbody).length == 0)
            return res.
                status(400).
                send({ status: false, message: "Data is required inside request body" })
        
        let { title, description, price, currencyId, currencyFormat, isFreeShipping, productImage, style, availableSizes, installments, ...a } = reqbody
        
        if (Object.keys(a).length > 0)
            return res.
                status(400).
                send({ status: false, message: "invalid data entry inside the request body" })
        
        if (!title)
            return res.
                status(400).
                send({ status: false, message: "title is required" })
        
        if (!isValidName(title))
            return res.
                status(400).
                send({ status: false, message: "title is not valid" })
        
        if (!description)
            return res.
                status(400).
                send({ status: false, message: "description is required" })
        
        if (!isValidName(description))
            return res.
                status(400).
                send({ status: false, message: "description is not valid" })
        
        if (!price)
            return res.
                status(400).
                send({ status: false, message: "price is required" })
        
        if (!isValidPrice(price))
            return res.
                status(400).
                send({ status: false, message: "price is not valid" })
        
        if (currencyId) {
            if (currencyId != "INR")
                return res.
                    status(400).
                    send({ status: false, message: "currencyId must be INR" })
        }
        
        if (currencyFormat) {
            if (currencyFormat != 'Rs')
                return res.
                    status(400).
                    send({ status: false, message: "currencyformate must be 'Rs' formate" })
        }
        
        if (isFreeShipping) {
            if (!(isFreeShipping == false.toString() || isFreeShipping == true.toString()))
                return res.
                    status(400).
                    send({ status: false, message: "isfreeshipping contain only boolean value" })
        }
        
        if (files && files.length > 0) {
            req.link = await aws.uploadFile(files[0])
        } else
            return res.
                status(400).
                send({ status: false, message: "profile image is required" })

        if (!isValidProfile(files[0].originalname))
            return res.
                status(400).
                send({ status: false, msg: "plz provide profileImage in (jpg|png|jpeg) formate" })
        
        if (!style)
            return res.
                status(400).
                send({ status: false, message: "style is missing" })
        
        if (!isValidName(style))
            return res.
                status(400).
                send({ status: false, message: "style is invalid" })
        
        if (!availableSizes)
            return res.
                status(400).
                send({ status: false, message: "availableSizes is missing" })
        
        availableSizes = JSON.parse(availableSizes)        
        
        if (!isValidAddress((availableSizes)))
            return res.
                status(400).
                send({ status: false, message: "availabelSizes contains Array of String value" })
        
        let arr = ["S", "XS", "M", "X", "L", "XXL", "XL"]
        for (let i = 0; i < availableSizes.length; i++) {
            if (availableSizes[i] == ",")
                continue
            else {
                if (!arr.includes(availableSizes[i]))
                    return res.
                        status(400).
                        send({ status: false, message: `availableSizes can contain only these value [${arr}]` })
            }
        }
        
        if (!installments)
            return res.
                status(400).
                send({ status: false, message: "installments is missing" })
        
        if (!isValidInstallments(installments))
            return res.
                status(400).
                send({ status: false, message: "installment is not valid" })
        
        let data = await productModel.findOne({ title: title })
        if (data != null)
            return res.
                status(409).
                send({ status: false, message: "this title is already present" })
        
        let obj = {
            title: reqbody.title,
            description: description,
            price: price,
            currencyId: reqbody.currencyId ? currencyId : "INR",
            currencyFormat: reqbody.currencyFormat ? currencyFormat : "rs",
            isFreeShipping: isFreeShipping ? isFreeShipping : false,
            productImage: req.link,
            style: style,
            availableSizes: availableSizes,
            installments: installments
        }
        let result = await productModel.create(obj)
        res.
            status(201).
            send({ status: true, message: "product has created successfully", data: result })
    } catch (error) {
        res.
            status(500).
                send({ status: false, message: error.message })
    }
}


module.exports = { createProduct }