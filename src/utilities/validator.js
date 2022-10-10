const mongoose = require('mongoose')

const isValidEmail = function(email) {
    const regexForEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return regexForEmail.test(email);
};

const isValidPhone = function(phone) {
    const regexForMobile = /^[6-9]\d{9}$/;
    return regexForMobile.test(phone);
};


module.exports = {
    isValidEmail,
    isValidPhone
}