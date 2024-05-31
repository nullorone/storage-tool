chrome.runtime.onMessage.addListener((message, info, cb) => {
    if (message.action === "getStorage") {
        chrome.storage.local.get('tool').then((result) =>  {
            cb(result.tool);
        });
        return true;
    }

    if (message.action  ===  "setStorage")  {
        chrome.storage.local.set({'tool': JSON.stringify(message.payload)});
    }
});

async function getCurrentTabId() {
    let queryOptions = { active: true, lastFocusedWindow: true };
    // `tab` will either be a `tabs.Tab` instance or `undefined`.
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab.id;
}