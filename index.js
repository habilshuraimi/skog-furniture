import express from "express";
import mongoose from "mongoose";
import session from "express-session";
import bodyParser from "body-parser";
import nocache from "nocache";
import passport from "passport";
import { initializingPassport } from "./middleware/google.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(nocache());

// Creating session
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());
initializingPassport(passport); // Ensure this initializes passport strategies

// Import routes
import userRoute from "./routers/userRoute.js";
import adminRoute from "./routers/adminRoute.js";

// Use routes
app.use('/', userRoute);
app.use('/admin', adminRoute);

// Connect to MongoDB
mongoose.connect(process.env.MONGO, { serverSelectionTimeoutMS: 5000 })
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch(err => {
        console.error("Error connecting to MongoDB", err.message);
        console.error("Error details:", err);
        process.exit(1); // Exit the process if connection fails
    });

// Listen for connection errors after initial connection
mongoose.connection.on('error', err => {
    console.error("MongoDB connection error:", err.message);
});
// Google OAuth routes
app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback', 
    passport.authenticate('google', { failureRedirect: '/login' }), 
    function(req, res) {
        // Successful authentication, redirect home.
        res.redirect('/');
    });

// Start the server
const port = 9889;
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});




