const Org = require("../../models/users/organization");
const resolveUserModel = require("../../utils/resolve-user-models");

async function updateAdmin(code, data, service, session) {
  try {
    if (typeof data !== "object" || data === null) {
      throw new Error("Invalid data sent for updation!");
    }

    if (service == "normal") {
      return await Org.findOneAndUpdate({ code }, { $set: data }, { new: true });
    } else if (service == "pushAdmin") {
      Model.findOneAndUpdate(
        { code },
        { $push: { admin: data } },
        { new: true },
      );
    }
  } catch (err) {
    throw err;
  }
}

module.exports = { updateAdmin };