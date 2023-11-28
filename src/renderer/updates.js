const { ipcRenderer } = require('electron');

ipcRenderer.on('update_available', () => {
    // Notify the user that an update is available
    // This can be a simple alert or a more sophisticated UI notification
    alert('A new update is available. Downloading now...');
});

ipcRenderer.on('update_downloaded', () => {
    // Notify the user that the update is ready to be installed
    alert('Update downloaded. The app will restart now to apply the update.');

    // You can also provide a button or prompt for the user to restart the app
    ipcRenderer.send('restart_app');
});
