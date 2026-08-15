const PaymentSettings = require('../models/PaymentSettings');

const PAYMENT_METHODS = ['cod', 'easypaisa', 'jazzcash', 'bank', 'card', 'upi'];

const methodKey = (method) => String(method || '').toLowerCase().replace(/[^a-z0-9]/g, '');

const isSupported = (method) => PAYMENT_METHODS.includes(methodKey(method));

const getSettings = async (req, res) => {
  try {
    const method = methodKey(req.params.method || req.body.method);
    if (!isSupported(method)) {
      return res.status(400).json({ success: false, message: 'Unsupported payment method' });
    }

    let settings = await PaymentSettings.findOne({ method });
    if (!settings) {
      settings = await PaymentSettings.create({
        method,
        accountName: method === 'easypaisa' ? (process.env.EASYPAYSA_ACCOUNT_NAME || 'UniPrime Wall Clocks') : '',
        accountNumber: method === 'easypaisa' ? (process.env.EASYPAYSA_PHONE_NUMBER || '03XXXXXXXXX') : '',
        instructions: defaultInstructions(method),
        isActive: true
      });
    }

    res.json({
      success: true,
      data: {
        method: settings.method,
        accountName: settings.accountName,
        accountNumber: settings.accountNumber,
        instructions: settings.instructions,
        qrCode: settings.qrCode,
        isActive: settings.isActive
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateSettings = async (req, res) => {
  try {
    const method = methodKey(req.params.method);
    if (!isSupported(method)) {
      return res.status(400).json({ success: false, message: 'Unsupported payment method' });
    }

    const { accountName, accountNumber, instructions, qrCode, isActive } = req.body;
    let settings = await PaymentSettings.findOne({ method });
    if (!settings) {
      settings = new PaymentSettings({ method });
    }
    if (accountName !== undefined) settings.accountName = accountName;
    if (accountNumber !== undefined) settings.accountNumber = accountNumber;
    if (instructions !== undefined) settings.instructions = instructions;
    if (qrCode !== undefined) settings.qrCode = qrCode;
    if (isActive !== undefined) settings.isActive = isActive;
    settings.updatedBy = req.user._id;
    await settings.save();
    res.json({ success: true, message: 'Payment settings updated', data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllActiveMethods = async (req, res) => {
  try {
    const settings = await PaymentSettings.find({ isActive: true });
    const byMethod = {};
    settings.forEach(s => { byMethod[s.method] = s; });

    const result = PAYMENT_METHODS.map(method => {
      const s = byMethod[method];
      return {
        method,
        isActive: s ? s.isActive : true,
        accountName: s?.accountName || '',
        accountNumber: s?.accountNumber || '',
        instructions: s?.instructions || '',
        qrCode: s?.qrCode || null
      };
    });

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

function defaultInstructions(method) {
  if (method === 'cod') {
    return 'Pay cash when your order is delivered to your doorstep.';
  }
  if (method === 'bank') {
    return '1. Transfer the exact order amount to our bank account\n2. Take a screenshot of the successful transfer\n3. Upload the screenshot below\n4. Submit your payment proof';
  }
  if (method === 'jazzcash') {
    return '1. Open JazzCash app\n2. Send the exact order amount to the number below\n3. Take a screenshot of the successful payment\n4. Upload the screenshot below\n5. Submit your payment proof';
  }
  if (method === 'easypaisa') {
    return '1. Open Easypaisa app\n2. Send the exact order amount\n3. Take a screenshot of the successful payment\n4. Upload the screenshot below\n5. Submit your payment proof';
  }
  if (method === 'card') {
    return 'Pay securely with your debit or credit card at checkout.';
  }
  if (method === 'upi') {
    return 'Pay using your UPI app at checkout.';
  }
  return '';
}

module.exports = { getSettings, updateSettings, getAllActiveMethods, PAYMENT_METHODS };
