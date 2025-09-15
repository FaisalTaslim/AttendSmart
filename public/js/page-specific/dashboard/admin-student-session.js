document.getElementById("subjectForm").addEventListener("submit", function (e) {
    const uniqueId = document.getElementById("uniqueID").value;
    const subject = document.getElementById("subjectName").value;
    const createdAt = new Date().toLocaleString();

    document.getElementById("studentCode").textContent = uniqueId;
    document.getElementById("sessionInstigator").textContent = uniqueId; 
    document.getElementById("sessionSubject").textContent = subject;
    document.getElementById("sessionCreatedAt").textContent = createdAt;

    document.getElementById("sessionDetails").style.display = "block";

    setTimeout(() => {
        document.getElementById("sessionExpired").textContent = "Expired";
    }, 10000);
});