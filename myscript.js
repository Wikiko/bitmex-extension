function getBitmexTab() {
    return new Promise((resolve, reject) => {
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

function makeMessage(message){
    return {
        message,
        extensionId: chrome.runtime.id
    };
}

window.addEventListener('load', () => {
    // chrome.runtime.onMessage.addListener(message => {
    //     console.log(message);
    //     switch (message.type) {
    //         case 'notification':
    //             chrome.notifications.create(uuidv4(), message.content);
    //             break;
    //     }
    // });

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
                                chrome.tabs.sendMessage(bitmexTab.id, makeMessage('start'));
                            });
                        }
                    });
                chrome.tabs.reload(bitmexTab.id);
            });
    });

    document.getElementById('stop').addEventListener('click', () => {
        getBitmexTab()
            .then(bitmexTab => {
                chrome.tabs.sendMessage(bitmexTab.id, makeMessage('stop'));
            });
    });
});