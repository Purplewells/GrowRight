const SMSService = require('./smsService');

class USSDService {
  constructor() {
    this.smsService = new SMSService();
    this.menus = {
      main: 'Welcome to GrowRight\n1. Calculate Fertilizer\n2. Seed Calculator\n3. Find Suppliers\n4. Language',
      crops: '1. Maize\n2. Rice\n3. Beans\n4. Cassava\n0. Back to main menu',
      language: '1. English\n2. Hausa\n3. Yoruba\n4. Swahili\n0. Back to main menu'
    };
  }

  async processInput(session, input, db) {
    try {
      const sessionData = this.parseSessionData(session.session_data);
      const currentMenu = session.current_menu || 'main';
      
      // Parse user input
      const userInput = input.trim();
      const inputSteps = userInput.split('*').filter(step => step !== '');
      const lastInput = inputSteps[inputSteps.length - 1] || '';

      console.log('Processing USSD:', {
        currentMenu,
        lastInput,
        sessionData,
        inputSteps
      });

      return await this.handleMenuNavigation(
        currentMenu,
        lastInput,
        sessionData,
        session.phone_number,
        db
      );

    } catch (error) {
      console.error('USSD Processing Error:', error);
      return {
        message: 'CON Service error. Please try again.',
        isEnd: false,
        nextMenu: 'main',
        sessionData: {}
      };
    }
  }

  async handleMenuNavigation(currentMenu, input, sessionData, phoneNumber, db) {
    switch (currentMenu) {
      case 'main':
        return this.handleMainMenu(input, sessionData, phoneNumber);
        
      case 'crops':
        return await this.handleCropSelection(input, sessionData, phoneNumber, db);
        
      case 'land_size':
        return await this.handleLandSizeInput(input, sessionData, phoneNumber, db);
        
      case 'suppliers':
        return await this.handleSupplierMenu(input, sessionData, phoneNumber, db);
        
      case 'language':
        return this.handleLanguageSelection(input, sessionData, phoneNumber);
        
      default:
        return this.getMainMenu();
    }
  }

  handleMainMenu(input, sessionData, phoneNumber) {
    switch (input) {
      case '1':
        return {
          message: `CON ${this.menus.crops}`,
          isEnd: false,
          nextMenu: 'crops',
          sessionData: { ...sessionData, flow: 'fertilizer' }
        };
        
      case '2':
        return {
          message: `CON ${this.menus.crops}`,
          isEnd: false,
          nextMenu: 'crops',
          sessionData: { ...sessionData, flow: 'seeds' }
        };
        
      case '3':
        return {
          message: 'CON Enter your location (state/city):',
          isEnd: false,
          nextMenu: 'suppliers',
          sessionData: { ...sessionData, flow: 'suppliers' }
        };
        
      case '4':
        return {
          message: `CON ${this.menus.language}`,
          isEnd: false,
          nextMenu: 'language',
          sessionData
        };
        
      default:
        return this.getMainMenu();
    }
  }

  async handleCropSelection(input, sessionData, phoneNumber, db) {
    const cropMap = {
      '1': 'Maize',
      '2': 'Rice', 
      '3': 'Beans',
      '4': 'Cassava'
    };

    if (input === '0') {
      return this.getMainMenu();
    }

    const cropName = cropMap[input];
    if (!cropName) {
      return {
        message: `CON Invalid selection. ${this.menus.crops}`,
        isEnd: false,
        nextMenu: 'crops',
        sessionData
      };
    }

    // Get crop from database
    const crop = await db.get('SELECT * FROM crops WHERE name = ?', [cropName]);
    if (!crop) {
      return {
        message: 'CON Crop not found. Please try again.',
        isEnd: false,
        nextMenu: 'crops',
        sessionData
      };
    }

    return {
      message: `CON Enter your land size in hectares:\n(e.g., 0.5 for half hectare)`,
      isEnd: false,
      nextMenu: 'land_size',
      sessionData: { 
        ...sessionData, 
        selectedCrop: crop.name,
        cropId: crop.id
      }
    };
  }

  async handleLandSizeInput(input, sessionData, phoneNumber, db) {
    const landSize = parseFloat(input);
    
    if (isNaN(landSize) || landSize <= 0) {
      return {
        message: 'CON Invalid land size. Please enter a valid number (e.g., 0.5):',
        isEnd: false,
        nextMenu: 'land_size',
        sessionData
      };
    }

    if (landSize > 100) {
      return {
        message: 'CON Land size too large. Please enter a size less than 100 hectares:',
        isEnd: false,
        nextMenu: 'land_size',
        sessionData
      };
    }

    // Calculate fertilizer and seed requirements
    const calculation = await this.calculateRequirements(
      sessionData.cropId,
      landSize,
      sessionData.flow,
      db
    );

    if (!calculation) {
      return {
        message: 'CON Calculation error. Please try again.',
        isEnd: false,
        nextMenu: 'main',
        sessionData: {}
      };
    }

    // Save calculation to database
    await this.saveCalculation(phoneNumber, calculation, db);

    // Send detailed SMS
    await this.smsService.sendCalculationSMS(phoneNumber, calculation);

    // Return summary response
    const responseMessage = this.formatCalculationResponse(calculation);
    
    return {
      message: `END ${responseMessage}`,
      isEnd: true,
      nextMenu: 'main',
      sessionData: {}
    };
  }

