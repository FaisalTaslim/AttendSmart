const express = require('express');
const path = require('path');
const userLeave = require('../models/userLeave');
const Employee = require('../models/Employee');

const viewsPath = path.join(__dirname, '../views/view-dashboards');

exports.createLeave = async (req, res) => {
    const user = req.session.user.uniqueId;
    const findUser = await Employee.findOne({ uniqueId: user });
    console.log(findUser);

    const {
        leaveStartDate,
        leaveEndDate,
        leaveType,
        reason
    } = req.body;

    if (!findUser) return res.status(404).send("User not found");
    else {
        const fetchOrg = findUser.org;
        const leaveData = {
            org: fetchOrg,
            uniqueId: user,
            startDate: leaveStartDate,
            endDate: leaveEndDate,
            leaveType: leaveType,
            reason: reason,
        };
        const createNewLeave = await userLeave.create(leaveData);
        console.log(`${createNewLeave} created!`);
    }
}