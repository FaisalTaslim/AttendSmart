const input = document.getElementById("terminal-input");
const output = document.getElementById("terminal-output");
const featureList = ['$edit'];

input.addEventListener("keydown", function (e) {
    if (e.key !== "Enter") return;
    const command = input.value.trim();
    input.value = "";
    output.textContent += `\n> ${command}`;
    const storeCode = command.split(" ");
    let proceed = true;

    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function task1() {
        if (!command) {
            output.textContent += "\nPlease enter a command";
            return;
        }

        await delay(1000);
        output.textContent += "\nVerifying the code...";
        if (storeCode.length !== 9) {
            output.textContent += "\nError: Invalid code length. Follow the code guidelines.";
            proceed = false;
            return;
        }

        await delay(1000);
        output.textContent += "\nVerifying the feature...";
        if (!featureList.includes(storeCode[0])) {
            output.textContent += "\nError: Feature doesn't exist. Follow the code guidelines.";
            proceed = false;
            return;
        }
        output.textContent += `\nFound feature: ${storeCode[0].substring(1)}`;

        await delay(1000);
        output.textContent += "\nVerifying code syntax...";
        if ((storeCode[1] !== 'std' && storeCode[1] !== 'emp') ||
            (storeCode[2] !== 'monthly' && storeCode[2] !== 'final')) {
            output.textContent += "\nError: Syntax error at position 1 or 2";
            proceed = false;
            return;
        }

        await delay(1000);
        output.textContent += "\nVerifying the IDs...";
        const idsInput = storeCode[3];

        if (idsInput.toLowerCase() === 'all') {
            output.textContent += "\nIDs verified: all (applies to all records)";
        } else {
            const validIds = /^(\d+,)*\d+$/.test(idsInput);
            if (!validIds) {
                output.textContent += "\nError: Invalid IDs. Only numbers separated by commas or 'all' allowed.";
                proceed = false;
                return;
            }
            output.textContent += "\nIDs verified: " + idsInput;
        }

        await delay(1000);
        output.textContent += "\nVerifying names...";
        const namesInput = storeCode[4];
        const validNames = /^([a-zA-Z]+,)*[a-zA-Z]+$/.test(namesInput);

        if (!validNames) {
            output.textContent += "\nError: Invalid names. Only letters separated by commas are allowed.";
            proceed = false;
            return;
        }
        output.textContent += "\nNames verified: " + namesInput;

        await delay(1000);
        output.textContent += "\nVerifying subjects...";
        const subjectsInput = storeCode[5];

        if (storeCode[1] === 'emp') {
            if (subjectsInput.toLowerCase() !== 'null') {
                output.textContent += "\nError: Employees must have 'null' for subject field.";
                proceed = false;
                return;
            }
            output.textContent += "\nSubjects verified: null (employee record)";
        } else {
            const validSubjects = /^([a-zA-Z]+,)*[a-zA-Z]+$/.test(subjectsInput);
            if (!validSubjects) {
                output.textContent += "\nError: Invalid subjects. Only letters separated by commas are allowed, or 'null' for employees.";
                proceed = false;
                return;
            }
            output.textContent += "\nSubjects verified: " + subjectsInput;
        }

        await delay(1000);
        output.textContent += "\nVerifying totalDays, attendedDays, and leaveDays...";
        const totalDays = storeCode[6];
        const attendedDays = storeCode[7];
        const leaveDays = storeCode[8];

        if (isNaN(totalDays) || isNaN(attendedDays) || isNaN(leaveDays)) {
            output.textContent += "\nError: totalDays, attendedDays, and leaveDays must be numbers.";
            proceed = false;
            return;
        }

        output.textContent += `\ntotalDays increment: ${totalDays}\nattendedDays increment: ${attendedDays}\nleaveDays: ${leaveDays}`;
    }

    async function task2() {
        output.textContent += "\nCommand verified successfully! Ready to execute.";

        const sendCommandData = {
            "function": storeCode[0],
            "userType": storeCode[1],
            "summaryType": storeCode[2],
            "ids": storeCode[3],
            "names": storeCode[4],
            "subjects": storeCode[5],
            "totalDays": storeCode[6],
            "attendedDay": storeCode[7],
            "leaveDay": storeCode[8]
        };

        output.textContent += "\nSending data to backend...";

        try {
            const response = await fetch("/api/editAttendance", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(sendCommandData)
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const result = await response.json();
            output.textContent += `\n✅ Server Response: ${result.message || "Success"}`;

        } catch (error) {
            output.textContent += `\n❌ Failed to send data: ${error.message}`;
        }
    }

    async function runTasks() {
        await task1();
        if (proceed) task2();
    }

    runTasks();
});
