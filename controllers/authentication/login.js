const bcrypt = require("bcrypt");
const resolveUserModel = require("../../utils/resolve-user-models");
const validateFields = require("../../utils/validate-fields");

const { loginLog } = require("../../services/create/logs");

function verifyRequest(req) {
  const verify = {
    invalidFields: validateFields(Object.values(req.body)),
  };

  if (!Object.values(verify).every(Boolean)) {
    throw new Error('Incorrect password or missing fields!');
  }
}

function processData(req) {
  const object = { search: null };

  object.search = {
    code: req.body.code,
    isSuspended: false,
    isDeleted: false,
    "verification.status": 'verified',
  };

  return object.search;
}

exports.login = async (req, res) => {
  let state = { Model: null, authorize: null };
  let object = { user: null, search: null, log: null, params: null };
  const { code, role, password } = req.body;

  try {
    verifyRequest(req);
    state.Model = resolveUserModel(role);
    object.search = processData(req);
    object.user = await state.Model.findOne(object.search);

    if (!object.user) throw new Error('User not Found');

    if (role === "admin") {
      for (const admin of object.user.admin) {
        if (await bcrypt.compare(password, admin.password)) {
          state.authorize = admin;
          break;
        }
      }
      if (!state.authorize) throw new Error('Incorrect password');
    } else {
      state.authorize = await bcrypt.compare(password, object.user.password);
      if (!state.authorize) throw new Error('Incorrect password');
    }

    object.log = {
      type: 'success',
      org: role === 'admin' ? code : object.user.org,
      id: code,
      name: role === 'admin' ? state.authorize.name : object.user.name,
      role,
      message: 'Logged in successfully!',
    };

    await loginLog(object.log);

    req.session.user = {
      code,
      name: role === 'admin' ? state.authorize.name : object.user.name,
      role,
    };

    await new Promise((resolve, reject) => {
      req.session.save((err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    res.redirect('/dashboard');

  } catch (err) {
    object.log = {
      type: 'failed',
      org: object.user?.org ?? null,
      id: code,
      name: object.user?.name ?? null,
      role: role ?? null,
      message: err.message ?? 'Login failed',
    };

    if (role !== 'admin') await loginLog(object.log);

    object.params = new URLSearchParams({
      "popup-type": 'error',
      "popup-message": err.message || 'Registration failed. Please try again.',
    });

    return res.redirect(`/app?${object.params}`);
  }
};
