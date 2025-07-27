import { useState, useEffect } from 'react';
import axios from 'axios';
import React from "react";

// CurrencyDropdown: Dropdown component for selecting a currency
// Fetches currency rates from a public API and lists all available currencies
export default function CurrencyDropdown({ currency, setCurrency }) {
    const [rates, setRates] = useState({});


    useEffect(() => {
        // if (!localStorage.getItem('currency')) {
        //     localStorage.setItem('currency', 'SGD'); // Default to SGD if no currency is set
        // }

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

    return (
        // Currency select dropdown
        <select
            value={currency}
            onChange={e => {
                setCurrency(e.target.value);
                localStorage.setItem('currency', e.target.value);
            }}
            style={{
                padding: '6px 10px',
                borderRadius: 6,
                border: '1px solid #1976d2',
                fontSize: 15,
                background: '#f5f5f5',
                color: '#263859',
                minWidth: 80,
                marginLeft: 0,
                marginRight: 0
            }}
        >
            {/* Render all available currencies as options */}
            {Object.keys(rates).map((currency) => (
                <option key={currency} value={currency}>
                    {currency}
                </option>
            ))}
        </select>
    );

}