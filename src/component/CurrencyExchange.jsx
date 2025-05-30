import { useState, useEffect } from 'react';
import axios from 'axios';

export default function CurrencyExchange() {
  const [rates, setRates] = useState({}); // initalize rates as an empty array
  const [amount, setAmount] = useState(1);
  const [fromCurrency, setFromCurrency] = useState('SGD');
  const [toCurrency, setToCurrency] = useState('INR');
  const [convertedAmount, setConvertedAmount] = useState(null);

  useEffect(() => {
    // Fetch exchange rates from a public API 
    axios
      .get('https://api.exchangerate-api.com/v4/latest/USD') // gets the latest exchange rates
      .then((response) => {
        setRates(response.data.rates);
      })
      .catch((error) => {
        console.error('Error fetching exchange rates:', error);
      });
  }, []);

  const handleConvert = () => {
    if (rates[fromCurrency] && rates[toCurrency]) { //checks if the selected currencies are available in the rates
      // Convert the amount using the exchange rate
      const rate = rates[toCurrency] / rates[fromCurrency];
      setConvertedAmount((amount * rate).toFixed(2));
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Currency Exchange</h1>
      <div>
        <label>
          Amount:
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{ marginLeft: '10px', marginRight: '20px' }}
          />
        </label>
        <label>
          From:
          <select // Currency selection dropdown 
            value={fromCurrency}
            onChange={(e) => setFromCurrency(e.target.value)}
            style={{ marginLeft: '10px', marginRight: '20px' }}
          >
            {Object.keys(rates).map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
        </label>
        <label>
          To:
          <select
            value={toCurrency}
            onChange={(e) => setToCurrency(e.target.value)}
            style={{ marginLeft: '10px', marginRight: '20px' }}
          >
            {Object.keys(rates).map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
        </label >

        <button onClick={handleConvert} style={{ marginLeft: '10px' }}>
          Convert
        </button>
      </div>
      {convertedAmount && (
        <p>
          {amount} {fromCurrency} = {convertedAmount} {toCurrency}
        </p>
      )}
    </div>
  );
}