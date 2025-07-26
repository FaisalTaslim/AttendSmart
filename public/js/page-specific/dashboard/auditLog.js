document.addEventListener("DOMContentLoaded", function () {
    const filterDropdown = document.getElementById('logFilter');
    const logs = document.querySelectorAll('.log-item');

    filterDropdown.addEventListener('change', function () {
        const selectedType = this.value;

        logs.forEach(log => {
            const logType = log.getAttribute('data-type');
            if (selectedType === 'all' || logType === selectedType) {
                log.style.display = 'flex';
            } else {
                log.style.display = 'none';
            }
        });
    });
});