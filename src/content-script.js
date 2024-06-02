chrome.runtime.onMessage.addListener((message, info, cb)  =>  {
    if (message === 'syncStorage') {
        cb({
            name: location.href,
            storage: {
                local: localStorage,
            },
        });
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