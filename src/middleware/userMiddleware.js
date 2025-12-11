const jwt = require("jsonwebtoken");
const User = require("../models/user");
const redisClient = require("../config/redis");
const userMiddleware = async (req, res, next) => {
    try {
        // console.log("Cookies:", req.cookies);
         const token =   req.cookies?.token ||
      req.body?.token ||
      req.headers?.authorization?.replace("Bearer ", "") ||
      null;
        // console.log("Token:", token);           
        if (!token) {
            throw new Error("Token is not present");
        }
        const payload = jwt.verify(token, process.env.JWT_KEY)
        const { _id } = payload;
        if (!_id) {
            throw new Error("Invalid Token");
        }
        const result = await User.findById(_id);
        if (!result) {
            throw new Error("User Does't Exist");
        }
        const IsBlocked = await redisClient.exists(`token:${token}`);
        if (IsBlocked) {
            throw new Error("Invalid Token");
        }
        req.result = result;
        next();
    }
    catch (error) {
        res.status(401).send("Errors: " + error.message);
    }
}
module.exports = userMiddleware;
