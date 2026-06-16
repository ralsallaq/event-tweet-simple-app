import logging
import requests
from bs4 import BeautifulSoup
from flask import Flask, jsonify, render_template

# Initialize Flask App
app = Flask(__name__)

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def fetch_top_gainers():
    """
    Scrapes Yahoo Finance for top stock gainers.
    Returns a list of dictionaries with stock details.
    """
    url = "https://finance.yahoo.com/markets/stocks/gainers/"
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache"
    }

    try:
        logging.info("Fetching top gainers from Yahoo Finance...")
        response = requests.get(url, headers=headers, timeout=10)
        
        if response.status_code != 200:
            logging.error(f"Failed to fetch Yahoo Finance. Status code: {response.status_code}")
            return None
            
        soup = BeautifulSoup(response.text, "html.parser")
        tables = soup.find_all("table")
        
        if not tables:
            logging.error("No tables found in the Yahoo Finance response.")
            return None
            
        table = tables[0]
        rows = table.find_all("tr")[1:]  # skip header row
        
        gainers = []
        for row in rows:
            cells = row.find_all("td")
            if len(cells) >= 6:
                symbol = cells[0].text.strip()
                name = cells[1].text.strip()
                
                # cells[3] has the price, which might look like: "110.19  +10.53 (+10.56%)"
                price_text = cells[3].text.strip()
                price = price_text.split()[0] if price_text else "0.00"
                
                change = cells[4].text.strip()
                change_pct = cells[5].text.strip()
                
                gainers.append({
                    "symbol": symbol,
                    "name": name,
                    "price": price,
                    "change": change,
                    "change_pct": change_pct
                })
                
                # Stop if we have the top 20
                if len(gainers) >= 20:
                    break
                    
        logging.info(f"Successfully parsed {len(gainers)} top gainers.")
        return gainers
        
    except requests.exceptions.RequestException as e:
        logging.error(f"Network error while fetching stock data: {e}")
        return None
    except Exception as e:
        logging.error(f"Unexpected error while parsing stock data: {e}")
        return None


@app.route("/")
def index():
    """Serves the main application page."""
    return render_template("index.html")


@app.route("/api/gainers")
def api_gainers():
    """API endpoint returning top 20 gainers as JSON."""
    data = fetch_top_gainers()
    if data is None:
        return jsonify({
            "status": "error",
            "message": "Failed to retrieve stock gainers from Yahoo Finance. Please try refreshing."
        }), 500
        
    return jsonify({
        "status": "success",
        "data": data
    })


if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=5001)
