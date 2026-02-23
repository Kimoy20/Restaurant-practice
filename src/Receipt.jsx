import { useRef } from 'react';

export default function Receipt({ order, onClose }) {
  const receiptRef = useRef();

  const handlePrint = () => {
    window.print();
  };

  const today = new Date().toLocaleDateString('en-PH', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ocean-900/60 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-md animate-slide-up my-8">
        <div 
          ref={receiptRef}
          className="receipt-paper p-8 text-ocean-900 relative overflow-hidden"
        >
          {/* Receipt Decor */}
          <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12 pointer-events-none">
            <span className="text-6xl text-palm">🔥</span>
          </div>

          <div className="text-center mb-8 border-b-2 border-dashed border-ocean-100 pb-6">
            <div className="w-16 h-16 bg-ocean-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🌴</span>
            </div>
            <h2 className="heading-display text-2xl text-palm leading-tight">Siaro Kaw BBQ</h2>
            <p className="text-sm text-sand-500 font-medium">Island Flavors & Good Vibes</p>
            <div className="mt-4 flex justify-between items-center text-[10px] uppercase tracking-widest text-sand-400 font-bold">
              <span>Order #{order.id}</span>
              <span>{today}</span>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-sand-500 border-b border-ocean-50 uppercase text-[10px] tracking-wider">
                  <th className="text-left py-2 font-bold">Item</th>
                  <th className="text-center py-2 font-bold">Qty</th>
                  <th className="text-right py-2 font-bold">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ocean-50/50">
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3 font-medium">{item.name}</td>
                    <td className="py-3 text-center text-sand-600">{item.quantity}</td>
                    <td className="py-3 text-right font-bold">₱{(item.price * item.quantity).toFixed(0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t-2 border-dashed border-ocean-100 pt-6 space-y-2">
            <div className="flex justify-between text-sand-600">
              <span className="text-sm">Subtotal</span>
              <span className="font-medium">₱{order.total.toFixed(0)}</span>
            </div>
            <div className="flex justify-between text-ocean-900 font-bold text-xl pt-2">
              <span>Total Amount</span>
              <span className="text-palm">₱{order.total.toFixed(0)}</span>
            </div>
          </div>

          <div className="mt-12 text-center text-sand-400">
            <p className="text-xs italic">"Mangaon ta! Salamat kaayo!"</p>
            <div className="mt-4 flex justify-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-ocean-100"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-ocean-200"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-ocean-100"></div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-4 print:hidden">
          <button
            onClick={handlePrint}
            className="flex-1 btn-primary py-4 group"
          >
            <span className="mr-2 group-hover:scale-110 transition-transform">🖨️</span>
            Print Receipt
          </button>
          <button
            onClick={onClose}
            className="flex-1 btn-secondary py-4"
          >
            Order More
          </button>
        </div>
      </div>
    </div>
  );
}
