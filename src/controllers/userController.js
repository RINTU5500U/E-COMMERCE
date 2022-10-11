const mongoose = require("mongoose")
const userModel = require("../models/userModel")
const aws = require("../utilities/aws")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

const { isValidEmail, isValidProfile, isValidName, isValidPhone, isValidPassword, isValidPincode,isValidAddress, isValidInputValue, isValidStreet, isValidObjectId, isValidInputBody } = require("../utilities/validator")

const registerUser = async function (req, res) {
    try {
        let reqbody = req.body
        let files = req.files
        if (files && files.length > 0) {
            req.uplodeLink = await aws.uploadFile(files[0])
        } else
            return res.
                status(400).
                send({ status: false, msg: "invalid request" })
        if (Object.keys(reqbody).length == 0)
            return res.
                status(400).
                send({ status: false, message: "data is required" })

        let { fname, lname, email, phone, password, address, ...rest } = reqbody
        if (Object.keys(rest).length > 0)
            return res.
                status(400).
                send({ status: false, message: "invalid data entry" })
        if (!fname)
            return res.
                status(400).
                send({ status: false, message: "fname is required" })
        if (!isValidName(fname))
            return res.
                status(400).
                send({ status: false, message: "fname is invalid or empty" })
        if (!lname)
            return res.
                status(400).
                send({ status: false, message: "lname is required" })
        if (!isValidName(lname))
            return res.
                status(400).
                send({ status: false, message: "lname is invalid or empty" })
        if (!email)
            return res.
                status(400).
                send({ status: false, message: "email is required" })
        if (!isValidEmail(email))
            return res.
                status(400).
                send({ status: false, message: "email is empty or invalid" })
        if (!files[0].mimetype)
            return res.
                status(400).
                send({ status: false, message: "profileImage is required" })
        if (!isValidProfile(files[0].originalname))
            return res.
                status(400).
                send({ status: false, msg: "plz provide profileImage in (jpg|png|jpeg) formate" })

        if (!phone)
            return res.
                status(400).
                send({ status: false, message: "phone is required" })
        if (!isValidPhone(phone))
            return res.
                status(400).
                send({ status: false, message: "phone no is not valid" })
        if (!password)
            return res.
                status(400).
                send({ status: false, message: "password is required" })
        if (!isValidPassword(password))
            return res.
                status(400).
                send({ status: false, message: "invalid password" })
        // if (!isValidInputValue(address)) {
        //     return res
        //         .status(400)
        //         .send({ status: false, message: "address is required" });
        // }

        if (!isValidAddress(address)) {
            return res
                .status(400)
                .send({ status: false, message: "Invalid address" });
        }

        //const { shipping, billing } = address;
        if (!isValidAddress(address.shipping)) {
            return res
                .status(400)
                .send({ status: false, message: "Shipping address is required" });

        } else {

            //let { street, city, pincode } = shipping;
            if (!isValidInputValue(address.shipping.street)) {
                return res.status(400).send({
                    status: false,
                    message: "Shipping address: street name is required ",
                });
            }

            if (!isValidInputValue(address.shipping.city)) {
                return res.status(400).send({
                    status: false,
                    message: "Shipping address: street name is required ",
                });
            }

            if (!isValidPincode(address.shipping.pincode)) {
                return res.status(400).send({
                    status: false,
                    message: "Shipping address: pin code is required and valid",
                });
            }

        }
        if (!isValidAddress(address.billing)) {
            return res
                .status(400)
                .send({ status: false, message: "Billing address is required" });

        } else {

            //let { street, city, pincode } = billing;

            if (!isValidInputValue(address.billing.street)) {
                return res.status(400).send({
                    status: false,
                    message: "Billing address: street name is required ",
                });
            }
            
            if (!isValidInputValue(address.billing.city)) {
                return res.status(400).send({
                    status: false,
                    message: "Shipping address: street name is required ",
                });
            }
            if (!isValidPincode(address.billing.pincode)) {
                return res.status(400).send({
                    status: false,
                    message: "Billing address: pin code should be valid like: 335659 ",
                });
            }
            
        }
        const salt = await bcrypt.genSalt(10);
        const encryptedPassword = await bcrypt.hash(password, salt);
        let obj = {
            fname: reqbody.fname,
            lname: reqbody.lname,
            email: reqbody.email,
            profileImage: req.uplodeLink,
            phone: reqbody.phone,
            password: encryptedPassword,
            address: reqbody.address
        }
        
        let result = await userModel.create(obj)
        return res.
            status(201).
            send({ status: true, message: "succesefully created", data: obj })
    } catch (error) {
        res.
            status(500).
            send({ status: false, msg: error.message })
    }
}

//**********************************************USER LOGIN*************************************************** */

const userLogin = async function (req, res) {

    try {

        const queryParams = req.query;
        const requestBody = req.body;

        //no data is required from query params
        if (isValidInputBody(queryParams)) {
            return res.status(404).send({ status: false, message: "Page not found" });
        }

        if (!isValidInputBody(requestBody)) {
            return res.status(400).send({
                status: false,
                message: "User data is required for login",
            });
        }

        const userName = requestBody.email;
        const password = requestBody.password;

        if (!isValidInputValue(userName) || !isValidEmail(userName)) {
            return res
                .status(400)
                .send({ status: false, message: "email is required and should be a valid email" });
        }


        if (!isValidInputValue(password) || !isValidPassword(password)) {
            return res
                .status(400)
                .send({ status: false, message: "password is required and should contain 8 to 15 characters and must contain one letter and digit" });
        }

        // finding user by given email
        const userDetails = await userModel.findOne({ email: userName });

        if (!userDetails) {
            return res
                .status(404)
                .send({ status: false, message: "No user found by email" });
        }

        // comparing hashed password and login password
        const isPasswordMatching = await bcrypt.compare(
            password,
            userDetails.password
        );

        if (!isPasswordMatching) {
            return res
                .status(400)
                .send({ status: false, message: "incorrect password" });
        }

        // creating JWT token
        const payload = { userId: userDetails._id };
        const expiry = { expiresIn: "1800s" };
        const secretKey = "group31project5";

        const token = jwt.sign(payload, secretKey, expiry);

        // setting bearer token in response header
        res.header("Authorization", "Bearer " + token);

        const data = { userId: userDetails._id, token: token };

        res
            .status(200)
            .send({ status: true, message: "login successful", data: data });

    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};


module.exports = { registerUser, userLogin }