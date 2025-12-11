const validate = require("../utils/validator");
const User = require("../models/user");
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken");
const redisClient = require("../config/redis");
const Submission = require('../models/submission')

const register = async (req, res) => {
    try {
        //validators the data: 
        console.log("Request body:", req.body);

        validate(req.body);
        const { firstName, emailId, password } = req.body;

        req.body.password = await bcrypt.hash(password, 10);
        req.body.role = 'user';

        const user = await User.create(req.body);
        const token = jwt.sign({ _id: user._id, emailId: emailId, role: 'user' }, process.env.JWT_KEY, { expiresIn: 60 * 60 })
        res.cookie('token', token, {
            maxAge: 60 * 60 * 1000,
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            domain: '.vercel.app',
        })
        const reply = {
            firstName: user.firstName,
            emailId: user.emailId,
            _id: user._id,
            role: user.role,
        }
        res.status(201).json({
            user: reply,
            message: "Register Succesfully",
            token
        })
    } catch (error) {
        console.log("error",error)
        res.status(400).json({ message: error.message });
        // console.log("asdf")
    }
}

const login = async (req, res) => {

    try {
        const { emailId, password } = req.body;

        if (!emailId)
            throw new Error("Invalid Credentials");
        if (!password)
            throw new Error("Invalid Credentials");

        const user = await User.findOne({ emailId });

        const match = await bcrypt.compare(password, user.password);

        if (!match)
            throw new Error("Invalid Credentials");

        const reply = {
            firstName: user.firstName,
            emailId: user.emailId,
            _id: user._id,
            role: user.role,
        }

        const token = jwt.sign({ _id: user._id, emailId: emailId, role: user.role }, process.env.JWT_KEY, { expiresIn: 60 * 60 });
        res.cookie('token', token, {
            maxAge: 60 * 60 * 1000,
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            domain: '.vercel.app',
        })
        res.status(201).json({
            user: reply,
            message: "Loggin Successfully",
            token
        })
    }
    catch (err) {
        res.status(401).send("Error: " + err);
    }
}

const logout = async (req, res) => {
    try {
        const { token } = req.cookies;

        const payload = jwt.decode(token);

        await redisClient.set(`token:${token}`, 'Blocked')
        await redisClient.expireAt(`token:${token}`, payload.exp);

        res.cookie("token", null, new Date(Date.now()));
        res.send("Logged Out Successfull");

    } catch (error) {
        res.status(503).send("Error: " + error)
    }
}

const adminRegister = async (req, res) => {
    try {
        // validate the data;
        //   if(req.result.role!='admin')
        //     throw new Error("Invalid Credentials");  
        validate(req.body);
        const { firstName, emailId, password } = req.body;

        req.body.password = await bcrypt.hash(password, 10);
        req.body.role = 'admin';

        const user = await User.create(req.body);
        const token = jwt.sign({ _id: user._id, emailId: emailId, role: user.role }, process.env.JWT_KEY, { expiresIn: 60 * 60 });
        res.cookie('token', token, {
            maxAge: 60 * 60 * 1000,
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            domain: '.vercel.app',
        })
        res.status(201).send("User Registered Successfully");
    }
    catch (err) {
        res.status(400).send("Error: " + err);
    }
}
const deleteProfile = async (req, res) => {

    try {
        const userId = req.result._id;

        // userSchema delete
        await User.findByIdAndDelete(userId); // YE BEHIND THE SCHENE findOneAndDelete HI KAAM KRTA HAI .

        //submissionSchema se bhi delete krna hoga  

        //  await Submission.deleteMany(userId);  SUNO SUNO SUNO ISKA ALTERNATE METHOD USERSCHEMA ME HAI LAST ME DKEHO JAAKE ..

        res.status(200).send("Deleted Succuessfully")
    } catch (error) {
        res.status(500).send("Internal Server Error")
    }
}

module.exports = { register, login, logout, adminRegister, deleteProfile };       