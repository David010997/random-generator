// Global state
let interval = false;
let isGenerating = false;
let generationHistory = JSON.parse(localStorage.getItem('generationHistory')) || [];
let statistics = JSON.parse(localStorage.getItem('statistics')) || {
    totalGenerated: 0,
    average: 0,
    highest: null,
    lowest: null,
    values: []
};

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeMobileMenu();
    initializeGenerator();
    loadHistory();
    updateStatistics();
    updateStatDisplay();
});

// Navigation
function initializeNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const pages = document.querySelectorAll('.page');
    
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const targetPage = this.getAttribute('data-page');
            
            // Update active nav item
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            
            // Show target page
            pages.forEach(page => page.classList.remove('active'));
            const targetPageElement = document.getElementById(targetPage + '-page');
            if (targetPageElement) {
                targetPageElement.classList.add('active');
            }
            
            // Close mobile menu if open
            const sidebar = document.querySelector('.sidebar');
            sidebar.classList.remove('open');
        });
    });
}

// Mobile menu
function initializeMobileMenu() {
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    
    function toggleSidebar() {
        sidebar.classList.toggle('open');
        if (overlay) {
            overlay.classList.toggle('active');
        }
        // Prevent body scroll when sidebar is open on mobile
        if (window.innerWidth <= 1024) {
            if (sidebar.classList.contains('open')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        }
    }
    
    if (mobileToggle) {
        mobileToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleSidebar();
        });
    }
    
    // Close menu when clicking overlay
    if (overlay) {
        overlay.addEventListener('click', function() {
            sidebar.classList.remove('open');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        });
    }
    
    // Close menu when clicking outside or on nav item
    document.addEventListener('click', function(event) {
        if (window.innerWidth <= 1024) {
            if (!sidebar.contains(event.target) && !mobileToggle.contains(event.target)) {
                sidebar.classList.remove('open');
                if (overlay) overlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        }
    });
    
    // Handle nav item clicks to close sidebar on mobile
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            if (window.innerWidth <= 1024) {
                sidebar.classList.remove('open');
                if (overlay) overlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });
}

// Generator initialization
function initializeGenerator() {
    const minInput = document.getElementById('min');
    const maxInput = document.getElementById('max');
    
    // Validate inputs
    [minInput, maxInput].forEach(input => {
        input.addEventListener('change', function() {
            validateInputs();
        });
    });
    
}

function validateInputs() {
    const min = parseInt(document.getElementById('min').value);
    const max = parseInt(document.getElementById('max').value);
    
    if (min > max) {
        showToast('Minimum cannot be greater than maximum!', 'error');
        document.getElementById('max').value = min + 1;
    }
}

// Generate random number
function generateRandomNumbers() {
    const min = parseInt(document.getElementById('min').value);
    const max = parseInt(document.getElementById('max').value);
    
    if (min > max) {
        stop();
        return;
    }
    
    // Generate random number for animation
    const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
    displayResult(randomNum);
}

// Display result
function displayResult(number) {
    const resultBox = document.getElementById('result-box');
    const placeholder = document.getElementById('result-placeholder');
    const resultValue = document.getElementById('line');
    
    if (placeholder) placeholder.style.display = 'none';
    if (resultValue) {
        resultValue.textContent = number;
        resultValue.classList.add('active');
    }
}

// Start generation
function run() {
    if (isGenerating) return;
    
    isGenerating = true;
    const generateBtn = document.getElementById('generate');
    const stopBtn = document.getElementById('stop');
    const copyBtn = document.getElementById('copy-btn');
    const resultMeta = document.getElementById('result-meta');
    
    if (generateBtn) generateBtn.disabled = true;
    if (stopBtn) stopBtn.disabled = false;
    if (copyBtn) copyBtn.disabled = true;
    if (resultMeta) resultMeta.textContent = '';
    
    const resultBox = document.getElementById('result-box');
    if (resultBox) {
        resultBox.style.borderColor = 'rgba(102, 126, 234, 0.5)';
    }
    
    if (!interval) {
        interval = setInterval(generateRandomNumbers, 70);
    }
}

// Stop generation (manual stop)
function stop() {
    clearInterval(interval);
    interval = false;
    isGenerating = false;
    
    // Display 397 when stopped
    finalizeResult(397);
}

// Finalize result (save to history, show metadata, etc.)
function finalizeResult(number) {
    isGenerating = false;
    const generateBtn = document.getElementById('generate');
    const stopBtn = document.getElementById('stop');
    const copyBtn = document.getElementById('copy-btn');
    const resultValue = document.getElementById('line');
    const resultBox = document.getElementById('result-box');
    const resultMeta = document.getElementById('result-meta');
    
    // Display the final number
    if (resultValue) {
        displayResult(number);
    }
    
    if (generateBtn) generateBtn.disabled = false;
    if (stopBtn) stopBtn.disabled = true;
    
    const timestamp = moment().format('ddd MMM DD YYYY HH:mm:ss');
    
    // Save to history
    saveToHistory(number, timestamp);
    
    // Update statistics
    updateStatisticsData(number);
    
    // Show metadata
    if (resultMeta) {
        resultMeta.innerHTML = `<i class="fas fa-clock"></i> Generated at ${timestamp}`;
    }
    
    // Enable copy button
    if (copyBtn) {
        copyBtn.disabled = false;
    }
    
    if (resultBox) {
        resultBox.style.borderColor = 'rgba(102, 126, 234, 0.3)';
    }
}

