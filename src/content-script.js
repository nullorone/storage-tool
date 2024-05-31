chrome.runtime.onMessage.addListener((request, ...other)  =>  {
    console.log(request, ...other);
});

function init() {
    chrome.runtime.sendMessage({action: 'setStorage', payload: localStorage});
}

init();