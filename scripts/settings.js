// scripts/settings.js

window.isItemNamesEnabled = localStorage.getItem('isItemNamesEnabled') === 'true';

document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('toggle-item-names');
    if (toggle) {
        toggle.checked = window.isItemNamesEnabled;
        toggle.addEventListener('change', e => {
            window.isItemNamesEnabled = e.target.checked;
            localStorage.setItem('isItemNamesEnabled', window.isItemNamesEnabled);
            window.guiDirty = true;
            document.dispatchEvent(new CustomEvent('resourcesUpdated'));
            document.dispatchEvent(new CustomEvent('checkUpgrades'));
        });
    }
});
