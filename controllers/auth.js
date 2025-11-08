const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const SchoolStudent = require('../models/SchoolStudent');
const CollegeStudent = require('../models/CollegeStudent');
const Org = require('../models/Org');
const Employee = require('../models/Employee');
const Logs = require('../models/logs')
const moment = require('moment');

const auth = async (req, res) => {
    try {
        const { uniqueID, userRole, password } = req.body;
        const role = userRole;
        let user;

        let orgId = null;

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

            orgId = user.uniqueId;

            console.log('✅ Logged in Admin user!');
            return res.redirect('/dashboard/admin');
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

            orgId = user.org;

            console.log('✅ Logged in School Student!');
            return res.redirect('/dashboard/school-student');
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

            orgId = user.org;

            console.log('✅ Logged in College Student!');
            return res.redirect('/dashboard/college-student');
        }

        else if (role === 'Employee') {
            user = await Employee.findOne({ uniqueId: uniqueID });
            const org = Org.findOne({org: user.org});

            if (!user) return res.redirect('/register');

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return res.redirect('/error-login');

            req.session.user = {
                uniqueId: user.uniqueId,
                role: 'Employee',
                name: user.userName
            };

            orgId = user.org;

            console.log('✅ Logged in Employee!');
            if(org.orgType == 'school' || org.orgType == 'college')
                return res.redirect('/dashboard/teacher');
            else
                return res.redirect('/dashboard/employee');
        }

        if (orgId) {
            const logDoc = await Logs.findOne({ org: orgId });
            if (logDoc) {
                const ip =
                    req.headers['x-forwarded-for']?.split(',')[0] ||
                    req.connection?.remoteAddress ||
                    req.socket?.remoteAddress ||
                    req.ip ||
                    '0.0.0.0';

                logDoc.loginLogs.push({
                    userId: user.uniqueId,
                    userName: req.session.user.name,
                    role: req.session.user.role,
                    ip,
                    at: moment().format("DD-MM-YYYY HH:mm:ss"),
                });

                await logDoc.save();
                console.log(`📥 Login log saved for ${req.session.user.name} (${role})`);
            } else {
                console.log("⚠️ No log document found for this organization.");
            }
        }

    } catch (err) {
        console.error("❌ Login error:", err);
        res.status(500).send("Something went wrong!");
    }
};

module.exports = { auth };