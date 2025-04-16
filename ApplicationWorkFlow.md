# 🌱 Fertiliser & Input Calculator – Application Workflow

## 🎭 Actors

- **Farmer**: End-user accessing USSD/SMS services
- **System**: USSD + Node.js back-end server
- **SMS Gateway**: Sends SMS notifications
- **Database**: Stores inputs, crops, recommendations, supplier data
- **Agro-dealer/Supplier**: Verified vendors mapped by location
- **Admin**: Backend user managing crops, recommendations, and supplier data

---

## 📲 Farmer Journey – Workflow Steps

### Step 1: Dial USSD Code  
📞 Farmer dials a short code like `*123#`

### Step 2: Welcome Menu  
-- System returns menu:
   Fertiliser Calculator
   
   Seed Input Guide
   
   Find Supplier
   Language
