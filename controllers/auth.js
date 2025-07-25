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
        let user;

        if (role === 'Org') {
            user = await Org.findOne({ uniqueId: uniqueID });
            if (!user) return res.redirect('/register');

            const isMatch = await bcrypt.compare(password, user.admin[0].adminPassword);
            if (!isMatch) return res.redirect('/error-login');

            req.session.user = {
                uniqueId: user.uniqueId,
                role: 'Org',
                name: user.admin[0].adminName
            };

            console.log('✅ Logged in Admin user!');
            return res.redirect('/dashboard');
        }

        else if (role === 'SchoolStudent') {
            user = await SchoolStudent.findOne({ uniqueId: uniqueID });
            if (!user) return res.redirect('/register');

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return res.redirect('/error-login');

            req.session.user = {
                uniqueId: user.uniqueId,
                role: 'SchoolStudent',
                name: user.userName
            };
            const rawIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            const ip = rawIP?.split(',')[0].trim();

            const findOrg = await Org.findOne({uniqueId: user.org})

            findOrg.logs.push({
                logType: "loginLogs",
                ipAddress: ip,
                activity: `Student: (${user.userName}, roll: ${user.roll}, divison: ${user.division}) with ip: ${ip} logged in.`,
                timestamp: Date.now()
            });

            await findOrg.save();

            console.log('✅ Logged in School Student!');
            return res.redirect('/dashboard');
        }

        else if (role === 'CollegeStudent') {
            user = await CollegeStudent.findOne({ uniqueId: uniqueID });
            if (!user) return res.redirect('/register');

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return res.redirect('/error-login');

            req.session.user = {
                uniqueId: user.uniqueId,
                role: 'CollegeStudent',
                name: user.userName
            };

            const rawIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            const ip = rawIP?.split(',')[0].trim();

            const findOrg = await Org.findOne({uniqueId: user.org})
            findOrg.logs.push({
                logType: "loginLogs",
                ipAddress: ip,
                activity: `Student: (${user.userName}, roll: ${user.roll}, dept: ${user.dept}) with ip: ${ip} logged in.`,
                timestamp: Date.now()
            });

            await findOrg.save();

            console.log('✅ Logged in College Student!');
            return res.redirect('/dashboard');
        }

        else if (role === 'Employee') {
            user = await Employee.findOne({ uniqueId: uniqueID });
            if (!user) return res.redirect('/register');

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return res.redirect('/error-login');

            req.session.user = {
                uniqueId: user.uniqueId,
                role: 'Employee',
                name: user.userName
            };

            const rawIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            const ip = rawIP?.split(',')[0].trim();

            const findOrg = await Org.findOne({uniqueId: user.org})

            findOrg.logs.push({
                logType: "loginLogs",
                ipAddress: ip,
                activity: `Employee: (${user.userName}, employeeId: ${user.employeeId}, with ip: ${ip} logged in.`,
                timestamp: Date.now()
            });

            await findOrg.save();

            console.log('✅ Logged in Employee!');
            return res.redirect('/dashboard');
        }

    } catch (err) {
        console.error("❌ Login error:", err);
        res.status(500).send("Something went wrong!");
    }
};

module.exports = { auth };