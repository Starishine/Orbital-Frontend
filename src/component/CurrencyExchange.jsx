import { useState, useEffect } from 'react';
import axios from 'axios';
import React from "react";

// CurrencyExchange: Component for converting between currencies using live exchange rates
export default function CurrencyExchange() {
  const [rates, setRates] = useState({}); // Stores fetched exchange rates
  const [amount, setAmount] = useState(1); // Amount to convert
  const [fromCurrency, setFromCurrency] = useState('SGD'); // Source currency
  const [toCurrency, setToCurrency] = useState('INR'); // Target currency
  const [convertedAmount, setConvertedAmount] = useState(null); // Result

  useEffect(() => {
    // Fetch exchange rates from a public API on mount
    axios
      .get('https://api.exchangerate-api.com/v4/latest/USD') // gets the latest exchange rates
      .then((response) => {
        setRates(response.data.rates);
      })
      .catch((error) => {
        console.error('Error fetching exchange rates:', error);
      });
  }, []);

  // Handle conversion when user clicks "Convert"
  const handleConvert = () => {
    if (rates[fromCurrency] && rates[toCurrency]) { // Check if both currencies are available
      // Convert the amount using the exchange rate
      const rate = rates[toCurrency] / rates[fromCurrency];
      setConvertedAmount((amount * rate).toFixed(2));
    }
  };

  // Theme object for consistent styling with dashboard
  const theme = {
    primary: '#1976d2',
    accent: '#90caf9',
    card: '#fff',
    dark: '#263859',
    border: '#e3f2fd',
    shadow: '0 4px 24px rgba(25, 118, 210, 0.10)'
  };

  return (
    <>
      {/* Main card container styled to match dashboard */}
      <div
        style={{
          maxWidth: 600,
          margin: '40px auto',
          background: theme.card,
          borderRadius: 18,
          boxShadow: theme.shadow,
          padding: '32px',
          border: `1px solid ${theme.border}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        {/* Title */}
        <h1 style={{
          color: theme.primary,
          fontWeight: 800,
          fontSize: 32,
          marginBottom: 24,
          textAlign: 'center',
          letterSpacing: 1
        }}>
          Currency Exchange
        </h1>
        {/* Input fields and selectors */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
          width: '100%',
          alignItems: 'center'
        }}>
          {/* Amount input */}
          <label style={{ fontWeight: 600, color: theme.dark, fontSize: 18, width: '100%', textAlign: 'left' }}>
            Amount:
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={{
                marginLeft: '10px',
                padding: '10px 16px',
                borderRadius: 8,
                border: `1px solid ${theme.border}`,
                fontSize: 18,
                width: 140,
                outline: 'none',
                marginTop: 8
              }}
            />
          </label>
          {/* Currency selectors */}
          <div style={{ display: 'flex', gap: 24, width: '100%', justifyContent: 'center' }}>
            {/* From currency dropdown */}
            <label style={{ fontWeight: 600, color: theme.dark, fontSize: 18 }}>
              From:
              <select
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value)}
                style={{
                  marginLeft: '10px',
                  padding: '10px 16px',
                  borderRadius: 8,
                  border: `1px solid ${theme.border}`,
                  fontSize: 18,
                  background: theme.accent,
                  color: theme.dark,
                  outline: 'none',
                  marginTop: 8
                }}
              >
                {Object.keys(rates).map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
            </label>
            {/* To currency dropdown */}
            <label style={{ fontWeight: 600, color: theme.dark, fontSize: 18 }}>
              To:
              <select
                value={toCurrency}
                onChange={(e) => setToCurrency(e.target.value)}
                style={{
                  marginLeft: '10px',
                  padding: '10px 16px',
                  borderRadius: 8,
                  border: `1px solid ${theme.border}`,
                  fontSize: 18,
                  background: theme.accent,
                  color: theme.dark,
                  outline: 'none',
                  marginTop: 8
                }}
              >
                {Object.keys(rates).map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {/* Convert button */}
          <button
            onClick={handleConvert}
            style={{
              marginTop: 10,
              background: theme.primary,
              color: theme.card,
              border: 'none',
              borderRadius: 8,
              padding: '12px 32px',
              fontWeight: 700,
              fontSize: 18,
              cursor: 'pointer',
              boxShadow: theme.shadow,
              transition: 'background 0.2s'
            }}
            onMouseOver={e => e.currentTarget.style.background = theme.dark}
            onMouseOut={e => e.currentTarget.style.background = theme.primary}
          >
            Convert
          </button>
        </div>
        {/* Result output */}
        {convertedAmount && (
          <div
            style={{
              marginTop: 32,
              padding: '18px',
              background: theme.accent,
              borderRadius: 12,
              textAlign: 'center',
              color: theme.dark,
              fontWeight: 700,
              fontSize: 20,
              boxShadow: '0 2px 8px rgba(25, 118, 210, 0.08)'
            }}
          >
            {amount} {fromCurrency} = {convertedAmount} {toCurrency}
          </div>
        )}
      </div>
    </>
  );
}