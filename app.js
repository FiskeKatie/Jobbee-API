const express = require('express');
const app = express();

const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');

const connectDatabase = require('./config/database');
const errorMiddleware = require('./middlewares/errors');
const ErrorHandler = require('./utils/errorHandler');


//setting up config.env files variables
dotenv.config({path : './config/config.env'})

//Handling uncaught exception MAKE SURE IT'S AT THE TOP 
process.on('uncaughtException', err => {
    console.log(`ERROR: ${err.message}`);
    console.log('Shutting down due to uncaught exception.')
        process.exit(1);
})

//connecting to database
connectDatabase();

//set up body parser
app.use(express.json());

//Set cookie parser
app.use(cookieParser());

//Handle file uploads
app.use(fileUpload());


//Importing all routes config\routes\jobs.js
const jobs = require('./routes/jobs');
const auth = require('./routes/auth');
const user = require('./routes/user');


app.use('/api/v1',jobs);
app.use('/api/v1',auth);
app.use('/api/v1',user);


//Handles unhandled routes
app.all('*', (req, res, next) => {
    next(new ErrorHandler(`${req.originalUrl} route not found`, 404));
});

//Middleware to handlle errors
app.use(errorMiddleware);

const PORT = process.env.PORT;
const server = app.listen(PORT, ()=> {
    console.log(`server started on port ${process.env.PORT} in ${process.env.NODE_ENV}mode.`);
});

//Handling Unhandled Promise Rejection
process.on('unhandledRejection', err => {
    console.log(`Error: ${err.message}`);
    console.log('Shutting down the server due to unhandled promise rejection.')
    server.close( () => {
        process.exit(1);
    })
});