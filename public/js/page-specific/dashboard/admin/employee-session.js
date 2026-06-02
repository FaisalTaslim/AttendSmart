const getBtn = document.getElementById('start-session-btn');
const continueBtn = document.getElementById('continue-btn');
const contentsContainer2 = document.getElementsByClassName('dashboard-contents')[0];
const overlay2 = document.getElementsByClassName('overlay')[0];

getBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    console.log("button clicked!");

    try {
        const res = await fetch('/dashboard/admin/check-employee-session');
        const data = await res.json();

        if (data.status === 'active' || (data.status === 'not-active' && data.withinWindow === true)) {
            const res = await fetch('/dashboard/admin/start-employee-session');
            const data = await res.json();

            if (data.status === 'ok') {
                alert('Session Active! Proceed with the attendance.');
            } else {
                alert('Something went wrong.');
            }
        }
        else if (data.status === 'not-active' && data.withinWindow === false) {
            contentsContainer2.style.display = 'flex',
            overlay2.style.display = 'flex';
        }

    } catch (err) {
        console.error(err);
        alert('Something went wrong.');
    }
});

continueBtn.addEventListener('click', async () => {
    try {
        const res = await fetch('/dashboard/admin/start-employee-session?override=true');
        const data = await res.json();

        if (data.status === 'ok') {
            alert('Session Active! Proceed with the attendance.');
        } else {
            alert('Something went wrong.');
        }
    } catch {
        alert('Something went wrong.');
    }
})