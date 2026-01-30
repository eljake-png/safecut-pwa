# Звіт Bruteforce пошуку цін

## Знайдені рядки коду з цінами/грошима:
```typescript
[src/app/booking/[id]/crypto/page.tsx:12]  const amountParam = searchParams.get('amount');
[src/app/booking/[id]/crypto/page.tsx:13]  const PRICE = amountParam ? parseFloat(amountParam) : 15.02;
[src/app/booking/[id]/crypto/page.tsx:37]  <span className="font-bold text-xl">{PRICE} USDT</span>
[src/app/booking/[id]/crypto/page.tsx:58]  amount={PRICE}
[src/app/booking/[id]/services/page.tsx:15]  { id: 'haircut', name: 'Чоловіча стрижка', price: 500, selected: true, locked: true },
[src/app/booking/[id]/services/page.tsx:16]  { id: 'beard', name: 'Стрижка бороди', price: 100, selected: false, locked: false },
[src/app/booking/[id]/services/page.tsx:17]  { id: 'family', name: 'Батько і Син', price: 300, selected: false, locked: false },
[src/app/booking/[id]/services/page.tsx:32]  const totalPrice = services.reduce((acc, s) => s.selected ? acc + s.price : acc, 0);
[src/app/booking/[id]/services/page.tsx:86]  totalPrice: totalPrice,
[src/app/booking/[id]/services/page.tsx:102]  router.push(`/booking/${id}/crypto?amount=${totalPrice}&orderId=${docRef.id}`);
[src/app/booking/[id]/services/page.tsx:152]  <span className="font-mono text-lg">{service.price} ₴</span>
[src/app/booking/[id]/services/page.tsx:189]  <span className="text-2xl font-black">{totalPrice} ₴</span>
[src/app/payment/page.tsx:16]  const PRICE = 15.02; // Унікальна сума для тесту
[src/app/payment/page.tsx:40]  <span className="font-bold text-xl">{PRICE} USDT</span>
[src/app/payment/page.tsx:62]  amount={PRICE}
[src/app/loyalty/page.tsx:90]  const progressPercent = Math.min((currentProgress / neededForBonus) * 100, 100);
[src/app/loyalty/page.tsx:155]  style={{ width: `${progressPercent}%` }}
[src/app/barber/schedule/page.tsx:16]  price: number;
[src/app/barber/schedule/page.tsx:17]  currency: 'UAH' | 'USDT';
[src/app/barber/schedule/page.tsx:39]  price: data.price,
[src/app/barber/mission/[id]/page.tsx:17]  price: 600,
[src/app/barber/dashboard/page.tsx:13]  totalPrice: number;
[src/app/barber/dashboard/page.tsx:103]  {req.totalPrice}<span className="text-lg text-zinc-600 align-top ml-0.5">{req.paymentMethod === 'crypto' ? '' : '₴'}</span>
[src/app/barber/dashboard/page.tsx:206]  app.paymentMethod === 'crypto' ? newStats.crypto += Number(app.totalPrice) : newStats.cash += Number(app.totalPrice);
[src/app/barber/dashboard/page.tsx:290]  <Coffee size={32} className="mb-2 opacity-20" />
[src/components/payment/CryptoStatus.tsx:6]  amount: number;
[src/components/payment/CryptoStatus.tsx:10]  export default function CryptoStatus({ wallet, amount, onSuccess }: Props) {
[src/components/payment/CryptoStatus.tsx:11]  const { status, error } = useCryptoPaymentVerifier(wallet, amount);
[src/hooks/useCryptoPaymentVerifier.ts:20]  export const useCryptoPaymentVerifier = (walletAddress: string, expectedAmount: number) => {
[src/hooks/useCryptoPaymentVerifier.ts:60]  const expectedValue = (expectedAmount * 1_000_000).toString();
```


## Висновок для Агента-Економіста:
- Використовуй знайдені вище цифри як 'Hard Facts'.
- Якщо цифр мало — вважай, що решта цін приходить з БД.