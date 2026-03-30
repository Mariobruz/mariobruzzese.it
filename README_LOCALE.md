# MB Consulting - Portfolio Website

Sito web professionale per MB Consulting di Mario Bruzzese - Consulenza Formazione Finanziata

## 📋 Requisiti

### Frontend
- Node.js 16+ 
- Yarn package manager

### Backend
- Python 3.9+
- MongoDB (locale o Atlas)

## 🚀 Installazione e Avvio

### 1. Frontend (React)

```bash
cd frontend

# Installa le dipendenze
yarn install

# Crea il file .env con le variabili d'ambiente
# Copia questo contenuto in frontend/.env:
REACT_APP_BACKEND_URL=http://localhost:8001

# Avvia il server di sviluppo
yarn start

# Il sito sarà disponibile su http://localhost:3000
```

### 2. Backend (FastAPI)

```bash
cd backend

# Crea un ambiente virtuale Python
python -m venv venv

# Attiva l'ambiente virtuale
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Installa le dipendenze
pip install -r requirements.txt

# Crea il file .env con le variabili d'ambiente
# Copia questo contenuto in backend/.env:
MONGO_URL=mongodb://localhost:27017
DB_NAME=mb_consulting
CORS_ORIGINS=http://localhost:3000

# Avvia il server
uvicorn server:app --host 0.0.0.0 --port 8001 --reload

# Il backend sarà disponibile su http://localhost:8001
# API docs su http://localhost:8001/docs
```

### 3. MongoDB

**Opzione A - MongoDB Locale:**
```bash
# Installa MongoDB Community Edition
# https://www.mongodb.com/try/download/community

# Avvia MongoDB
mongod
```

**Opzione B - MongoDB Atlas (Cloud - Gratis):**
1. Crea un account su https://www.mongodb.com/cloud/atlas
2. Crea un cluster gratuito
3. Ottieni la connection string
4. Aggiorna `MONGO_URL` in `backend/.env`:
   ```
   MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/
   DB_NAME=mb_consulting
   ```

## 📁 Struttura del Progetto

```
mb-consulting/
├── frontend/              # React App
│   ├── src/
│   │   ├── components/   # Componenti React
│   │   ├── pages/        # Pagine del sito
│   │   ├── services/     # API services
│   │   └── mock.js       # Dati statici
│   ├── package.json
│   └── .env              # Variabili ambiente frontend
│
├── backend/              # FastAPI Backend
│   ├── server.py         # API principale
│   ├── requirements.txt  # Dipendenze Python
│   └── .env              # Variabili ambiente backend
│
└── contracts.md          # Documentazione API
```

## 🔧 Configurazione

### Variabili d'Ambiente

**Frontend (.env):**
```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

**Backend (.env):**
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=mb_consulting
CORS_ORIGINS=http://localhost:3000
```

## 📡 API Endpoints

### POST /api/contact
Crea una nuova richiesta di consulenza

**Request Body:**
```json
{
  "name": "Mario Rossi",
  "email": "mario@example.com",
  "phone": "+393291234567",
  "company": "Azienda SRL",
  "message": "Vorrei informazioni sui fondi interprofessionali",
  "source": "hero_cta"
}
```

### GET /api/contact
Recupera tutte le richieste di consulenza (Admin)

**Query Parameters:**
- `status`: 'new' | 'contacted' | 'converted' | 'closed'
- `limit`: numero di risultati (default: 50)
- `skip`: paginazione (default: 0)

## 🎨 Tecnologie Utilizzate

### Frontend
- React 19
- React Router
- Framer Motion (animazioni)
- Tailwind CSS
- Shadcn/UI Components
- Axios

### Backend
- FastAPI
- MongoDB (Motor async driver)
- Pydantic (validazione)
- Python 3.9+

## 📝 Note Importanti

1. **Dati di Contatto**: I dati sono configurati per:
   - Email: mariobruzzese@hotmail.com
   - Telefono: +393291747521
   - Località: Reggio Calabria

2. **Contenuti Statici**: I contenuti (servizi, FAQ, casi studio) sono in `frontend/src/mock.js`

3. **Database**: Le richieste di contatto vengono salvate nella collection `contact_requests` su MongoDB

## 🚀 Build per Produzione

### Frontend
```bash
cd frontend
yarn build
# I file di build saranno in frontend/build/
```

### Backend
```bash
# Il backend è pronto per produzione
# Usa gunicorn o uvicorn con workers multipli:
uvicorn server:app --host 0.0.0.0 --port 8001 --workers 4
```

## 📞 Supporto

Per domande o supporto, contatta:
- Email: mariobruzzese@hotmail.com
- Telefono: +393291747521

## 📄 Licenza

© 2025 MB Consulting di Mario Bruzzese. Tutti i diritti riservati.
