"use client";

export default function DevelopersPage() {
    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Developer Documentation</h1>
                <p className="mt-2 text-gray-600">
                    Official specification for connecting external systems and receiving webhook events from AZERRA.
                </p>
            </div>

            <section className="bg-white rounded-xl shadow-sm border p-6 space-y-6">
                <div className="flex items-center gap-3 border-b pb-4">
                    <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600 font-bold">1</div>
                    <h2 className="text-xl font-semibold">External Webhook Specification (V1)</h2>
                </div>

                <div className="space-y-4">
                    <p className="text-gray-700">
                        AZERRA can fire real-time webhooks to your custom backend whenever an order is confirmed or a payment is received.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="bg-gray-50 p-4 rounded-lg border">
                            <span className="font-semibold text-gray-500 uppercase text-xs block mb-1">Method</span>
                            <code className="text-primary-700 font-bold">POST</code>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg border">
                            <span className="font-semibold text-gray-500 uppercase text-xs block mb-1">Content-Type</span>
                            <code className="text-primary-700 font-bold">application/json</code>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <h3 className="font-medium text-gray-900">Security (HMAC-SHA256)</h3>
                    <p className="text-sm text-gray-600">
                        Every request is signed with your secret key. You should verify this signature to ensure the request came from AZERRA.
                    </p>
                    <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm text-blue-300 overflow-x-auto">
                        X-Sellbot-Signature: &lt;hex-hmac-sha256-signature&gt;
                    </div>
                </div>

                <div className="space-y-3">
                    <h3 className="font-medium text-gray-900">Standard Payload</h3>
                    <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm text-green-400 overflow-x-auto">
                        {`{
  "event": "order.confirmed",
  "order_id": "uuid-string",
  "timestamp": "2026-03-03T14:30:00Z",
  "customer": {
    "name": "Customer Name",
    "phone": "+2348000000000",
    "address": "Delivery Address"
  },
  "financials": {
    "product_subtotal": 46500.0,
    "shipping_fee": 1000.0,
    "total": 47500.0
  },
  "items": [
    {
      "product_id": "uuid",
      "name": "Product Name",
      "quantity": 1,
      "unit_price": 22000.0
    }
  ],
  "payment_mode": "paystack"
}`}
                    </div>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <span className="text-blue-400">ℹ️</span>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-blue-700">
                                <strong>Upsert Pattern:</strong> We recommend using the <code>order_id</code> as a unique key in your database.
                                AZERRA will send the <code>order.confirmed</code> event when the order is created and again when it is paid.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <div className="flex justify-center text-sm text-gray-400 pb-8">
                © 2026 AZERRA Technologies • Version 1.0.0
            </div>
        </div>
    );
}
