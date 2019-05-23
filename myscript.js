function getBitmexTab() {
    return new Promise(resolve => {
        chrome.tabs.getAllInWindow(tabs => {
            const bitmexTab = tabs.filter(tab => tab.url.includes('bitmex.com/app/trade/'))[0];
            return bitmexTab !== undefined ? resolve(bitmexTab) : reject();
        });
    });
}

function uuidv4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    )
}

window.addEventListener('load', () => {
    const notificationAudio = new Audio('https://s3-sa-east-1.amazonaws.com/bitmexsgd/alert1.wav');
    chrome.runtime.onMessage.addListener(message => {
        switch (message.type) {
            case 'notification':
                chrome.notifications.create(uuidv4(), message.content);
                break;
        }
    });

    document.getElementById('start').addEventListener('click', () => {
        getBitmexTab()
            .then(bitmexTab => {
                chrome.tabs.onUpdated
                    .addListener((tabId, changeInfo) => {
                        if (tabId === bitmexTab.id && changeInfo.status === 'complete') {
                            console.log(changeInfo);
                            chrome.tabs.executeScript(bitmexTab.id, {
                                file: 'execute_script.js'
                            }, () => {
                                chrome.tabs.sendMessage(bitmexTab.id, 'start');
                            });
                        }
                    });
                chrome.tabs.reload(bitmexTab.id);
            });
    });

    document.getElementById('stop').addEventListener('click', () => {
        getBitmexTab()
            .then(bitmexTab => {
                chrome.tabs.sendMessage(bitmexTab.id, 'stop');
            });
    });
});