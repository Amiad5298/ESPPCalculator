class Validations{

    doUIValidations(stockSymbol,monthlySalary,contributionPercentage,startDate,soldDate){

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

        const startDateObj = new Date(startDate);
        const soldDateObj = new Date(soldDate);


        if (soldDateObj < startDateObj) {
            document.getElementById('result').innerText = 'תאריך המכירה לא יכול להיות קטן מתאריך ההתחלה';
            document.getElementById('soldDate').classList.add('warning');
            valid = false;
        } else {
            document.getElementById('soldDate').classList.remove('warning');
        }
    
        const sixMonthsLater = new Date(startDateObj);
        sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);
    
        if (this.#monthsDiff(startDateObj, soldDateObj) < 6) {
            document.getElementById('result').innerText = 'הפער בין תאריך ההתחלה לתאריך המכירה צריך להיות לפחות 6 חודשים';
            document.getElementById('startDate').classList.add('warning');
            document.getElementById('soldDate').classList.add('warning');
            valid = false;
        } else {
            document.getElementById('startDate').classList.remove('warning');
            document.getElementById('soldDate').classList.remove('warning');
        }
    
        if (soldDateObj > today) {
            document.getElementById('result').innerText = 'תאריך המכירה לא יכול להיות בעתיד';
            document.getElementById('soldDate').classList.add('warning');
            valid = false;
        } else {
            document.getElementById('soldDate').classList.remove('warning');
        }

        return valid;
    }


    #monthsDiff(d1, d2) {
        var diff = (d2.getFullYear() * 12 + d2.getMonth()) - (d1.getFullYear() * 12 + d1.getMonth());
        return diff;
    }
}