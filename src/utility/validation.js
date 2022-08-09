const validUrl = require('valid-url');

const emptyObject = (object) => {
    return Object.keys(object).length == 0 ? true : false
}

const isEmpty = (val, type = 'string') => {
    if (!val) return true
    if (!val.trim()) return true
    if (typeof val !== type) return true
    return false
}

const notURL = (val) => {
   return !validUrl.isUri(val)
}



module.exports = {
    emptyObject,
    isEmpty,
    notURL
}