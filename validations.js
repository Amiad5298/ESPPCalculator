class Validations {
    doUIValidations(stockSymbol, monthlySalary, contributionPercentage, startDate, soldDate) {
        const today = new Date();
        let valid = true;

        // Clear all previous warning messages first
        this.#clearAllWarnings();

        const validations = [
            { value: stockSymbol, warningId: 'stockSymbolWarning', inputId: 'stockSymbol', message: 'אנא הכנס את סימול המניה' },
            { value: monthlySalary, warningId: 'monthlySalaryWarning', inputId: 'monthlySalary', message: 'אנא הכנס את המשכורת החודשית', isNumber: true },
            { value: contributionPercentage, warningId: 'contributionPercentageWarning', inputId: 'contributionPercentage', message: 'אנא הכנס את אחוז ההפרשה', isNumber: true },
            { value: startDate, warningId: 'startDateWarning', inputId: 'startDate', message: 'אנא הכנס את תאריך ההתחלה' },
            { value: soldDate, warningId: 'soldDateWarning', inputId: 'soldDate', message: 'אנא הכנס את תאריך המכירה' },
        ];

        validations.forEach(validation => {
            const { value, warningId, inputId, message, isNumber } = validation;
            if (isNumber ? isNaN(value) : !value) {
                this.#setWarning(warningId, message);
                document.getElementById(inputId).classList.add('warning');
                valid = false;
            } else {
                this.#clearWarning(warningId, inputId);
                document.getElementById(inputId).classList.remove('warning');
            }
        });

        const startDateObj = new Date(startDate);
        const soldDateObj = new Date(soldDate);

        if (startDate && soldDate) {
            if (soldDateObj < startDateObj) {
                this.#setWarning('result', 'תאריך המכירה לא יכול להיות קטן מתאריך ההתחלה');
                valid = false;
            } else if (this.#monthsDiff(startDateObj, soldDateObj) < 6) {
                this.#setWarning('result', 'הפער בין תאריך ההתחלה לתאריך המכירה צריך להיות לפחות 6 חודשים');
                valid = false;
            } else if (soldDateObj > today) {
                this.#setWarning('result', 'תאריך המכירה לא יכול להיות בעתיד');
                valid = false;
            } else {
                this.#clearWarning('result');
            }
        }

        return valid;
    }

    #setWarning(elementId, message) {
        const element = document.getElementById(elementId);
        element.innerText = message;
        element.classList.add('warning-message');
        setTimeout(() => {
            element.classList.remove('warning-message');
            element.innerText = '';
        }, 3000); // Remove the warning message after 3 seconds
    }

    #clearWarning(elementId, inputId) {
        const element = document.getElementById(elementId);
        element.innerText = '';
        element.classList.remove('warning-message');

        if (inputId) {
            const inputElement = document.getElementById(inputId);
            inputElement.style.backgroundColor = '#ffffff'; // Reset background color
        }
    }

    #clearAllWarnings() {
        const warningIds = ['stockSymbolWarning', 'monthlySalaryWarning', 'contributionPercentageWarning', 'startDateWarning', 'soldDateWarning', 'result'];
        warningIds.forEach(id => this.#clearWarning(id));
    }

    #monthsDiff(d1, d2) {
        return (d2.getFullYear() * 12 + d2.getMonth()) - (d1.getFullYear() * 12 + d1.getMonth());
    }
}
