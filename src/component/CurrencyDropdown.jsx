import { useState, useEffect } from 'react';
import axios from 'axios';

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
        <div>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>
                Select Currency:
                <select
                    value={currency}
                    onChange={e => {
                        setCurrency(e.target.value);
                        localStorage.setItem('currency', e.target.value);
                    }}
                    style={{ marginLeft: '10px', marginRight: '20px' }}
                >
                    {Object.keys(rates).map((currency) => (
                        <option key={currency} value={currency}>
                            {currency}
                        </option>
                    ))}
                </select>
            </label>

        </div>
    )

}