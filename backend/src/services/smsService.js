const axios = require('axios');

class SMSService {
  constructor() {
    this.apiKey = process.env.AT_API_KEY;
    this.username = process.env.AT_USERNAME;
    this.senderId = process.env.SMS_SENDER_ID || 'GrowRight';
    this.baseUrl = 'https://api.africastalking.com/version1/messaging';
  }

  async sendSMS(phoneNumber, message) {
    try {
      // If no API key, just log the message (for development)
      if (!this.apiKey || !this.username) {
        console.log('SMS (Development Mode):', {
          to: phoneNumber,
          message: message,
          from: this.senderId
        });
        return { success: true, development: true };
      }

      const response = await axios.post(this.baseUrl, {
        username: this.username,
        to: phoneNumber,
        message: message,
        from: this.senderId
      }, {
        headers: {
          'ApiKey': this.apiKey,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      console.log('SMS sent successfully:', response.data);
      return { success: true, data: response.data };

    } catch (error) {
      console.error('SMS sending failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  async sendCalculationSMS(phoneNumber, calculation) {
    const message = this.formatCalculationSMS(calculation);
    return await this.sendSMS(phoneNumber, message);
  }

  formatCalculationSMS(calculation) {
    const flow = calculation.flow || 'fertilizer';
    
    if (flow === 'fertilizer') {
      return `🌱 GROWRIGHT FERTILIZER GUIDE

Crop: ${calculation.crop}
Land Size: ${calculation.landSizeHectares} hectares

FERTILIZER NEEDED:
• ${calculation.fertilizerAmountKg}kg of ${calculation.npkRatio} fertilizer

SEEDS NEEDED:
• ${calculation.seedAmountKg}kg

PLANTING INFO:
• Best time: ${calculation.plantingSeason}
• Growth period: ${calculation.growthPeriodDays} days

ESTIMATED COST: ₦${calculation.estimatedCostNGN.toLocaleString()}

For suppliers near you, dial *123# > Find Suppliers

Happy farming! 🚜`;

    } else {
      return `🌱 GROWRIGHT SEED GUIDE

Crop: ${calculation.crop}
Land Size: ${calculation.landSizeHectares} hectares

SEEDS NEEDED:
• ${calculation.seedAmountKg}kg of quality seeds

PLANTING INFO:
• Best time: ${calculation.plantingSeason}
• Growth period: ${calculation.growthPeriodDays} days
• Recommended fertilizer: ${calculation.npkRatio}

ESTIMATED SEED COST: ₦${Math.round(calculation.seedAmountKg * 200).toLocaleString()}

For suppliers near you, dial *123# > Find Suppliers

Happy farming! 🚜`;
    }
  }

  async sendSupplierSMS(phoneNumber, suppliers, location) {
    const message = this.formatSupplierSMS(suppliers, location);
    return await this.sendSMS(phoneNumber, message);
  }

  formatSupplierSMS(suppliers, location) {
    if (suppliers.length === 0) {
      return `🌱 GROWRIGHT SUPPLIERS

No verified suppliers found near ${location}.

We're working to expand our network. 

For help, call our support line or visit our website.

Thank you for using GrowRight! 🚜`;
    }

    let message = `🌱 GROWRIGHT SUPPLIERS\nVerified suppliers near ${location}:\n\n`;
    
    suppliers.slice(0, 3).forEach((supplier, index) => {
      message += `${index + 1}. ${supplier.name}\n`;
      message += `📞 ${supplier.contact_phone}\n`;
      message += `📍 ${supplier.location}\n`;
      message += `🛒 ${supplier.available_products}\n\n`;
    });

    if (suppliers.length > 3) {
      message += `...and ${suppliers.length - 3} more suppliers available.\n\n`;
    }

    message += 'Always verify prices and quality before purchase.\n\nHappy farming! 🚜';
    
    return message;
  }

  // Utility method to validate phone numbers
  validatePhoneNumber(phoneNumber) {
    // Basic validation for African phone numbers
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Should be 10-13 digits
    if (cleaned.length < 10 || cleaned.length > 13) {
      return false;
    }

    // Should start with country code or local format
    const validStarts = ['234', '233', '254', '260', '256']; // Nigeria, Ghana, Kenya, Zambia, Uganda
    
    for (const start of validStarts) {
      if (cleaned.startsWith(start)) {
        return true;
      }
    }

    // Local format (starts with 0)
    if (cleaned.startsWith('0') && cleaned.length >= 10) {
      return true;
    }

    return false;
  }

  // Format phone number to international format
  formatPhoneNumber(phoneNumber) {
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    // If starts with 0, assume Nigerian number
    if (cleaned.startsWith('0')) {
      cleaned = '234' + cleaned.substring(1);
    }
    
    // Add + if not present
    if (!cleaned.startsWith('+')) {
      cleaned = '+' + cleaned;
    }
    
    return cleaned;
  }
}

module.exports = SMSService;