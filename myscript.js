function XBTNotification() {
    let previousPrice = null;
    let intervalId = null;

    function getCurrentPrice() {
        const currentPriceSpan = document.querySelector('span.priceWidget') || {};
        return parseFloat(currentPriceSpan.textContent || 0);
    }

    function priceComparatorPercent(previousPrice, currentPrice) {
        return (((currentPrice * 100) / previousPrice) - 100) * -1;
    }

    function run(time) {
        stop();
        return window.Notification.requestPermission()
            .then(permission => {
                if (permission !== 'granted') {
                    return alert('Sem permissão não dá pra notificar...');
                }
                previousPrice = getCurrentPrice(); // for first call...
                intervalId = setInterval(() => {
                    const currentPrice = getCurrentPrice();
                    const percentageVariation = priceComparatorPercent(previousPrice, currentPrice);
                    //                                        if(percentageVariation >= 0.01 || percentageVariation <= -0.01){
                    new window.Notification(`Variação do XBT: ${percentageVariation}`);
                    //                        }
                    previousPrice = currentPrice; // after used current turn previous.
                }, time);
            })
    }

    function stop() {
        if (intervalId) {
            clearInterval(intervalId);
        }
    }

    return {
        run,
        stop
    }
}

function executarBitMexWill(paramtempo) {
    console.log('PLAY BITMEX WILL');
    const xbt = XBTNotification();
    var tempo = 3000;
    if (paramtempo != 3000) {
        tempo = tempo;
    }
    xbt.run(tempo);
}

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