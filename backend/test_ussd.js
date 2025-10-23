#!/usr/bin/env node

/**
 * USSD Flow Tester
 * Tests the complete USSD flow with session persistence
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const TEST_PHONE = '+2348012345678';

class USSDTester {
  constructor() {
    this.sessionId = `test_${Date.now()}`;
    this.phoneNumber = TEST_PHONE;
  }

  async sendUSSD(text = '') {
    try {
      const response = await axios.post(`${BASE_URL}/ussd`, {
        sessionId: this.sessionId,
        serviceCode: '*123#',
        phoneNumber: this.phoneNumber,
        text: text
      });

      return response.data;
    } catch (error) {
      console.error('USSD Error:', error.message);
      return null;
    }
  }

  async testCompleteFlow() {
    console.log('🧪 Testing GrowRight USSD Flow\n');

    // Step 1: Main Menu
    console.log('1️⃣ Testing Main Menu...');
    let response = await this.sendUSSD('');
    console.log('Response:', response);
    console.log('');

    // Step 2: Select Fertilizer Calculator
    console.log('2️⃣ Selecting Fertilizer Calculator (1)...');
    response = await this.sendUSSD('1');
    console.log('Response:', response);
    console.log('');

    // Step 3: Select Maize
    console.log('3️⃣ Selecting Maize (1)...');
    response = await this.sendUSSD('1*1');
    console.log('Response:', response);
    console.log('');

    // Step 4: Enter Land Size
    console.log('4️⃣ Entering land size (2.5 hectares)...');
    response = await this.sendUSSD('1*1*2.5');
    console.log('Response:', response);
    console.log('');

    console.log('✅ Test completed!');
  }

  async testAPI() {
    console.log('🔬 Testing REST API Endpoints\n');

    try {
      // Test crops endpoint
      console.log('📋 Getting crops...');
      const cropsResponse = await axios.get(`${BASE_URL}/api/crops`);
      console.log('Crops:', cropsResponse.data.length, 'found');
      console.log('');

      // Test calculation endpoint
      console.log('🧮 Testing calculation...');
      const calcResponse = await axios.post(`${BASE_URL}/api/calculate`, {
        cropId: 1,
        landSizeHectares: 2.5
      });
      console.log('Calculation result:', calcResponse.data);
      console.log('');

      // Test suppliers endpoint
      console.log('🏪 Getting suppliers...');
      const suppliersResponse = await axios.get(`${BASE_URL}/api/suppliers`);
      console.log('Suppliers:', suppliersResponse.data.length, 'found');
      console.log('');

    } catch (error) {
      console.error('API Error:', error.message);
    }
  }

  async run() {
    console.log('🌱 GrowRight Backend Tester\n');
    
    // Test server health
    try {
      const healthResponse = await axios.get(`${BASE_URL}/health`);
      console.log('✅ Server is healthy:', healthResponse.data.status);
      console.log('');
    } catch (error) {
      console.error('❌ Server health check failed:', error.message);
      return;
    }

    // Run tests
    await this.testAPI();
    await this.testCompleteFlow();
  }
}

// Run the tester
if (require.main === module) {
  const tester = new USSDTester();
  tester.run().catch(console.error);
}

module.exports = USSDTester;