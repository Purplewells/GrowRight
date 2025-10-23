# GrowRight AI Coding Agent Instructions

## Project Overview
GrowRight is a USSD-based fertiliser and input calculator platform for smallholder farmers in sub-Saharan Africa. The platform provides crop-specific input recommendations, supplier connections, and agricultural guidance through basic mobile phones.

## Architecture Context
This is an early-stage project currently in specification phase. The target architecture includes:

- **USSD Gateway**: Entry point for farmers using short codes (e.g., `*123#`)
- **Node.js Backend**: Core application server handling USSD sessions and business logic
- **SMS Gateway**: Delivery of recommendations and supplier information
- **Database**: Stores crop data, input calculations, supplier directory, and farmer interactions
- **Admin Interface**: Management of crops, recommendations, and supplier data

## Key Business Domain
- **Target Users**: Smallholder farmers (1-5 hectares) in Nigeria, Ghana, Kenya, Zambia
- **Core Function**: Calculate precise fertiliser/seed requirements based on crop type and land size
- **Value Proposition**: Bridge digital divide using basic mobile phones (no smartphone required)
- **Revenue Model**: Freemium farmers, dealer subscriptions, sponsored inputs, NGO partnerships

## Development Priorities
When implementing features, prioritize:
1. **Mobile-first accessibility** - USSD must work on any GSM phone
2. **Multilingual support** - Hausa, Yoruba, Swahili, English
3. **Offline-capable calculations** - Core recommendations should work without constant connectivity
4. **Simple user flows** - Maximum 3-4 steps for any farmer interaction
5. **Supplier integration** - Location-based matching with verified agro-dealers

## Critical Workflows
- **USSD Session Management**: Handle session timeouts, user navigation, menu state
- **Input Calculations**: Crop-specific fertiliser and seed quantity algorithms
- **SMS Delivery**: Reliable message formatting and delivery confirmation
- **Supplier Matching**: Geographic proximity and inventory verification
- **Admin Operations**: Bulk data management for crops, pricing, and suppliers

## Technical Stack & Conventions
- **Backend**: Node.js with Express.js for USSD session handling and API endpoints
- **Database**: MongoDB for flexible crop/supplier data, Redis for USSD session state
- **API Design**: RESTful endpoints for USSD gateway integration
- **Data Models**: Focus on crop varieties, regional pricing, seasonal recommendations
- **Error Handling**: Graceful fallbacks for network issues common in rural areas
- **Localization**: Unicode support for local languages, currency formatting
- **Performance**: Optimize for low-bandwidth environments

## Agricultural Calculation Logic
- **NPK Formulas**: Base calculations on soil type, crop variety, and growth stage
- **Seed Rates**: Account for germination rates, plant spacing, and field conditions
- **Regional Variations**: Adjust recommendations for climate zones and rainfall patterns
- **Seasonal Timing**: Include planting windows and fertiliser application schedules
- **Unit Conversions**: Support metric (kg/hectare) and local units (bags per acre)
- **Cost Calculations**: Factor in current market prices and transport costs

## Key Files to Reference
- `README.md`: Complete product specification and market context
- `ApplicationWorkFlow.md`: Detailed user journey and system interactions

## Integration Points
- **Mobile Network Operators**: 
  - MTN, Airtel, Glo (Nigeria); Safaricom (Kenya); Vodacom (Ghana)
  - USSD gateway APIs: Africa's Talking, Hubtel, SMSLive247
  - Session timeout handling (typically 90 seconds)
- **SMS Gateways**: 
  - Bulk SMS providers: Clickatell, Nexmo/Vonage, Twilio
  - Character limits: 160 chars (single), 918 chars (concatenated)
  - Delivery status callbacks and retry logic
- **Agro-dealers**: 
  - Supplier onboarding APIs and inventory management
  - Location-based matching with GPS coordinates
  - Real-time stock verification and pricing updates
- **Agricultural Data**: 
  - Ministry of Agriculture databases for crop varieties
  - Weather APIs: OpenWeatherMap, NIMET (Nigeria)
  - Soil data from ISRIC World Soil Information
- **Payment Systems**: 
  - Mobile money: M-Pesa, MTN Mobile Money, Airtel Money
  - Farmer transaction processing and dealer billing
  - Integration with local banking APIs

## Development Workflow
- **Local Setup**: 
  - Use ngrok or localtunnel for USSD webhook testing
  - Docker containers for MongoDB and Redis instances
  - Environment variables for API keys and gateway URLs
- **USSD Testing**: 
  - USSD simulators: Africa's Talking sandbox, Hubtel test console
  - Session state debugging with Redis CLI
  - Mock farmer journey scripts for automated testing
- **SMS Testing**:
  - Test message formatting with different character sets
  - Verify delivery across multiple networks in target countries
  - Monitor delivery reports and failed message handling
- **Deployment**:
  - African cloud providers: AWS Cape Town, Azure South Africa
  - CDN considerations for static content delivery
  - Environment-specific configuration for staging/production

## Testing Strategy
- **USSD Simulation**: Test complete farmer journeys including edge cases
- **SMS Delivery**: Verify message formatting across different networks
- **Calculation Accuracy**: Validate agricultural algorithms with extension officers
- **Load Testing**: Simulate high farmer usage during planting seasons
- **Multilingual Testing**: Ensure proper rendering across supported languages
- **Network Resilience**: Test session recovery after connectivity drops
- **Cross-Network Testing**: Verify functionality across MTN, Airtel, Glo networks

## Regulatory & Compliance Considerations
- **Agricultural Compliance**:
  - Ministry of Agriculture approval for fertiliser recommendations
  - Adherence to national agricultural extension guidelines
  - Validation of crop varieties with local research institutes
- **Data Privacy**:
  - GDPR compliance for international NGO partnerships
  - Nigeria Data Protection Regulation (NDPR) requirements
  - Farmer consent mechanisms for data collection and usage
- **Telecommunications**:
  - Mobile operator licensing requirements for USSD services
  - SMS content regulations and anti-spam compliance
  - Cross-border SMS delivery restrictions and approvals
- **Financial Services**:
  - Central bank regulations for mobile money integrations
  - Know Your Customer (KYC) requirements for dealer payments
  - Transaction reporting and audit trail requirements

When building features, always consider the rural context: limited literacy, basic phones, unreliable connectivity, and the critical importance of accurate agricultural guidance for farmer livelihoods.