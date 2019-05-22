function XBTNotification() {
    let previousPrice = null;
    let intervalId = null;

    function getCurrentPrice() {
        const currentPriceSpan = document.querySelector('span.priceWidget') || {};
        return parseFloat(currentPriceSpan.textContent || 0);
    }

    function priceComparatorPercent(previousPrice, currentPrice) {
        return parseFloat((((currentPrice * 100) / previousPrice) - 100).toFixed(4));
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
                    console.log('currentPrice', currentPrice);
                    const percentageVariation = priceComparatorPercent(previousPrice, currentPrice);
                    if (percentageVariation >= 0.10 || percentageVariation <= -0.10) {
                        new window.Notification(`Preço Atual: ${currentPrice}, Variação do XBT: ${percentageVariation}`);
                    }
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

const xbt = XBTNotification();

chrome.runtime.onMessage.addListener(result => {
    console.log('message:', result);
    switch (result) {
        case 'start':
            xbt.run(3000);
            break;
        case 'stop':
            xbt.stop();
            break;
    }
});