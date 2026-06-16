# BullRun Trends - Yahoo Finance Top Gainers Dashboard

BullRun Trends is a premium, real-time stock monitoring dashboard that scrapes the top 20 performing stocks from Yahoo Finance, displays them in a modern glassmorphic interface, and provides an integrated workspace to compose and post updates to X (formerly Twitter).

---

## 🌟 Features

*   **Real-time Yahoo Finance Scraper**: Asynchronously pulls market gainers, including ticker symbol, name, price, absolute change, and percentage increase.
*   **Premium Glassmorphic UI**: High-end dark theme incorporating radial gradient backdrops, smooth scale animations, and custom typography (`Outfit` and `Inter`).
*   **Loading Skeleton States**: Avoids layout shifting by rendering pulsing skeleton rows while background requests are loading.
*   **Integrated Twitter Composer**:
    *   Pre-drafts highly engaging posts with actual stock performance details.
    *   Live 280-character limit tracking using a color-changing SVG progress ring.
    *   Native Web Intent integration to post directly to your Twitter feed.
*   **Dynamic Reloading**: Immediate data refreshes via the **Refresh Data** spinner button.

---

## 📁 Project Structure

```
my_first_project/
├── app.py                  # Flask backend server & scraper logic
├── README.md               # Project documentation
├── templates/
│   └── index.html          # Main HTML structure
└── static/
    ├── css/
    │   └── style.css       # Custom styling and animations
    └── js/
        └── main.js         # API integration and composer states
```

---

## 🛠️ Installation & Setup

### 1. Install Dependencies
Ensure you have Python 3 installed. Install the required modules via pip:
```bash
pip install flask beautifulsoup4 requests
```

### 2. Run the Server
Launch the Flask development server:
```bash
python3 app.py
```

### 3. Open in Browser
Once running, navigate to the local server URL:
```
http://127.0.0.1:5001
```

---

## 📝 How to Use

1.  **View Gainer Tickers**: The app will automatically fetch the latest top 20 stock performers on load.
2.  **Refresh Data**: Click the **Refresh Data** button to execute a live scraping request to Yahoo Finance.
3.  **Compose a Tweet**: Click on any stock row. The Twitter Station on the right will activate, displaying a generated draft showing the stock's latest performance.
4.  **Edit and Post**: Edit the draft inside the text area if desired. Watch the circular progress ring update character limits. Click **Post on X** to open a Twitter intent window and share your update.
