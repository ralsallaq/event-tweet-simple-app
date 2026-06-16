document.addEventListener('DOMContentLoaded', () => {
    // State management
    let stocksData = [];
    let selectedStock = null;
    const MAX_CHARS = 280;

    // DOM Elements
    const btnRefresh = document.getElementById('btn-refresh');
    const spinnerIcon = document.getElementById('spinner-icon');
    const stockList = document.getElementById('stock-list');
    const skeletonLoader = document.getElementById('skeleton-loader');
    const errorMessage = document.getElementById('error-message');
    const errorDescription = document.getElementById('error-description');
    
    // Composer elements
    const composerEmptyState = document.getElementById('composer-empty-state');
    const composerActiveState = document.getElementById('composer-active-state');
    const composerTickerSymbol = document.getElementById('composer-ticker-symbol');
    const composerTickerName = document.getElementById('composer-ticker-name');
    const tweetTextarea = document.getElementById('tweet-textarea');
    const charCount = document.getElementById('char-count');
    const charProgress = document.getElementById('char-progress');
    const btnTweet = document.getElementById('btn-tweet');
    const btnDeselect = document.getElementById('btn-deselect');

    // Circular Progress Ring setup
    const circleRadius = 14;
    const circumference = 2 * Math.PI * circleRadius;
    if (charProgress) {
        charProgress.style.strokeDasharray = `${circumference} ${circumference}`;
        charProgress.style.strokeDashoffset = circumference;
    }

    // Initialize the app
    fetchStocks();

    // Event Listeners
    btnRefresh.addEventListener('click', fetchStocks);
    btnDeselect.addEventListener('click', clearSelection);
    
    if (tweetTextarea) {
        tweetTextarea.addEventListener('input', updateTweetComposerStatus);
    }

    // Functions
    async function fetchStocks() {
        showLoadingState();
        try {
            const response = await fetch('/api/gainers');
            const result = await response.json();
            
            if (result.status === 'success') {
                stocksData = result.data;
                renderStocks(stocksData);
                hideErrorState();
            } else {
                showErrorState(result.message || 'Unable to fetch stock data.');
            }
        } catch (error) {
            console.error('Error fetching stock data:', error);
            showErrorState('Network connection error. Please check your internet connection and try again.');
        } finally {
            hideLoadingState();
        }
    }

    function showLoadingState() {
        btnRefresh.disabled = true;
        spinnerIcon.classList.add('spinning');
        stockList.classList.add('hidden');
        skeletonLoader.classList.remove('hidden');
        errorMessage.classList.add('hidden');
    }

    function hideLoadingState() {
        btnRefresh.disabled = false;
        spinnerIcon.classList.remove('spinning');
        skeletonLoader.classList.add('hidden');
        stockList.classList.remove('hidden');
    }

    function showErrorState(message) {
        errorDescription.textContent = message;
        errorMessage.classList.remove('hidden');
        stockList.innerHTML = '';
    }

    function hideErrorState() {
        errorMessage.classList.add('hidden');
    }

    function renderStocks(stocks) {
        stockList.innerHTML = '';
        
        if (!stocks || stocks.length === 0) {
            stockList.innerHTML = '<div class="no-data">No stock gainers found.</div>';
            return;
        }

        stocks.forEach((stock, index) => {
            const card = document.createElement('div');
            card.className = 'stock-card';
            card.id = `stock-card-${stock.symbol}`;
            
            // Re-apply selected class if it's already selected
            if (selectedStock && selectedStock.symbol === stock.symbol) {
                card.classList.add('selected');
            }

            card.innerHTML = `
                <div class="stock-info">
                    <span class="stock-index">#${index + 1}</span>
                    <div class="stock-ticker-box">
                        <span class="stock-symbol">${stock.symbol}</span>
                        <span class="stock-name" title="${stock.name}">${stock.name}</span>
                    </div>
                </div>
                <div class="stock-price-box">
                    <span class="stock-price">$${stock.price}</span>
                    <div class="stock-price-label">Share Price</div>
                </div>
                <div class="stock-change-box">
                    <span class="change-percent-badge">
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 1L9 5M9 5L5 9M9 5H1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        ${stock.change_pct}
                    </span>
                    <span class="change-absolute">${stock.change}</span>
                </div>
            `;

            card.addEventListener('click', () => selectStock(stock));
            stockList.appendChild(card);
        });
    }

    function selectStock(stock) {
        selectedStock = stock;
        
        // Update selection UI classes on list cards
        document.querySelectorAll('.stock-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        const selectedCard = document.getElementById(`stock-card-${stock.symbol}`);
        if (selectedCard) {
            selectedCard.classList.add('selected');
        }

        // Show active composer state
        composerEmptyState.classList.add('hidden');
        composerActiveState.classList.remove('hidden');

        // Set composer contents
        composerTickerSymbol.textContent = stock.symbol;
        composerTickerName.textContent = stock.name;

        // Formulate standard template
        const defaultTweet = `Just checked $${stock.symbol} (${stock.name}) on Yahoo Finance! It's one of the top gainers, trading at $${stock.price} (up ${stock.change_pct} today) 🚀📈 #stocks #finance #investing https://finance.yahoo.com/quote/${stock.symbol}`;
        tweetTextarea.value = defaultTweet;

        updateTweetComposerStatus();
        
        // Smooth scroll to composer panel on small devices
        if (window.innerWidth <= 1024) {
            composerActiveState.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    function clearSelection() {
        selectedStock = null;
        document.querySelectorAll('.stock-card').forEach(card => {
            card.classList.remove('selected');
        });

        composerActiveState.classList.add('hidden');
        composerEmptyState.classList.remove('hidden');
    }

    function updateTweetComposerStatus() {
        const text = tweetTextarea.value;
        const currentLength = text.length;
        const remaining = MAX_CHARS - currentLength;

        // Update character counter text
        charCount.textContent = remaining;

        // Manage circular progress ring
        const progress = Math.min(currentLength / MAX_CHARS, 1);
        const offset = circumference - (progress * circumference);
        charProgress.style.strokeDashoffset = offset;

        // Color coding classes based on length
        charCount.classList.remove('char-warning', 'char-error');
        if (remaining <= 20 && remaining >= 0) {
            charCount.classList.add('char-warning');
            charProgress.style.stroke = '#f59e0b';
        } else if (remaining < 0) {
            charCount.classList.add('char-error');
            charProgress.style.stroke = '#ef4444';
        } else {
            charProgress.style.stroke = '#00e676';
        }

        // Disable/enable Tweet button
        if (remaining < 0 || currentLength === 0) {
            btnTweet.classList.add('disabled');
            btnTweet.removeAttribute('href');
        } else {
            btnTweet.classList.remove('disabled');
            // Twitter Web Intent link URL encoding
            const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
            btnTweet.setAttribute('href', tweetUrl);
        }
    }
});
