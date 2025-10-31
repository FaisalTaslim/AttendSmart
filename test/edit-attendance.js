const prompt = require('prompt-sync')();

let code = prompt("Enter the code: ");
let storeCode = [];
let ids;
let userType;

if (code.startsWith("$")) {
    if (code.startsWith("$edit")) {
        storeCode = code.split(" ");

        console.log("Verifying the code entered...");
        if (storeCode.length != 6 || (storeCode[1] != 'std' && storeCode[1] != 'emp') || storeCode[3].includes(' ')) {
            console.log("Invalid code entered. Please follow the coding guidelines mentioned in app's guide page.");
        } else {
            userType = storeCode[1] == 'std' ? 'student' : 'employee';
            
            ids = storeCode[3] == 'all' ? 'all' : storeCode[3].split(",");

            console.log("Printing the received data:");
            if (Array.isArray(ids)) {
                console.log(`User wants to ${storeCode[0]} the ${storeCode[2]} attendance for the following Ids: ${ids.join(',')} with totalDays increment value = ${storeCode[4]} and attendedDays increment value = ${storeCode[5]}`);
            } else {
                console.log(`User wants to ${storeCode[0]} the ${storeCode[2]} attendance for all users with totalDays increment value = ${storeCode[4]} and attendedDays increment value = ${storeCode[5]}`);
            }
        }
    }
}
