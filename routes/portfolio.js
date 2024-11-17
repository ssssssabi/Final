const express = require('express');
const router = express.Router();
const Portfolio = require('../models/Portfolio');
const { checkAdmin } = require('../middleware/accessControl');

// Ensure that only one portfolio item exists (no need for multiple portfolio items)
router.get('/', async (req, res) => {
    try {
        const portfolio = await Portfolio.findOne();  // Get the single portfolio
        res.render('portfolio', { portfolio, user: req.session.user });  // Pass to the portfolio.ejs view
    } catch (error) {
        console.error(error);
        res.status(500).send('Error loading portfolio.');
    }
});

// Show the create/edit portfolio page
router.get('/create', checkAdmin, async (req, res) => {
    try {
        const portfolio = await Portfolio.findOne();  // Get the single portfolio
        res.render('createPortfolio', { portfolio });  // Pass to the form for editing/creating
    } catch (error) {
        console.error(error);
        res.status(500).send('Error loading portfolio edit form.');
    }
});

// Create or update portfolio item
router.post('/create', async (req, res) => {
    try {
        const { title, description, images } = req.body;

        const portfolioData = {
            title,
            description,
            images,  // Images as a string (comma-separated)
            updatedAt: new Date(),
        };

        let portfolio;
        if (await Portfolio.countDocuments() === 0) {
            // If no portfolio exists, create a new one
            portfolio = new Portfolio(portfolioData);
            await portfolio.save();
        } else {
            // Otherwise, update the existing portfolio item
            portfolio = await Portfolio.findOneAndUpdate({}, portfolioData, { new: true });
        }

        res.redirect('/portfolio');  // Redirect back to portfolio page
    } catch (error) {
        console.error(error);
        res.status(500).send('Error creating or updating portfolio.');
    }
});

// Delete portfolio item (admin only)
router.post('/delete/:id', checkAdmin, async (req, res) => {
    try {
        await Portfolio.findByIdAndDelete(req.params.id);
        res.redirect('/portfolio');  // Redirect after deletion
    } catch (error) {
        console.error(error);
        res.status(500).send('Error deleting portfolio item.');
    }
});

module.exports = router;
