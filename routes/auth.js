const express = require('express');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const User = require('../models/User');

const router = express.Router();

router.get('/register', (req, res) => {
    res.render('register');
});

router.post('/register', async (req, res) => {
    try {
        const { username, email, password, firstName, lastName, age, gender } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const secret = speakeasy.generateSecret({ name: `FinalApp (${username})` });

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            firstName,
            lastName,
            age,
            gender,
            role: username === 'Sabina' ? 'admin' : 'editor',
            twoFactorSecret: secret.base32,
        });

        await newUser.save();

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'your-email@gmail.com',
                pass: 'your-app-password',
            },
        });

        const mailOptions = {
            from: 'your-email@gmail.com',
            to: email,
            subject: 'Welcome to FinalApp',
            text: `Welcome, ${firstName}! Your 2FA secret is ${secret.base32}`,
        };

        await transporter.sendMail(mailOptions);

        const qrCodeDataUrl = await qrcode.toDataURL(secret.otpauth_url);
        res.render('2fa-setup', { qrCodeDataUrl });
    } catch (err) {
        console.error(err);
        res.status(500).send('Something went wrong!');
    }
});

router.get('/login', (req, res) => {
    res.render('login');
});

router.post('/login', async (req, res) => {
    try {
        const { username, password, twoFactorCode } = req.body;
        const user = await User.findOne({ username });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).send('Invalid username or password.');
        }

        if (user.twoFactorSecret) {
            const verified = speakeasy.totp.verify({
                secret: user.twoFactorSecret,
                encoding: 'base32',
                token: twoFactorCode,
            });

            if (!verified) {
                return res.status(401).send('Invalid 2FA code.');
            }
        }

        req.session.user = { username: user.username, role: user.role };
        res.redirect('/portfolio');
    } catch (err) {
        console.error(err);
        res.status(500).send('Something went wrong!');
    }
});

module.exports = router;
