(() => {
    const quickGrid = document.querySelector('.quick-grid');
    const contentSection = document.querySelector('.content');
    const goBackButton = document.getElementById('go-back');
    const panels = document.querySelectorAll('.content-panel');

    const optionToContentMap = {
        'option-finish-setup': 'content-finish-setup',
        'option-profile-settings': 'content-profile-settings',
        'option-mark-attendance': 'content-mark-attendance',
        'option-attendance-summary': 'content-attendance-summary',
        'option-download-attendance-report': 'content-download-attendance-report',
        'option-my-subjects': 'content-my-subjects',
        'option-apply-for-leave': 'content-apply-for-leave',
        'option-leave-status': 'content-leave-status',
        'option-view-notices': 'content-view-notices',
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
