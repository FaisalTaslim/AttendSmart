(() => {
    const quickGrid = document.querySelector('.quick-grid');
    const contentSection = document.querySelector('.content');
    const goBackButton = document.getElementById('go-back');
    const panels = document.querySelectorAll('.content-panel');

    const optionToContentMap = {
        'option-finish-setup': 'content-finish-setup',
        'option-profile': 'content-profile',
        'option-settings': 'content-settings',
        'option-support': 'content-support',
        'option-start-session': 'content-start-session',
        'option-edit-attendance': 'content-edit-attendance',
        'option-attendance-history': 'content-attendance-history',
        'option-view-students': 'content-view-students',
        'option-mark-leave': 'content-mark-leave',
        'option-student-attendance': 'content-student-attendance',
        'option-send-notice': 'content-send-notice',
        'option-view-announcements': 'content-view-announcements',
        'option-download-reports': 'content-download-reports',
        'option-monthly-summary': 'content-monthly-summary',
    };

    if (!quickGrid || !contentSection || !goBackButton) {
        return;
    }

    const hideAllPanels = () => {
        panels.forEach((panel) => {
            panel.style.display = 'none';
        });
    };

    const openContent = (contentId) => {
        const selectedPanel = document.getElementById(contentId);
        if (!selectedPanel) return;

        quickGrid.style.display = 'none';
        contentSection.style.display = 'flex';

        hideAllPanels();
        selectedPanel.style.display = 'block';
    };

    const showQuickGrid = () => {
        hideAllPanels();
        contentSection.style.display = 'none';
        quickGrid.style.display = 'grid';
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
