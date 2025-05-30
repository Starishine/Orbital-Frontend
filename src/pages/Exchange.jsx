import CurrencyExchange from '../component/CurrencyExchange';
import { Link } from 'react-router-dom';

export default function Exchange() {
  return (
    <>
      <nav style={{ marginTop: '24px', display: 'flex', gap: '16px' }}>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/exchange">Exchange</Link>
      </nav>
      <CurrencyExchange />

    </>
  );
}