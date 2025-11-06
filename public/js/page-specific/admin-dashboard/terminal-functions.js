function display_admin_menu() {
    return new Promise((resolve) => {
        const display_features = [
            'What would you like to perform?',
            '1. View Account Info',
            '2. Generate Qr',
            `3. Start Student's Session`,
            '4. Edit Attendance',
            '5. View Attendance Records',
            '6. Manage Users',
            '7. Manage Leave Request',
            '8. View Logs',
            '9. Clear Logs',
            '10. Send Notice',
        ];

        output.innerHTML += `<div id="terminal-menu"></div>`;
        const menu = document.getElementById('terminal-menu');

        display_features.forEach((feature, index) => {
            setTimeout(() => {
                menu.innerHTML += `<p class='option-${index + 1}'>${feature}</p>`;
                menu.scrollTop = menu.scrollHeight;

                if (index === display_features.length - 1)
                    resolve(true);

            }, index * 400);
        });
    });
}

const wait = (ms) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(true);
        }, ms);
    });
};