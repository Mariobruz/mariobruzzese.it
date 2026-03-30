# MB Consulting - Backend Integration Contracts

## Overview
Questo documento definisce i contratti API e la strategia di integrazione tra frontend e backend per il portfolio MB Consulting.

## Current Mock Data (frontend/src/mock.js)

### 1. Hero & Stats
- **hero**: title, subtitle, cta (STATIC - no backend needed)
- **stats**: 4 statistiche (STATIC - no backend needed)

### 2. How It Works
- **howItWorks**: 6 step del processo (STATIC - no backend needed)

### 3. Services
- **services**: 6 servizi offerti (STATIC - no backend needed)

### 4. Why Choose Us
- **whyChooseUs**: 6 vantaggi (STATIC - no backend needed)

### 5. Case Studies
- **caseStudies**: 3 case studies con risultati (STATIC - managed by admin)

### 6. FAQs
- **faqs**: 8 domande frequenti (STATIC - managed by admin)

### 7. Contact Info
- **contact**: email, phone, address (STATIC - no backend needed)

## Backend Requirements

### Database Collections

#### 1. **contact_requests** (Priority 1 - Essential)
Raccolta delle richieste di consulenza dai visitatori.

**Schema:**
```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (required),
  phone: String (optional),
  company: String (optional),
  message: String (required),
  source: String (enum: ['hero_cta', 'footer', 'faq', 'case_studies', 'other']),
  status: String (enum: ['new', 'contacted', 'converted', 'closed']),
  createdAt: DateTime,
  updatedAt: DateTime
}
```

#### 2. **newsletter_subscribers** (Priority 2 - Optional)
Per future campagne email.

**Schema:**
```javascript
{
  _id: ObjectId,
  email: String (required, unique),
  subscribedAt: DateTime,
  isActive: Boolean
}
```

## API Endpoints to Implement

### 1. Contact Request API

#### POST /api/contact
Crea una nuova richiesta di consulenza.

**Request Body:**
```json
{
  "name": "Mario Rossi",
  "email": "mario@example.com",
  "phone": "+39 123 456 7890",
  "company": "Azienda SRL",
  "message": "Vorrei informazioni sui fondi interprofessionali",
  "source": "hero_cta"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Richiesta inviata con successo. Ti contatteremo presto!",
  "requestId": "507f1f77bcf86cd799439011"
}
```

**Response (400):**
```json
{
  "success": false,
  "message": "Errore: email non valida",
  "errors": ["email"]
}
```

#### GET /api/contact (Admin only - Future)
Recupera tutte le richieste di contatto.

**Query Parameters:**
- status: 'new' | 'contacted' | 'converted' | 'closed'
- limit: number (default: 50)
- skip: number (default: 0)

**Response (200):**
```json
{
  "success": true,
  "data": [...],
  "total": 125,
  "page": 1
}
```

### 2. Newsletter API (Optional - Future)

#### POST /api/newsletter/subscribe
Iscrive un utente alla newsletter.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

## Frontend Integration Plan

### Components to Update

#### 1. Create Contact Form Component
**File:** `/app/frontend/src/components/ContactForm.jsx`

Features:
- Form con validazione (react-hook-form + zod)
- Campi: name, email, phone (optional), company (optional), message
- Toast notifications per successo/errore
- Loading state durante submit
- Source tracking automatico

#### 2. Create Contact Modal/Drawer
**File:** `/app/frontend/src/components/ContactModal.jsx`

Features:
- Modal/Drawer che si apre quando si clicca "Contattaci"
- Include ContactForm
- Chiude automaticamente dopo submit successo

#### 3. Update Pages

**Home.jsx:**
- Sostituire `scrollToContact()` con apertura ContactModal
- Source: 'hero_cta'

**Services.jsx, HowItWorks.jsx, WhyChooseUs.jsx, CaseStudies.jsx, FAQ.jsx:**
- Aggiungere ContactModal
- Source specifico per ogni pagina

**Footer.jsx:**
- Mantenere info di contatto statiche
- Aggiungere opzionalmente quick contact form
- Source: 'footer'

### API Service Layer
**File:** `/app/frontend/src/services/api.js`

```javascript
const API_URL = process.env.REACT_APP_BACKEND_URL;

export const contactAPI = {
  submit: async (data) => {
    const response = await axios.post(`${API_URL}/api/contact`, data);
    return response.data;
  }
};
```

## Backend Implementation Steps

### Step 1: Database Models
Create MongoDB models in `/app/backend/models/`:
- `ContactRequest.py` (or directly in server.py)

### Step 2: API Routes
Implement in `/app/backend/server.py`:
- POST /api/contact (with validation)
- Email validation using pydantic EmailStr
- Phone validation (optional)
- Rate limiting (prevent spam)

### Step 3: Email Notifications (Optional)
Send email to Mario when new contact request arrives.
- Use SMTP or email service
- Template: "Nuova richiesta di consulenza da {name}"

## Validation Rules

### Contact Form
- **name**: required, min 2 chars, max 100 chars
- **email**: required, valid email format
- **phone**: optional, valid Italian phone format
- **company**: optional, max 200 chars
- **message**: required, min 10 chars, max 1000 chars
- **source**: required, enum validation

## Error Handling

### Backend
- 400: Validation errors
- 429: Too many requests (rate limiting)
- 500: Server error

### Frontend
- Show user-friendly error messages in Italian
- Log errors for debugging
- Retry logic for network errors

## Testing Checklist

### Backend Testing
- [ ] POST /api/contact creates document in MongoDB
- [ ] Email validation works correctly
- [ ] Phone validation works correctly
- [ ] Required fields validation
- [ ] Response format is correct
- [ ] Error handling works

### Frontend Testing
- [ ] ContactModal opens correctly
- [ ] Form validation works
- [ ] Submit button shows loading state
- [ ] Success toast appears
- [ ] Error toast appears
- [ ] Modal closes after success
- [ ] Form resets after success
- [ ] Source tracking works

### Integration Testing
- [ ] Submit from Home page works
- [ ] Submit from Services page works
- [ ] Submit from FAQ page works
- [ ] Data is saved correctly in MongoDB
- [ ] All fields are saved correctly

## Future Enhancements (Post-MVP)

1. **Admin Dashboard**
   - View all contact requests
   - Update status
   - Add notes
   - Export to CSV

2. **Email Notifications**
   - Auto-reply to user
   - Notification to Mario

3. **Analytics**
   - Track conversion sources
   - Popular services requested
   - Response time metrics

4. **CRM Integration**
   - Integrate with external CRM
   - Automated follow-ups

## Notes

- All static content (services, FAQs, case studies) remains in mock.js
- Only dynamic user-generated content goes to backend
- Future: admin panel to manage static content
- Future: multilingual support (Italian + English)
