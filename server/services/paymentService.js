const processPayment = async ({ amount, currency, method, transactionId }) => {
  return {
    success: true,
    transactionId: transactionId || `TXN-${Date.now()}`,
    verifiedAt: new Date()
  };
};

module.exports = { processPayment };