  async handleSupplierMenu(input, sessionData, phoneNumber, db) {
    if (!sessionData.supplierLocation) {
      // First time - capture location
      return {
        message: 'CON Searching suppliers...',
        isEnd: false,
        nextMenu: 'suppliers_results',
        sessionData: { ...sessionData, supplierLocation: input }
      };
    }

    // Show suppliers
    const suppliers = await this.findSuppliers(sessionData.supplierLocation, db);
    const supplierList = this.formatSupplierList(suppliers);
    
    return {
      message: `END Suppliers near ${sessionData.supplierLocation}:\n${supplierList}\n\nDetailed list sent via SMS.`,
      isEnd: true,
      nextMenu: 'main',
      sessionData: {}
    };
  }

  handleLanguageSelection(input, sessionData, phoneNumber) {
    const languages = {
      '1': 'English',
      '2': 'Hausa', 
      '3': 'Yoruba',
      '4': 'Swahili'
    };

    if (input === '0') {
      return this.getMainMenu();
    }

    const language = languages[input];
    if (!language) {
      return {
        message: `CON Invalid selection. ${this.menus.language}`,
        isEnd: false,
        nextMenu: 'language',
        sessionData
      };
    }

    return {
      message: `END Language set to ${language}.\nKamar da ka zaɓi Hausa! (You selected Hausa!)\n\nFeature coming soon.`,
      isEnd: true,
      nextMenu: 'main',
      sessionData: { ...sessionData, language: input }
    };
  }

  async calculateRequirements(cropId, landSizeHectares, flow, db) {
    try {
      const crop = await db.get('SELECT * FROM crops WHERE id = ?', [cropId]);
      if (!crop) return null;

      const fertilizerAmountKg = crop.fertilizer_rate_per_hectare * landSizeHectares;
      const seedAmountKg = crop.seed_rate_per_hectare * landSizeHectares;

      // Basic cost calculation (placeholder prices)
      const fertilizerCostPerKg = 150; // NGN
      const seedCostPerKg = 200; // NGN
      const estimatedCost = (fertilizerAmountKg * fertilizerCostPerKg) + (seedAmountKg * seedCostPerKg);

      return {
        crop: crop.name,
        landSizeHectares,
        fertilizerAmountKg: Math.round(fertilizerAmountKg * 100) / 100,
        seedAmountKg: Math.round(seedAmountKg * 100) / 100,
        estimatedCostNGN: Math.round(estimatedCost),
        npkRatio: crop.npk_ratio,
        plantingSeason: crop.planting_season,
        growthPeriodDays: crop.growth_period_days,
        flow
      };
    } catch (error) {
      console.error('Calculation error:', error);
      return null;
    }
  }

  async saveCalculation(phoneNumber, calculation, db) {
    try {
      // Get or create farmer
      let farmer = await db.get('SELECT * FROM farmers WHERE phone_number = ?', [phoneNumber]);
      
      if (!farmer) {
        const result = await db.run(
          'INSERT INTO farmers (phone_number) VALUES (?)',
          [phoneNumber]
        );
        farmer = { id: result.id };
      }

      // Get crop ID
      const crop = await db.get('SELECT id FROM crops WHERE name = ?', [calculation.crop]);
      if (!crop) return;

      // Save calculation
      await db.run(`
        INSERT INTO calculations 
        (farmer_id, crop_id, land_size_hectares, fertilizer_amount_kg, seed_amount_kg, estimated_cost)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        farmer.id,
        crop.id,
        calculation.landSizeHectares,
        calculation.fertilizerAmountKg,
        calculation.seedAmountKg,
        calculation.estimatedCostNGN
      ]);

    } catch (error) {
      console.error('Error saving calculation:', error);
    }
  }

  formatCalculationResponse(calculation) {
    const flow = calculation.flow || 'fertilizer';
    
    if (flow === 'fertilizer') {
      return `FERTILIZER CALCULATION
Crop: ${calculation.crop}
Land: ${calculation.landSizeHectares} hectares
Fertilizer: ${calculation.fertilizerAmountKg}kg (${calculation.npkRatio})
Seeds: ${calculation.seedAmountKg}kg
Est. Cost: ₦${calculation.estimatedCostNGN.toLocaleString()}

Detailed SMS sent!`;
    } else {
      return `SEED CALCULATION
Crop: ${calculation.crop}
Land: ${calculation.landSizeHectares} hectares
Seeds needed: ${calculation.seedAmountKg}kg
Planting: ${calculation.plantingSeason}
Est. Cost: ₦${calculation.estimatedCostNGN.toLocaleString()}

Detailed SMS sent!`;
    }
  }

  async findSuppliers(location, db) {
    try {
      const suppliers = await db.all(`
        SELECT * FROM suppliers 
        WHERE is_verified = 1 AND location LIKE ?
        ORDER BY name
        LIMIT 5
      `, [`%${location}%`]);
      
      return suppliers;
    } catch (error) {
      console.error('Error finding suppliers:', error);
      return [];
    }
  }

  formatSupplierList(suppliers) {
    if (suppliers.length === 0) {
      return 'No verified suppliers found in your area.';
    }

    return suppliers.map((supplier, index) => 
      `${index + 1}. ${supplier.name}\n${supplier.location}\n${supplier.contact_phone}`
    ).join('\n\n');
  }

  getMainMenu() {
    return {
      message: `CON ${this.menus.main}`,
      isEnd: false,
      nextMenu: 'main',
      sessionData: {}
    };
  }

  parseSessionData(sessionDataString) {
    try {
      return JSON.parse(sessionDataString || '{}');
    } catch (error) {
      return {};
    }
  }
}

module.exports = USSDService;