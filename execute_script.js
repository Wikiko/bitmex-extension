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

    function criteriaSelector(selector, criteriaFn){
        return [...document.querySelectorAll(selector)].filter(criteriaFn);
    }

    function run(time, extensionId) {
        stop();

        criteriaSelector('span', span => span.textContent.match(/^(\d*\,\d*)\s(XBT)$/))
            .forEach(span => {
                const spanTextContent = span.textContent;
                const xbtSpanPrice = parseFloat(spanTextContent.split(' ')[0].replace(',', '.'));
                span.addEventListener('mouseover', () => span.textContent = `${(getCurrentPrice() * xbtSpanPrice).toFixed(2)} USD`);
                span.addEventListener('mouseout', () => span.textContent = spanTextContent);
            });

        return Notification.requestPermission()
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
                        new Notification(`Variação do XBT: ${percentageVariation}`, {
                            body: `Preço Atual: ${currentPrice}`,
                            icon: 'https://image.flaticon.com/icons/png/128/139/139775.png'
                        });
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
    switch (result.message) {
        case 'start':
            xbt.run(3000, result.extensionId);
            break;
        case 'stop':
            xbt.stop();
            break;
    }
});