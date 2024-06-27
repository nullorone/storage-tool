chrome.runtime.onMessage.addListener((message, info, cb) => {
    if (message.action === "getStorage") {
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

    if (message.action  ===  "setStorage")  {
        const {name, ...data} = message.payload;
        chrome.storage.session.set({[name]: JSON.stringify({...data})});

        return true;
    }

    if (message.action  ===  "syncStorage") {
        sendMessageToActiveTab({action: 'syncStorage'}, ({name, ...data}) => {
            const storageLocalData = JSON.stringify({...data});

            chrome.storage.session.set({[name]: storageLocalData});
            cb(storageLocalData);
        })

        return true;
    }

    if (message.action === "updateStorage") {
        const data = message.payload;

        getCurrentTab()
            .then((tab)  =>  {
                chrome.storage.session.get(tab.url)
                    .then((result) =>  {
                        const resultStorage = JSON.parse(result[tab.url]).storage;
                        const updatedStorage = {...resultStorage, local: data};
                        const updatedData = {[tab.url]: JSON.stringify({storage: updatedStorage})};

                        chrome.storage.session.set(updatedData)
                            .then(() => {
                                cb(JSON.stringify({storage: updatedStorage}));
                            })
                            .then(() => {
                                sendMessageToActiveTab({action: 'updateStorage', payload: {storage: updatedStorage}});
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
        sendMessageToActiveTab({action: 'clearStorage'});
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