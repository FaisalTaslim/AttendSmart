const getBtn = document.getElementById('start-session-btn');
const continueBtn = document.getElementById('continue-btn');
const contentsContainer2 = document.getElementsByClassName('dashboard-contents')[0];
const overlay2 = document.getElementsByClassName('overlay')[0];

async function startSessionAndRedirect(override = false) {
    const sessionRes = await fetch(`/dashboard/admin/start-employee-session${override ? '?override=true' : ''}&type=check-in`);
    
    let sessionData;
    try {
        sessionData = await sessionRes.json();
    } catch (e) {
        console.error("Invalid JSON response");
        alert("Server error (invalid response)");
        return;
    }

    if (!sessionRes.ok || sessionData.status === "error") {
        console.error(sessionData);
        alert(sessionData.message || "Something went wrong");
        return;
    }

    window.location.href = `/dashboard/admin/capture-attendance?for=employee&session=${sessionData.sessionCode}`;
}

getBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    console.log("button clicked!");

    try {
        const res = await fetch('/dashboard/admin/check-employee-session');
        const data = await res.json();

        if (data.status === 'active') {
            window.location.href = `/dashboard/admin/capture-attendance?for=employee&session=${data.sessionCode}`;
        }
        else if (data.status === 'not-active' && data.withinWindow === true) {
            await startSessionAndRedirect(false);
        }
        else if (data.status === 'not-active' && data.withinWindow === false && data.proceed === true) {
            document.getElementById('scheduled-time').innerText = data.scheduleTime;
            document.getElementById('current-time').innerText = data.currentTime;
            document.getElementById('shift-type').innerText = data.shift;

            contentsContainer2.style.display = 'flex';
            overlay2.style.display = 'flex';
        }
        else {
            alert(`No active session available. Check back during your shift window.`);
        }
    } catch (err) {
        console.error(err);
        alert('Something went wrong.');
    }
});

continueBtn.addEventListener('click', async () => {
    try {
        contentsContainer2.style.display = 'none';
        overlay2.style.display = 'none';

        await startSessionAndRedirect(true);
    } catch {
        alert('Something went wrong.');
    }
});