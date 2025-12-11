const express = require('express')
const app = express();
require('dotenv').config();
const main = require('./src/config/db')
const cookieParser = require('cookie-parser');
const authRouter = require('./src/routes/userAuth');
const redisClient = require('./src/config/redis');
const problemRouter = require('./src/routes/problemCreator');
const submitRouter = require('./src/routes/submit');
const cors = require('cors');
const aiRouter = require('./src/routes/aiChatting');
const videoRouter = require('./src/routes/videoCreator');

app.use(cors({
    origin: ['http://localhost:5173', 'https://codeshaala-frontend.vercel.app'],
    credentials: true
}));


app.use(express.json());
app.use(cookieParser());

app.use('/user',authRouter)
app.use('/problem',problemRouter)
app.use('/submission',submitRouter)
app.use('/ai', aiRouter);
app.use('/video', videoRouter);



const InitalizeConnection = async ()=>{
    try{     

        await Promise.all([main(),redisClient.connect()]);
        console.log("DB and RedisDB Connected");
        
        app.listen(process.env.PORT, ()=>{
            console.log("Server listening at port number: "+ process.env.PORT);
        })

    }
    catch(err){
        console.log("Error: "+err);
    }
}


InitalizeConnection();


// main().then(async ()=>{
//     app.listen(port, ()=>{
//         console.log("Server Listening at port number: " + port);
//     })
// })
// .catch(err=> console.log("error occured: "+err))