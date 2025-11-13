const input = document.getElementById('terminal-input');
const output = document.getElementById('terminal-output');
const display_output = document.querySelector('.output-line');
const main = document.querySelector('.main-1');
const terminal_body = document.querySelector('.terminal-body');
let field_inputs;

(async () => {
    const array_of_elements = ['.org-details']
    await display_admin_menu();

    input.addEventListener('keydown', async (e) => {
        if (e.key !== 'Enter') return;

        const command = input.value.trim();
        if (!command) return;

        input.disabled = true;
        output.innerHTML += `<p class="user-cmd">Entered option: ${command}</p>`;

        try {
            await wait(1000);

            switch (command) {
                case '1':
                    const response = await fetch('/admin/fetch-details', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ command }),
                    });
                    const data = await response.json();
                    const clean_data = cleanData(data);

                    display_output.innerHTML += `
                        <div class="org-details">
                            <h3>Organization Info</h3>
                            <p><strong>Unique ID:</strong> ${clean_data.uniqueId}</p>
                            <p><strong>Organization Name:</strong> ${clean_data.orgName}</p>
                            <p><strong>Branch:</strong> ${clean_data.orgBranch}</p>
                            <p><strong>Type:</strong> ${clean_data.orgType}</p>
                            <p><strong>Address:</strong> ${clean_data.address}</p>
                            <p><strong>Contact:</strong> ${clean_data.orgContact}</p>
                            <p><strong>Email:</strong> ${clean_data.orgEmail}</p>
                            <p><strong>Website:</strong> 
                                <a href="${clean_data.orgWebsite}" target="_blank">${clean_data.orgWebsite}</a>
                            </p>
                            <p><strong>Expected Employees:</strong> ${clean_data.expectedEmployees}</p>
                            <p><strong>Expected Students:</strong> ${clean_data.expectedStudents}</p>
                            <p><strong>Registered Employees:</strong> ${clean_data.registeredEmployees}</p>
                            <p><strong>Registered Students:</strong> ${clean_data.registeredStudents}</p>
                            <p><strong>Terms Check:</strong> ${clean_data.termsCheck}</p>

                            <h3>Admin Info</h3>
                            <p><strong>Name:</strong> ${clean_data.admin[0].adminName}</p>
                            <p><strong>Role:</strong> ${clean_data.admin[0].role}</p>
                            <p><strong>ID:</strong> ${clean_data.admin[0].adminId}</p>
                            <p><strong>Contact:</strong> ${clean_data.admin[0].adminContact}</p>
                            <p><strong>Email:</strong> ${clean_data.admin[0].adminEmail}</p>
                        </div>
                    `;
                    break;

                case '2':
                    
                    break;
                default:
                    output.innerHTML += `<p class="failed-execution">Failed to execute</p>`;
            }
        } catch (err) {
            output.innerHTML += `<p class="failed-execution">Error: ${err.message}</p>`;
        } finally {
            input.disabled = false;
            input.focus();
            input.value = '';
            output.scrollTop = output.scrollHeight;
        }
    });
})();