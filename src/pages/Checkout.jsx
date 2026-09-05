import { useParams } from 'react-router-dom';
export default function Checkout() {
  const { id } = useParams();
  return <div style={{ paddingTop: '150px', textAlign: 'center', color: '#fff' }}>Checkout for Account ID: {id}</div>;
}