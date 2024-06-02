chrome.runtime.onMessage.addListener((message, info, cb) => {
    if (message.action === "getStorage") {
        getCurrentTab()
            .then((tab)  =>  {
                chrome.storage.local.get(tab.url)
                    .then((result) =>  {
                        cb(result[tab.url]);
                    })
                    .catch(()  =>  {
                        cb({});
                    });
        });

        return true;
    }

    if (message.action  ===  "setStorage")  {
        const {name, ...data} = message.payload;
        chrome.storage.local.set({[name]: JSON.stringify({...data})});

        return true;
    }

    if (message.action  ===  "syncStorage")   {
        sendMessageToActiveTab('syncStorage', (res) => {
            const name = res.name;
            chrome.storage.local.get(name)
                .then((result) =>  {
                    cb(result[name]);
                }).catch(()  =>  {
                cb({});
            });
        });

        return true;
    }
});

async function getCurrentTab() {
    let queryOptions = { active: true, lastFocusedWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
}

async function sendMessageToActiveTab(message, cb) {
    const tab = await getCurrentTab();
    if (tab && tab.id) {
        const response = await chrome.tabs.sendMessage(tab.id, message);

        if (response) {
            cb(response);
        }
    }
}