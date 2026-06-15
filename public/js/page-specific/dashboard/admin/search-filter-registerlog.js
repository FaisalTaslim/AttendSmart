const searchInput = document.getElementById('register-search');
const roleFilter = document.getElementById('register-role-filter');
const statusFilter = document.getElementById('register-status-filter');
const approvalFilter = document.getElementById('register-approval-filter');
const countDisplay = document.getElementById('register-log-count');

const allRows = document.querySelectorAll('.register-logs .log-table tbody tr[data-name]');

function applyFilters() {
  const search = searchInput.value.trim().toLowerCase();
  const role = roleFilter.value;
  const status = statusFilter.value;
  const approval = approvalFilter.value;

  let visibleCount = 0;

  allRows.forEach(row => {
    const matchesSearch =
      !search ||
      row.dataset.name.includes(search) ||
      row.dataset.id.includes(search) ||
      row.dataset.email.includes(search);

    const matchesRole = !role || row.dataset.role === role;
    const matchesStatus = !status || row.dataset.status === status;
    const matchesApproval = !approval || row.dataset.approval === approval;

    const show = matchesSearch && matchesRole && matchesStatus && matchesApproval;
    row.style.display = show ? '' : 'none';
    if (show) visibleCount++;
  });

  countDisplay.textContent = visibleCount;
}

[searchInput, roleFilter, statusFilter, approvalFilter].forEach(el => {
  el.addEventListener('input', applyFilters);
});