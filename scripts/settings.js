// scripts/settings.js

window.isItemNamesEnabled = localStorage.getItem('isItemNamesEnabled') === 'true';
window.isNumberSimplificationEnabled = localStorage.getItem('isNumberSimplificationEnabled') === 'true';

document.addEventListener('DOMContentLoaded', () => {
    const nameToggle = document.getElementById('toggle-item-names');
    if (nameToggle) {
        nameToggle.checked = window.isItemNamesEnabled;
        nameToggle.addEventListener('change', e => {
            window.isItemNamesEnabled = e.target.checked;
            localStorage.setItem('isItemNamesEnabled', window.isItemNamesEnabled);
            window.guiDirty = true;
            document.dispatchEvent(new CustomEvent('resourcesUpdated'));
            document.dispatchEvent(new CustomEvent('checkUpgrades'));
        });
    }

    const simplifyToggle = document.getElementById('toggle-simplify-numbers');
    if (simplifyToggle) {
        simplifyToggle.checked = window.isNumberSimplificationEnabled;
        simplifyToggle.addEventListener('change', e => {
            window.isNumberSimplificationEnabled = e.target.checked;
            localStorage.setItem('isNumberSimplificationEnabled', window.isNumberSimplificationEnabled);
            window.guiDirty = true;
            document.dispatchEvent(new CustomEvent('resourcesUpdated'));
            document.dispatchEvent(new CustomEvent('checkUpgrades'));
        });
    }
});
