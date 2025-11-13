function display_admin_menu() {
    return new Promise((resolve) => {
        const display_features = [
            'What would you like to perform?',
            '1. View Account Information',
            '2. Edit Account Information',
            '3. Generate Qr',
            `4. Start Student's Session`,
            '5. Edit Attendance',
            '6. View Attendance Records',
            '7. Manage Users',
            '8. Manage Leave Request',
            '9. View Logs',
            '10. Clear Logs',
            '11. Send Notice',
        ];

        output.innerHTML += `<div id="terminal-menu"></div>`;
        const menu = document.getElementById('terminal-menu');

        display_features.forEach((feature, index) => {
            setTimeout(() => {
                menu.innerHTML += `<strong class='option-${index + 1}'>${feature}</strong>`;
                menu.scrollTop = menu.scrollHeight;

                if (index === display_features.length - 1)
                    resolve(true);

            }, index * 400);
        });
    });
}

function cleanData(obj) {
    const excludeKeys = ['_id', '__v', 'createdAt', 'updatedAt', 'adminPassword'];

    const clean = (item) => {
        if (Array.isArray(item)) return item.map(clean);
        if (typeof item === 'object' && item !== null) {
            return Object.fromEntries(
                Object.entries(item)
                    .filter(([key]) => !excludeKeys.includes(key))
                    .map(([key, value]) => [key, clean(value)])
            );
        }
        return item;
    };

    return clean(obj);
}

function removeElements(selectors) {
    selectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => el.remove());
    });
}


const wait = (ms) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(true);
        }, ms);
    });
};