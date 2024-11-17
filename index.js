const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const portfolioRoutes = require('./routes/portfolio');
// Initialize the app FIRST
const app = express();
// Use the portfolio routes
app.use('/portfolio', portfolioRoutes);



// Middleware for serving static files
app.use(express.static('public'));

// Import routes AFTER app initialization
const authRoutes = require('./routes/auth'); // Path to auth.js

// Middleware
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded data
app.use(session({
    secret: 'super-secret-key', // Replace with a stronger secret in production
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Set to true in production with HTTPS
}));

// Set the view engine
app.set('view engine', 'ejs');

// Use routes AFTER app is fully configured
app.use('/portfolio', portfolioRoutes); 
app.use('/auth', authRoutes);

// Default route
app.get('/', (req, res) => {
    res.send('Welcome to the Final Project!');
});

// Error Handling Middleware
app.use((req, res, next) => {
    res.status(404).send('Page Not Found');
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

// MongoDB connection and server start
mongoose.connect('mongodb+srv://sabi:Sssabens06@clusterrs.jpxkp.mongodb.net/Final?retryWrites=true&w=majority')
    .then(() => {
        console.log('Connected to MongoDB');
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error);
    });
