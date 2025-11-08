const input = document.getElementById('terminal-input');
const output = document.getElementById('terminal-output');

(async () => {
    await display_admin_menu();

    input.addEventListener('keydown', async (e) => {
        if (e.key === 'Enter') {
            const command = input.value.trim();
            if (!command) return;

            output.innerHTML += `<div class="user-cmd">Performing option ${command}...</div>`;
            await wait(2000);

            switch (command) {
                case "1":
                    await fetch('/dashboard/admin', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'text/plain'
                        },
                        body: command
                    });
        
                    break;
                default:
                    output.innerHTML += `<p class="failed-execution">Failed to execute</p>`
            }

            input.value = '';
            output.scrollTop = output.scrollHeight;
        }
    });
})();