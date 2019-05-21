(function (window, document) {
    window.onload = function () {
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

        console.log('executado dentro do site');

        // document.getElementById('btn').addEventListener('click', () => {
        //     // executarBitMexWill(3000);
        //     chrome.notifications.create(1, {title: 'teste'}, console.log);
        // });
    };

})(window, document);