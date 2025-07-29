export function ProcessingOverlay() {
  return (
    <div className="fixed inset-0 bg-gradient-to-b from-yellow-200 to-yellow-300 flex items-center justify-center z-[999999]">
      <div className="text-center max-w-md px-6">
        <div className="text-6xl mb-8">🍐</div>
        <p className="text-gray-800 text-lg mb-8 leading-relaxed">
          Pear is intercepting this payment page, please kindly wait...
        </p>
        <div className="flex justify-center mb-8">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-gray-800 rounded-full animate-spin"></div>
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Processing Payment
        </h2>
        <p className="text-sm text-gray-600">
          Your payment is being processed...
        </p>
      </div>
    </div>
  );
}
