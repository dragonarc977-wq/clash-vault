import { Suspense } from 'react';
import MyOrders from '../../src/MyOrders';

export const metadata = { title: 'My Orders' };

export default function Page() {
  return (
    <Suspense fallback={null}>
      <MyOrders />
    </Suspense>
  );
}
