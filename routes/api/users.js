const express = require('express');
const router = express.Router();
const { check, validationResult } = require("express-validator");
const User = require('../../models/User');
const gravator = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');

// @route   POST api/users
// @desc    Register User
// @access  Public
router.post('/', [
    check('name', 'Name is requires').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'please enter a password with at least 6 characters').isLength({
        min: 6
    })
], async (req, res) => {
    const errors = validationResult(req);
    if (! errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }
    

    const { name, email, password } = req.body;

    try {

    // See if user exits
    let user = await User.findOne({email});

    if(user){
        return res.status(400).json({errors: [{msg: "User already exists"}] });
    }

    // Get user gravator
    const avatar = gravator.url(email, {
        s: '200', //size
        r: 'pg', //rating
        d: 'mm' //default -> default image
    })

    user = new User({
        name,
        email,
        avatar,
        password
    });
    
    // encrypt the password
    const salt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    // Return jsonWebToken  
    const payload = {
        user:{
            id: user.id    
        }
    }

    jwt.sign(payload, 
        config.get('jwtSecret'),
        {expiresIn: 360000},
        (err, token) => {
            if(err) throw err;
            res.json({token})
        });
    }catch(err){
        console.log(err);
        res.status(500).send('Server Error');
    }
    
});

module.exports = router;