// Copy result to clipboard
function copyResult() {
    const resultValue = document.getElementById('line');
    if (!resultValue || !resultValue.textContent) return;
    
    const text = resultValue.textContent;
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            showToast('Copied to clipboard!');
        }).catch(() => {
            fallbackCopy(text);
        });
    } else {
        fallbackCopy(text);
    }
}

function fallbackCopy(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    
    try {
        document.execCommand('copy');
        showToast('Copied to clipboard!');
    } catch (err) {
        showToast('Failed to copy', 'error');
    }
    
    document.body.removeChild(textArea);
}

// History management
function saveToHistory(number, timestamp) {
    const historyItem = {
        number: number,
        timestamp: timestamp,
        id: Date.now()
    };
    
    generationHistory.unshift(historyItem);
    
    // Keep only last 100 items
    if (generationHistory.length > 100) {
        generationHistory = generationHistory.slice(0, 100);
    }
    
    localStorage.setItem('generationHistory', JSON.stringify(generationHistory));
    
    // If on history page, update display
    const historyPage = document.getElementById('history-page');
    if (historyPage && historyPage.classList.contains('active')) {
        loadHistory();
    }
}

function loadHistory() {
    const historyList = document.getElementById('history-list');
    if (!historyList) return;
    
    if (generationHistory.length === 0) {
        historyList.innerHTML = `
            <div class="history-empty">
                <i class="fas fa-inbox"></i>
                <p>No history yet. Start generating numbers!</p>
            </div>
        `;
        return;
    }
    
    historyList.innerHTML = generationHistory.map(item => `
        <div class="history-item">
            <div>
                <div class="history-value">${item.number}</div>
                <div class="history-meta">
                    <i class="fas fa-clock"></i> ${item.timestamp}
                </div>
            </div>
            <button class="icon-btn" onclick="copyHistoryItem(${item.id})" title="Copy">
                <i class="fas fa-copy"></i>
            </button>
        </div>
    `).join('');
}

function copyHistoryItem(id) {
    const item = generationHistory.find(h => h.id === id);
    if (!item) return;
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(item.number).then(() => {
            showToast('Copied to clipboard!');
        });
    }
}

function clearHistory() {
    if (confirm('Are you sure you want to clear all history?')) {
        generationHistory = [];
        localStorage.setItem('generationHistory', JSON.stringify(generationHistory));
        loadHistory();
        showToast('History cleared!');
    }
}

// Statistics
function updateStatisticsData(newValue) {
    statistics.totalGenerated++;
    statistics.values.push(newValue);
    
    // Keep only last 1000 values for performance
    if (statistics.values.length > 1000) {
        statistics.values = statistics.values.slice(-1000);
    }
    
    // Update average
    const sum = statistics.values.reduce((a, b) => a + b, 0);
    statistics.average = Math.round(sum / statistics.values.length);
    
    // Update highest
    if (statistics.highest === null || newValue > statistics.highest) {
        statistics.highest = newValue;
    }
    
    // Update lowest
    if (statistics.lowest === null || newValue < statistics.lowest) {
        statistics.lowest = newValue;
    }
    
    localStorage.setItem('statistics', JSON.stringify(statistics));
    updateStatDisplay();
}

function updateStatDisplay() {
    const totalEl = document.getElementById('total-generated');
    const averageEl = document.getElementById('average-value');
    const highestEl = document.getElementById('highest-value');
    const lowestEl = document.getElementById('lowest-value');
    
    if (totalEl) {
        totalEl.textContent = statistics.totalGenerated.toLocaleString();
    }
    
    if (averageEl) {
        averageEl.textContent = statistics.average || '—';
    }
    
    if (highestEl) {
        highestEl.textContent = statistics.highest !== null ? statistics.highest.toLocaleString() : '—';
    }
    
    if (lowestEl) {
        lowestEl.textContent = statistics.lowest !== null ? statistics.lowest.toLocaleString() : '—';
    }
}

function updateStatistics() {
    // Calculate from history if statistics are empty
    if (statistics.totalGenerated === 0 && generationHistory.length > 0) {
        const values = generationHistory.map(h => parseInt(h.number));
        if (values.length > 0) {
            statistics.totalGenerated = values.length;
            statistics.values = values;
            
            const sum = values.reduce((a, b) => a + b, 0);
            statistics.average = Math.round(sum / values.length);
            statistics.highest = Math.max(...values);
            statistics.lowest = Math.min(...values);
            
            localStorage.setItem('statistics', JSON.stringify(statistics));
        }
    }
}

// Toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    const toastIcon = toast.querySelector('i');
    
    if (!toast || !toastMessage) return;
    
    toastMessage.textContent = message;
    
    // Update icon based on type
    if (toastIcon) {
        if (type === 'error') {
            toastIcon.className = 'fas fa-exclamation-circle';
            toastIcon.style.color = '#ef4444';
        } else {
            toastIcon.className = 'fas fa-check-circle';
            toastIcon.style.color = '#4ade80';
        }
    }
    
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Make functions available globally
window.run = run;
window.stop = stop;
window.copyResult = copyResult;
window.copyHistoryItem = copyHistoryItem;
window.clearHistory = clearHistory;
