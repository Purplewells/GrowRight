# GrowRight Backend

USSD-based fertiliser and input calculator backend built with Node.js, Express, and SQLite.

## Features

- 🚀 **USSD Interface**: Complete USSD flow for farmers to get fertilizer calculations
- 📱 **SMS Integration**: Sends detailed recommendations via SMS
- 🌾 **Crop Database**: Pre-loaded with Maize, Rice, Beans, and Cassava data
- 📍 **Supplier Directory**: Location-based supplier matching
- 🔒 **Session Management**: Handles USSD session state and timeouts
- 📊 **Calculation Engine**: Accurate fertilizer and seed requirement calculations

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set up Environment
```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Initialize Database
```bash
npm run db:setup
npm run db:seed
```

### 4. Start Development Server
```bash
npm run dev
```

The server will start on http://localhost:3000

## API Endpoints

### USSD Webhook
- `POST /ussd` - Main USSD webhook for gateway providers
- `POST /ussd/test` - Test endpoint for USSD simulation

### REST API
- `GET /api/crops` - Get all crops
- `GET /api/crops/:id` - Get specific crop
- `GET /api/suppliers` - Get suppliers (optional location filter)
- `POST /api/calculate` - Manual calculation endpoint
- `GET /api/calculations/:phoneNumber` - Get farmer's calculation history

### Health & Info
- `GET /health` - Health check
- `GET /` - API information

## USSD Flow

```
*123# → Welcome Menu
├── 1. Calculate Fertilizer
│   ├── Select Crop (Maize/Rice/Beans/Cassava)
│   ├── Enter Land Size (hectares)
│   └── Get Calculation + SMS
├── 2. Seed Calculator
│   └── [Same flow as fertilizer]
├── 3. Find Suppliers
│   ├── Enter Location
│   └── Get Supplier List + SMS
└── 4. Language Selection
    └── [English/Hausa/Yoruba/Swahili]
```

## Database Schema

### Tables
- **crops**: Crop varieties with NPK ratios and application rates
- **farmers**: Farmer registration and session data
- **calculations**: Historical calculation records
- **suppliers**: Verified agro-dealer directory
- **ussd_sessions**: Active USSD session management

## Testing USSD Flow

### Using curl:
```bash
# Test main menu
curl -X POST http://localhost:3000/ussd/test \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+2348012345678", "text": ""}'

# Test crop selection
curl -X POST http://localhost:3000/ussd/test \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+2348012345678", "text": "1*1"}'

# Test land size input
curl -X POST http://localhost:3000/ussd/test \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+2348012345678", "text": "1*1*2.5"}'
```

### Manual API Calculation:
```bash
curl -X POST http://localhost:3000/api/calculate \
  -H "Content-Type: application/json" \
  -d '{"cropId": 1, "landSizeHectares": 2.5}'
```

## SMS Configuration

The app uses Africa's Talking for SMS delivery. To enable SMS:

1. Sign up at https://africastalking.com/
2. Get your API key and username
3. Update `.env` file:
   ```
   AT_API_KEY=your_api_key_here
   AT_USERNAME=your_username_here
   ```

Without SMS configuration, messages are logged to console for development.

## Deployment

### Environment Setup
```bash
# Production environment
NODE_ENV=production
PORT=3000
DB_PATH=/data/growright.db
```

### Docker (Optional)
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY src/ ./src/
EXPOSE 3000
CMD ["npm", "start"]
```

## Project Structure

```
backend/
├── src/
│   ├── app.js              # Main application
│   ├── database/
│   │   ├── db.js           # Database connection
│   │   ├── setup.js        # Database initialization
│   │   └── seed.js         # Sample data
│   ├── routes/
│   │   ├── ussd.js         # USSD webhook routes
│   │   └── api.js          # REST API routes
│   ├── services/
│   │   ├── ussdService.js  # USSD flow logic
│   │   ├── smsService.js   # SMS integration
│   │   └── sessionManager.js # Session management
│   └── utils/
│       └── calculations.js  # Calculation utilities
├── data/                   # SQLite database files
├── package.json
└── .env                    # Environment configuration
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## License

MIT License - see LICENSE file for details.