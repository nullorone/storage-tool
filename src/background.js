chrome.runtime.onMessage.addListener((message, info, cb) => {
    if (message.action === "getStorage" || message.action === 'copyAllStorage') {
        getCurrentTab()
            .then((tab)  =>  {
                chrome.storage.session.get(tab.url)
                    .then((result) =>  {
                        cb(result[tab.url]);
                    })
                    .catch(()  =>  {
                        cb({});
                    });
        });

        return true;
    }

    if (message.action === 'deleteItem') {
        const {currentStorage, keyRow} = message.payload;

        getCurrentTab()
            .then((tab)  =>  {
                chrome.storage.session.get(tab.url)
                    .then((result) =>  {
                        const storage = JSON.parse(result[tab.url]).storage;
                        const updatedStorage = Object.fromEntries(Object.entries(storage?.[currentStorage]).filter(([key]) => key !== keyRow));
                        const updatedData = {[tab.url]: JSON.stringify({storage: {...storage, [currentStorage]: updatedStorage}})};

                        chrome.storage.session.set(updatedData)
                            .then(() => {
                                sendMessageToActiveTab({action: 'updateStorage', payload: {storage: {...storage, [currentStorage]: updatedStorage, current: currentStorage}}});

                                cb();
                            });
                    });
            });

        return true;
    }

    if (message.action  ===  "setStorage")  {
        const {name, ...data} = message.payload;
        chrome.storage.session.set({[name]: JSON.stringify({...data})});

        return true;
    }

    if (message.action  ===  "syncStorage") {
        sendMessageToActiveTab({action: 'syncStorage', payload: {currentStorage: message.payload.currentStorage}}, ({name, ...data}) => {
            const storageData = JSON.stringify({...data});

            chrome.storage.session.set({[name]: storageData});
            cb(storageData);
        })

        return true;
    }

    if (message.action === "updateStorage") {
        const data = message.payload.data;
        const currentStorage = message.payload.currentStorage;

        getCurrentTab()
            .then((tab)  =>  {
                chrome.storage.session.get(tab?.url)
                    .then((result) =>  {
                        const resultStorage = JSON.parse(result[tab.url]).storage;
                        const updatedStorage = {...resultStorage, [currentStorage]: data};
                        const updatedData = {[tab.url]: JSON.stringify({storage: updatedStorage})};

                        chrome.storage.session.set(updatedData)
                            .then(() => {
                                cb(JSON.stringify({storage: updatedStorage}));
                            })
                            .then(() => {
                                sendMessageToActiveTab({action: 'updateStorage', payload: {storage: {current: currentStorage, [currentStorage]: updatedStorage[currentStorage]}}});
                            })
                            .catch(()  =>  {
                                cb({});
                            });
                    })
                    .catch(()  =>  {
                        cb({});
                    });
            });

        return true;
    }

    if (message.action === "clearStorage") {
        sendMessageToActiveTab({action: 'clearStorage', payload: {storage: {current: message.payload.storage.currentStorage}}});
        getCurrentTab()
            .then((tab)  =>  {
                chrome.storage.session.set({[tab.url]: JSON.stringify({storage: {}})});
            })
            .catch(()  =>  {
                cb({});
        });
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

        if (response && !!cb) {
            cb(response);
        }
    }
}