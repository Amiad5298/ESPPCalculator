let debounceDelay = 3000;
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

function monthsDiff(d1, d2) {
    var diff = (d2.getFullYear() * 12 + d2.getMonth()) - (d1.getFullYear() * 12 + d1.getMonth());
    return diff;
}

async function calculateProfit() {
    const stockSymbol = document.getElementById('stockSymbol').value.trim().toUpperCase();
    const monthlySalary = parseFloat(document.getElementById('monthlySalary').value.replace(/,/g, ''));
    const contributionPercentage = parseFloat(document.getElementById('contributionPercentage').value.replace('%', ''));
    const startDate = document.getElementById('startDate').value;
    const soldDate = document.getElementById('soldDate').value;
    const today = new Date();

    let valid = true;

    if (!stockSymbol) {
        document.getElementById('stockSymbolWarning').innerText = 'אנא הכנס את סימול המניה';
        document.getElementById('stockSymbol').classList.add('warning');
        valid = false;
    } else {
        document.getElementById('stockSymbolWarning').innerText = '';
        document.getElementById('stockSymbol').classList.remove('warning');
    }

    if (isNaN(monthlySalary)) {
        document.getElementById('monthlySalaryWarning').innerText = 'אנא הכנס את המשכורת החודשית';
        document.getElementById('monthlySalary').classList.add('warning');
        valid = false;
    } else {
        document.getElementById('monthlySalaryWarning').innerText = '';
        document.getElementById('monthlySalary').classList.remove('warning');
    }

    if (isNaN(contributionPercentage)) {
        document.getElementById('contributionPercentageWarning').innerText = 'אנא הכנס את אחוז ההפרשה';
        document.getElementById('contributionPercentage').classList.add('warning');
        valid = false;
    } else {
        document.getElementById('contributionPercentageWarning').innerText = '';
        document.getElementById('contributionPercentage').classList.remove('warning');
    }

    if (!startDate) {
        document.getElementById('startDateWarning').innerText = 'אנא הכנס את תאריך ההתחלה';
        document.getElementById('startDate').classList.add('warning');
        valid = false;
    } else {
        document.getElementById('startDateWarning').innerText = '';
        document.getElementById('startDate').classList.remove('warning');
    }

    if (!soldDate) {
        document.getElementById('soldDateWarning').innerText = 'אנא הכנס את תאריך המכירה';
        document.getElementById('soldDate').classList.add('warning');
        valid = false;
    } else {
        document.getElementById('soldDateWarning').innerText = '';
        document.getElementById('soldDate').classList.remove('warning');
    }

    if (!valid) {
        return;
    }

    const startDateObj = new Date(startDate);
    const soldDateObj = new Date(soldDate);

    if (soldDateObj < startDateObj) {
        document.getElementById('result').innerText = 'תאריך המכירה לא יכול להיות קטן מתאריך ההתחלה';
        document.getElementById('soldDate').classList.add('warning');
        return;
    } else {
        document.getElementById('soldDate').classList.remove('warning');
    }

    const sixMonthsLater = new Date(startDateObj);
    sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);

    if (monthsDiff(startDateObj, soldDateObj) < 6) {
        document.getElementById('result').innerText = 'הפער בין תאריך ההתחלה לתאריך המכירה צריך להיות לפחות 6 חודשים';
        document.getElementById('startDate').classList.add('warning');
        document.getElementById('soldDate').classList.add('warning');
        return;
    } else {
        document.getElementById('startDate').classList.remove('warning');
        document.getElementById('soldDate').classList.remove('warning');
    }

    if (soldDateObj > today) {
        document.getElementById('result').innerText = 'תאריך המכירה לא יכול להיות בעתיד';
        document.getElementById('soldDate').classList.add('warning');
        return;
    } else {
        document.getElementById('soldDate').classList.remove('warning');
    }

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
