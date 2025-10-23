const express = require('express');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

const USSDService = require('../services/ussdService');
const SessionManager = require('../services/sessionManager');

// Initialize services
const ussdService = new USSDService();
const sessionManager = new SessionManager();

/**
 * USSD Webhook endpoint
 * This is where USSD gateway providers (like Africa's Talking) send requests
 */
router.post('/', async (req, res) => {
  try {
    const { sessionId, serviceCode, phoneNumber, text } = req.body;
    
    // Log incoming request for debugging
    console.log('USSD Request:', {
      sessionId,
      serviceCode,
      phoneNumber,
      text: text || '(empty)',
      timestamp: new Date().toISOString()
    });

    // Validate required fields
    if (!phoneNumber) {
      return res.status(400).send('CON Invalid request: Phone number required');
    }

    // Get or create session
    let session = await sessionManager.getSession(sessionId || phoneNumber);
    if (!session) {
      session = await sessionManager.createSession(
        sessionId || uuidv4(),
        phoneNumber
      );
    } else {
      // Session exists, parse session data
      session.session_data = session.session_data || '{}';
    }

    // Process USSD input and get response
    const response = await ussdService.processInput(
      session,
      text || '',
      req.db
    );

    // Update session
    await sessionManager.updateSession(session.session_id, {
      current_menu: response.nextMenu,
      session_data: JSON.stringify(response.sessionData)
    }, req.db);

    // Log response for debugging
    console.log('USSD Response:', {
      sessionId: session.session_id,
      phoneNumber,
      response: response.message,
      isEnd: response.isEnd,
      timestamp: new Date().toISOString()
    });

    // Send response to USSD gateway
    res.send(response.message);

  } catch (error) {
    console.error('USSD Error:', error);
    res.send('CON Service temporarily unavailable. Please try again later.');
  }
});

/**
 * Test endpoint for USSD simulation
 */
router.post('/test', async (req, res) => {
  try {
    const { phoneNumber, text } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number required' });
    }

    // Create test session
    const sessionId = `test_${Date.now()}`;
    const session = await sessionManager.createSession(sessionId, phoneNumber);

    // Process input
    const response = await ussdService.processInput(
      session,
      text || '',
      req.db
    );

    res.json({
      sessionId,
      phoneNumber,
      input: text || '',
      response: response.message,
      isEnd: response.isEnd,
      nextMenu: response.nextMenu,
      sessionData: response.sessionData
    });

  } catch (error) {
    console.error('USSD Test Error:', error);
    res.status(500).json({ error: 'Service error' });
  }
});

module.exports = router;