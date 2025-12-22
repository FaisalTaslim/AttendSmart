function verifyDomains(email) {
    const freeEmailDomains = [
        "yahoo.com",
        "outlook.com",
        "hotmail.com"
    ];

    return !freeEmailDomains.some(domain =>
        email.endsWith(domain)
    );
}

module.exports = verifyDomains;