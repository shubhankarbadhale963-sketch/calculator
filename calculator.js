let display = document.getElementById('display');
let queryDisplay = document.getElementById('queryDisplay');
let currentInput = '';
let shouldResetDisplay = false;
let lastWasOperator = false;

function appendToDisplay(value) {
    if (shouldResetDisplay) {
        currentInput = '';
        shouldResetDisplay = false;
        queryDisplay.classList.remove('slide-up');
        queryDisplay.textContent = '';
    }
    
    // Prevent multiple consecutive operators
    const lastChar = currentInput.slice(-1);
    if (['+', '-', '*', '/'].includes(value) && ['+', '-', '*', '/'].includes(lastChar)) {
        currentInput = currentInput.slice(0, -1) + value;
    } else {
        // Prevent multiple decimal points in a number
        if (value === '.') {
            const parts = currentInput.split(/[+\-*/]/);
            const lastPart = parts[parts.length - 1];
            if (lastPart.includes('.')) {
                return;
            }
        }
        currentInput += value;
    }
    
    display.value = formatDisplay(currentInput);
    lastWasOperator = ['+', '-', '*', '/'].includes(value);
}

function clearDisplay() {
    currentInput = '';
    display.value = '0';
    queryDisplay.textContent = '';
    queryDisplay.classList.remove('slide-up');
    shouldResetDisplay = false;
    lastWasOperator = false;
}

function toggleSign() {
    if (currentInput === '') return;
    
    if (currentInput.startsWith('-')) {
        currentInput = currentInput.substring(1);
    } else {
        currentInput = '-' + currentInput;
    }
    
    display.value = formatDisplay(currentInput);
}

function percentage() {
    if (currentInput === '') return;
    
    try {
        let expression = currentInput.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
        let result = eval(expression) / 100;
        
        // Show query in smaller text above
        queryDisplay.textContent = formatDisplay(currentInput) + ' %';
        queryDisplay.classList.add('slide-up');
        
        currentInput = result.toString();
        display.value = formatNumber(result);
        shouldResetDisplay = true;
    } catch (error) {
        display.value = 'Error';
        currentInput = '';
        shouldResetDisplay = true;
    }
}

function calculate() {
    if (currentInput === '') return;
    
    try {
        // Store the original query for display
        const originalQuery = currentInput;
        
        // Replace display symbols with actual operators
        let expression = currentInput
            .replace(/×/g, '*')
            .replace(/÷/g, '/')
            .replace(/−/g, '-');
        
        // Remove trailing operator if exists
        if (/[+\-*/]$/.test(expression)) {
            expression = expression.slice(0, -1);
        }
        
        if (expression === '') return;
        
        let result = eval(expression);
        
        // Handle division by zero and invalid results
        if (!isFinite(result)) {
            throw new Error('Cannot divide by zero');
        }
        
        // Show the query in smaller text above the result
        queryDisplay.textContent = formatDisplay(originalQuery) + ' =';
        queryDisplay.classList.add('slide-up');
        
        // Smooth transition for result display
        setTimeout(() => {
            currentInput = result.toString();
            display.value = formatNumber(result);
            shouldResetDisplay = true;
        }, 100);
        
    } catch (error) {
        display.value = 'Error';
        queryDisplay.textContent = '';
        queryDisplay.classList.remove('slide-up');
        currentInput = '';
        shouldResetDisplay = true;
    }
}

function formatDisplay(value) {
    // Replace operators with display symbols
    return value.replace(/\*/g, '×').replace(/\//g, '÷').replace(/-/g, '−');
}

function formatNumber(num) {
    // Format large numbers and limit decimal places
    if (Math.abs(num) < 1e-6 && num !== 0) {
        return num.toExponential(2);
    }
    
    if (num.toString().length > 12) {
        if (Number.isInteger(num)) {
            return num.toExponential(2);
        } else {
            return parseFloat(num.toPrecision(8)).toString();
        }
    }
    
    // Format with appropriate decimal places
    if (num % 1 === 0) {
        return num.toString();
    } else {
        return parseFloat(num.toFixed(8)).toString();
    }
}

// Keyboard support
document.addEventListener('keydown', function(event) {
    const key = event.key;
    
    if (key >= '0' && key <= '9') {
        appendToDisplay(key);
    } else if (key === '.') {
        appendToDisplay('.');
    } else if (key === '+') {
        appendToDisplay('+');
    } else if (key === '-') {
        appendToDisplay('-');
    } else if (key === '*') {
        appendToDisplay('*');
    } else if (key === '/') {
        event.preventDefault();
        appendToDisplay('/');
    } else if (key === 'Enter' || key === '=') {
        event.preventDefault();
        calculate();
    } else if (key === 'Escape' || key.toLowerCase() === 'c') {
        clearDisplay();
    } else if (key === '%') {
        percentage();
    }
});

// Add button press animations
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('mousedown', function() {
        this.style.transform = 'translateY(0) scale(0.95)';
    });
    
    button.addEventListener('mouseup', function() {
        this.style.transform = '';
    });
    
    button.addEventListener('mouseleave', function() {
        this.style.transform = '';
    });
});

// Initialize display
clearDisplay();
