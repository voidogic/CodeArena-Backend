const validator = require("validator")


const validate = (data) =>{

    const mandatoryfield = ['firstName','emailId','password'];
    
    const IsAllowed = mandatoryfield.every((k)=> Object.keys(data).includes(k));

    if(!IsAllowed)
        throw new Error("Some Field Missing");

    if(!validator.isEmail(data.emailId))
        throw new Error("Invalid Email");

    if(!validator.isStrongPassword(data.password))
        throw new Error("Weak Password");
}

module.exports = validate;