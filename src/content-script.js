chrome.runtime.onMessage.addListener((message, info, cb)  =>  {
    if (message.action === 'syncStorage') {
        cb({
            name: location.href,
            storage: {
                current: message.payload.currentStorage,
                local: localStorage,
                session: sessionStorage
            },
        });
    }

    if (message.action === 'clearStorage') {
        if (message.payload.storage.current === 'local') {
            localStorage.clear();
        }

        if (message.payload.storage.current === 'session') {
            sessionStorage.clear();
        }
    }

    if (message.action === 'updateStorage') {
        if (message.payload.storage.current === 'local') {
            const storage = message.payload.storage.local;
            localStorage.clear();
            Object.keys(storage).forEach((key) => {
                localStorage.setItem(key, storage[key]);
            })
        }

        if (message.payload.storage.current === 'session') {
            const storage = message.payload.storage.session;
            sessionStorage.clear();
            Object.keys(storage).forEach((key) => {
                sessionStorage.setItem(key, storage[key]);
            })
        }
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
                current: 'local',
                local: localStorage,
                session: sessionStorage
            },
        }});
}