const mainButton = document.querySelector('#main-button');
const textElement = document.querySelector('.text');

mainButton.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: "getStorage" }, (value) => {
        const storage = JSON.parse(value);
        textElement.innerText = `Hello, world! ${Object.keys(storage).length} and ${value} items in your storage.`;
    });

});
