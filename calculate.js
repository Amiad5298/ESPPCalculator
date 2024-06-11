let debounceDelay = 500;
let apiKey;
let debounceTimerSalary;
let debounceTimerPercentage;
let debounceTimerSymbol;

function loadApiKey() {
    fetch('apiKey.json')
        .then(response => response.json())
        .then(data => {
            apiKey = data.apiKey;
        })
        .catch(error => {
            console.error('Error loading API key:', error);
        });
}

function formatNumberWithCommas(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function formatPercentage(number) {
    return number + "%";
}

function handleMonthlySalaryInput(event) {
    clearTimeout(debounceTimerSalary);
    debounceTimerSalary = setTimeout(() => {
        const input = event.target;
        let value = input.value.replace(/,/g, ''); // Remove existing commas
        if (!isNaN(value) && value !== '') {
            input.value = formatNumberWithCommas(value);
        }
    }, debounceDelay); 
}

function handleContributionPercentageInput(event) {
    clearTimeout(debounceTimerPercentage);
    debounceTimerPercentage = setTimeout(() => {
        const input = event.target;
        let value = parseFloat(input.value.replace('%', '')); // Remove existing percentage symbol
        if (!isNaN(value) && value !== '') {
            input.value = formatPercentage(value);
        }
    }, debounceDelay); 
}

async function fetchStockPrice(symbol) {
    try {
        const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`);
        const data = await response.json();

        if (!data.c) {
            throw new Error('Stock symbol not found');
        }

        return data.c; // c stands for current price in Finnhub
    } catch (error) {
        console.error('Error fetching stock price:', error);
        return null;
    }
}

async function validateStockSymbol() {
    const stockSymbol = document.getElementById('stockSymbol').value.trim().toUpperCase();
    const stockSymbolWarning = document.getElementById('stockSymbolWarning');
    const stockSymbolInput = document.getElementById('stockSymbol');

    if (!stockSymbol) {
        stockSymbolWarning.innerText = '';
        stockSymbolInput.classList.remove('warning');
        return;
    }

    try {
        const response = await fetch(`https://finnhub.io/api/v1/search?q=${stockSymbol}&token=${apiKey}`);
        const data = await response.json();

        if (data.result && data.result.length > 0) {
            stockSymbolWarning.innerText = '';
            stockSymbolInput.classList.remove('warning');
        } else {
            stockSymbolWarning.innerText = `סימול מניה '${stockSymbol}' לא נמצא. שים לב, סימול המניה לא בהכרח ולרוב לא יהיה שם החברה.`;
            stockSymbolInput.classList.add('warning');
        }
    } catch (error) {
        console.error('Error validating stock symbol:', error);
        stockSymbolWarning.innerText = `סימול מניה '${stockSymbol}' לא נמצא`;
        stockSymbolInput.classList.add('warning');
    }
}

function debounceValidateStockSymbol() {
    clearTimeout(debounceTimerSymbol);
    debounceTimerSymbol = setTimeout(validateStockSymbol, debounceDelay); 
}


async function calculateProfit() {
    const stockSymbol = document.getElementById('stockSymbol').value.trim().toUpperCase();
    const monthlySalary = parseFloat(document.getElementById('monthlySalary').value.replace(/,/g, ''));
    const contributionPercentage = parseFloat(document.getElementById('contributionPercentage').value.replace('%', ''));
    const startDate = document.getElementById('startDate').value;
    const soldDate = document.getElementById('soldDate').value;
    const today = new Date();

    const validations = new Validations();

    var isValidate = validations.doUIValidations(stockSymbol,monthlySalary, contributionPercentage, startDate, soldDate);

    if(!isValidate){
        return;
    }

    const startDateObj = new Date(startDate);
    const soldDateObj = new Date(soldDate);

    const endDate = new Date(startDateObj);
    endDate.setMonth(endDate.getMonth() + 6);

    const startPrice = await fetchStockPrice(stockSymbol);
    const endPrice = await fetchStockPrice(stockSymbol);
    const soldPrice = await fetchStockPrice(stockSymbol);

    if (startPrice === null || endPrice === null || soldPrice === null) {
        document.getElementById('result').innerText = `סימול מניה '${stockSymbol}' לא נמצא או שאין נתונים לתאריכים שנבחרו`;
        return;
    }

    const monthlyContribution = monthlySalary * (contributionPercentage / 100);
    const totalContribution = monthlyContribution * 6;
    const stockPurchasePrice = Math.min(startPrice, endPrice) * 0.85;
    const numberOfShares = totalContribution / stockPurchasePrice;
    const profitPerShare = soldPrice - stockPurchasePrice;
    const totalProfit = numberOfShares * profitPerShare;
    const profitAfterTax = totalProfit * (1 - 0.47); // assuming 47% tax
    const monthlyNetProfit = profitAfterTax / 6;

    document.getElementById('result').innerText = 'רווח חודשי נטו: ' + monthlyNetProfit.toFixed(2) + ' ש"ח';
}

// Load API key on page load
window.onload = function() {
    loadApiKey();
    loadTexts();
};
