const resolveUserModel = require('../../utils/resolve-user-models');
const validateFields = require('../../utils/validate-fields');

async function verifyRequest(req, Model) {
  const verify = {
    invalidFields: validateFields(Object.values(req.body)),
    authorization: validateFields(Object.values(req.session.user)),
    isValidUser: await Model.findOne({code: req.session.user.code, isDeleted: false, isSuspended: false, 'verification.status': 'verified'}),
  };

  if (!Object.values(verify).every(Boolean)) {
    throw new Error('Face Not Recognized or Invalid User!');
  }

  return verify.isValidUser;
}

exports.registerFace = async (req, res) => {
  const { descriptors } = req.body;
  let state = {user: null, descriptorList: [], invalidDescriptor: null};
  
  try {
    state.user = req.session.user;
    const Model = resolveUserModel(state.user.role);

    state.user = await verifyRequest(req, Model);
    
    state.descriptorList = descriptors;
    state.invalidDescriptor = state.descriptorList.find((d) => !Array.isArray(d) || d.length !== 128 || !d.every((n) => typeof n === 'number'));

    if (state.invalidDescriptor) throw new Error('Invalid request! Every descriptor must be an array of 128 index');

    await Model.updateOne(
      { code: state.user.code },
      {
        $push: {
          'faceData.descriptors': {
            $each: state.descriptorList,
            $slice: -10,
          },
        },
        $set: {
          'setup.faceUploaded': true,
          'setup.done': true,
        },
      },
    );

    return res.json({
      success: true,
      message: 'Face registered successfully',
    });
  } catch (err) {
    return res.status(500).json({ error: 'Face registration failed' });
  }
};