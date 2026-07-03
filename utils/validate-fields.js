function validateFields(array) {
    for (const field of array) {
        if (!field)
            return false;
    }
    return true;
}

module.exports = validateFields;