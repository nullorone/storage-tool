chrome.runtime.onMessage.addListener((message, info, cb)  =>  {
    if (message.action === 'syncStorage') {
        cb({
            name: location.href,
            storage: {
                local: localStorage,
            },
        });
    }

    if (message.action === 'clearStorage') {
        localStorage.clear();
    }

    if (message.action === 'updateStorage') {
        const localStorageOfBackground = message.payload.storage.local;
        localStorage.clear();
        Object.keys(localStorageOfBackground).forEach((key) => {
            localStorage.setItem(key, localStorageOfBackground[key]);
        })
    }
});

init();

function init() {
    sendStorage();
}

function sendStorage() {
    chrome.runtime.sendMessage({action: 'setStorage', payload: {
            name: location.href,
            storage: {
                local: localStorage,
            },
        }});
}