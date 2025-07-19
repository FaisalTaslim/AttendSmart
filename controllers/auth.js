const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const SchoolStudent = require('../models/SchoolStudent');
const CollegeStudent = require('../models/CollegeStudent');
const Org = require('../models/Org');
const Employee = require('../models/Employee');

const auth = async (req, res) => {
    try {
        const {
            uniqueID,
            userRole,
            password
        } = req.body;

        const role = userRole;
        if (role === 'Org') {
            const findInOrg = await Org.findOne({ uniqueId: uniqueID });
            if (!findInOrg)
                res.redirect('/register');
            else {
                const isMatch = await bcrypt.compare(password, findInOrg.admin[0].adminPassword);

                if (!isMatch)
                    res.redirect('/error-login');
                else
                    console.log('Logged in Admin user!');
            }
        }
        else if (role === 'SchoolStudent') {
            const findSchoolStudent = await SchoolStudent.findOne({ uniqueId: uniqueID });

            if (!findSchoolStudent)
                res.redirect('/register');
            else {
                const isMatch = await bcrypt.compare(password, findSchoolStudent.password);
                if (!isMatch)
                    res.redirect('/error-login');
                else
                    console.log('Logged in Student User!');
            }
        }
        else if (role === 'CollegeStudent') {
            const findCollegeStudent = await CollegeStudent.findOne({ uniqueId: uniqueID });

            if (!findCollegeStudent)
                res.redirect('/register');
            else {
                const isMatch = await bcrypt.compare(password, findCollegeStudent.password);
                if (!isMatch)
                    res.redirect('/error-login');
                else
                    console.log('Logged in College User!');
            }
        }
        else {
            const findEmployee = await Employee.findOne({ uniqueId: uniqueID });

            if (!findEmployee)
                res.redirect('/register');
            else {
                const isMatch = await bcrypt.compare(password, findEmployee.password);
                if (!isMatch)
                    res.redirect('/error-login');
                else
                    console.log('Logged in Employee User!');
            }
        }
    } catch (err) {
        console.error("❌ Login error:", err);
        res.status(500).send("Something went wrong!");
    }
}

module.exports = {auth};