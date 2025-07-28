function handleGenerateQR() {
    const subject = prompt("Enter subject name:");
    if (subject) {
        const encodedSubject = encodeURIComponent(subject.trim());
        window.open(`/get-qr-student?subject=${encodedSubject}`, '_blank');
    }
}