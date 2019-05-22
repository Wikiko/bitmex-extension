function getBitmexTab() {
    return new Promise(resolve => {
        chrome.tabs.getAllInWindow(tabs => {
            const bitmexTab = tabs.filter(tab => tab.url.includes('bitmex.com/app/trade/'))[0];
            return bitmexTab !== undefined ? resolve(bitmexTab) : reject();
        });
    });
}

window.addEventListener('load', () => {
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