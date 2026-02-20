(() => {
    const quickGrid = document.querySelector('.quick-grid');
    const contentSection = document.querySelector('.content');
    const setupUploads = document.querySelector('.setup-uploads');
    const goBackButton = document.getElementById('go-back');
    const panels = document.querySelectorAll('.content-panel');

    const optionToContentMap = {
        'option-edit-attendance': 'content-edit-attendance',
        'option-attendance-summary': 'content-attendance-summary',
        'option-download-reports': 'content-download-reports',
        'option-view-users': 'content-view-users',
        'option-add-users': 'content-add-users',
        'option-suspend-remove-users': 'content-suspend-remove-users',
        'option-leave-requests': 'content-leave-requests',
        'option-subjects': 'content-subjects',
        'option-schedules': 'content-schedules',
        'option-academic-year': 'content-academic-year',
        'option-send-notice': 'content-send-notice',
        'option-announcements': 'content-announcements',
        'option-activity-logs': 'content-activity-logs',
        'option-attendance-logs': 'content-attendance-logs',
        'option-system-logs': 'content-system-logs',
        'option-support-requests': 'content-support-requests',
        'option-help-guidebook': 'content-help-guidebook',
    };

    if (!quickGrid || !contentSection || !goBackButton) {
        return;
    }

    contentSection.hidden = false;
    contentSection.style.display = 'none';

    panels.forEach((panel) => {
        panel.hidden = false;
        panel.style.display = 'none';
    });

    const hideAllPanels = () => {
        panels.forEach((panel) => {
            panel.style.display = 'none';
        });
    };

    const openContent = (contentId) => {
        const selectedPanel = document.getElementById(contentId);
        if (!selectedPanel) return;

        quickGrid.style.display = 'none';
        if (setupUploads) setupUploads.style.display = 'none';

        contentSection.style.display = 'flex';
        hideAllPanels();
        selectedPanel.style.display = 'block';
    };

    const showQuickGrid = () => {
        hideAllPanels();
        contentSection.style.display = 'none';

        quickGrid.style.display = 'grid';
        if (setupUploads) setupUploads.style.display = 'grid';
    };

    Object.keys(optionToContentMap).forEach((optionId) => {
        const option = document.getElementById(optionId);
        const contentId = optionToContentMap[optionId];

        if (!option) return;

        option.addEventListener('click', () => {
            openContent(contentId);
        });
    });

    goBackButton.addEventListener('click', showQuickGrid);
})();
