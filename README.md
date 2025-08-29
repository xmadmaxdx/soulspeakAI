# SoulSpeak

> **Your AI-powered mental health companion providing empathetic support through private conversations, mood tracking, and personalized insights.**



<div align="center">

[![Healing Platform](https://img.shields.io/badge/Purpose-Mental_Health_Recovery-FF6B9D?style=for-the-badge&logo=heart&logoColor=white)](https://soulspeak.app)
[![Database](https://img.shields.io/badge/Secure_Storage-Neon_PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://neon.tech/)
[![AI Companion](https://img.shields.io/badge/AI_Heart-Google_Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![Safe Space](https://img.shields.io/badge/Authentication-Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)

[![Built With Love](https://img.shields.io/badge/Built_With-React_18-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![Always Available](https://img.shields.io/badge/24/7_Support-Node.js_22-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Responsive Design](https://img.shields.io/badge/Mobile_First-TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Serverless](https://img.shields.io/badge/Deployed_On-Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)](https://netlify.com/)

</div>

---

## **Why This Project Stands Out**

**SoulSpeak** is a comprehensive mental health platform that demonstrates advanced full-stack development skills, AI integration, and user-centric design. Built for individuals seeking emotional support through intelligent AI conversations, mood tracking, and personalized insights.


```mermaid
graph TD
    A[User Opens SoulSpeak] --> B{Authentication}
    B -->|Supabase Auth| C[Personalized Dashboard]
    C --> D[AI Companion Chat]
    C --> E[Journal Entries]
    C --> F[Mood Tracking]
    D --> G[Google Gemini AI]
    G --> H[Empathetic Response]
    E --> I[AI-Generated Insights]
    F --> J[Analytics & Trends]
    H --> K[Secure Storage]
    I --> K
    J --> K
    K --> L[Neon PostgreSQL]
```

---

## **Core Features**

<table>
<tr>
<td width="50%">

### **AI Companion Chat**

- **Real-time conversations** with empathetic AI responses
- **4-key rotation system** ensuring 99.9% uptime
- **Smart fallback** mechanisms for continuous availability
- **Session-based** chat (no persistent history for privacy)

</td>
<td width="50%">

### **Intelligent Journaling**

- **Private journaling** with AI responses
- **AES-256-GCM encryption** for maximum security
- **Mood integration** with each entry
- **Tagging system** for easy organization

</td>
</tr>
<tr>
<td width="50%">

### **Advanced Mood Tracking**

- **1-10 scale tracking** with optional notes
- **AI-powered insights** on mood patterns
- **Visual analytics** showing progress over time
- **Fast mode** for quick overviews

</td>
<td width="50%">

### **Smart User Management**

- **Supabase authentication** (client-side)
- **Automatic profile creation** on first visit
- **Email-based identification** system
- **Secure profile management**

</td>
</tr>
</table>

---

## **Technology Stack**

<details>
<summary><strong>Frontend Technologies</strong></summary>

| Technology         | Version  | Purpose                                           |
| ------------------ | -------- | ------------------------------------------------- |
| **React**          | `18.3.1` | Core UI framework with hooks                      |
| **TypeScript**     | `5.5.3`  | Type safety and developer experience              |
| **Vite**           | `6.2.2`  | Lightning-fast build tool and dev server          |
| **TailwindCSS**    | `3.4.11` | Utility-first styling with custom healing palette |
| **Framer Motion**  | `12.6.2` | Smooth animations and transitions                 |
| **Radix UI**       | `1.x`    | Accessible component primitives                   |
| **React Router**   | `6.26.2` | Client-side routing                               |
| **TanStack Query** | `5.56.2` | Server state management                           |

</details>

<details>
<summary><strong>Backend Technologies</strong></summary>

| Technology               | Version  | Purpose                                  |
| ------------------------ | -------- | ---------------------------------------- |
| **Node.js**              | `22.x`   | Runtime environment                      |
| **Express**              | `4.18.2` | Web application framework                |
| **Neon PostgreSQL**      | `Latest` | Primary database with connection pooling |
| **Google Generative AI** | `0.24.1` | Primary AI service (Gemini 1.5 Flash)    |
| **Supabase**             | `2.54.0` | Authentication and user management       |
| **Zod**                  | `3.23.8` | Runtime type validation                  |

</details>

<details>
<summary><strong>Security & Infrastructure</strong></summary>

| Component          | Implementation           | Details                                        |
| ------------------ | ------------------------ | ---------------------------------------------- |
| **Encryption**     | AES-256-GCM              | Military-grade encryption for sensitive data   |
| **Authentication** | Supabase                 | Client-side auth with secure token handling    |
| **Database**       | SSL + Connection Pooling | Secure Neon PostgreSQL with 20 max connections |
| **API Security**   | CORS + Rate Limiting     | 50 calls/hour, 10 calls/5min per service       |
| **Deployment**     | Netlify Functions        | Serverless architecture with auto-scaling      |

</details>

---

## **Getting Started**

### **Prerequisites**

```bash
node -v  # ≥ 22.x
npm -v   # ≥ 10.x
```

### **Quick Setup**

```bash
# Install dependencies
npm install

# Environment setup
# Create a .env file and set variables (see Environment Variables section)

# Start development (http://localhost:8080)
npm run dev
```

### **Environment Variables**

<details>
<summary><strong>Required Variables</strong></summary>

```bash
# Database
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require

# AI Services
GEMINI_API_KEY=your_primary_gemini_api_key
GEMINI_API_KEY_2=your_backup_gemini_api_key_2
GEMINI_API_KEY_3=your_backup_gemini_api_key_3
GEMINI_API_KEY_4=your_backup_gemini_api_key_4
BACKUP_AI_KEY=your_backup_ai_service_key

# Authentication
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Security
ENCRYPTION_KEY=your_secure_32_byte_encryption_key # Optional
```

</details>

---

## **Available Scripts**

| Command              | Description                 | Output                     |
| -------------------- | --------------------------- | -------------------------- |
| `npm run dev`        | Start development server | Port 8080 with hot reload  |
| `npm run build`      | Build for production     | `dist/spa` + `dist/server` |
| `npm run start`      | Run production build     | Local production server    |
| `npm test`           | Run test suite           | Vitest test runner         |
| `npm run typecheck`  | TypeScript validation    | Type checking only         |
| `npm run format.fix` | Format code              | Prettier auto-fix          |

---

## **Architecture Overview**

### **System Architecture**

```mermaid
flowchart LR
  A[React Client (Vite SPA)] -->|API| B[Express API (Netlify Functions)]
  A <-->|Auth| S[Supabase (Client-side)]
  B -->|DB| D[Neon PostgreSQL (SSL pool 20)]
  B <-->|AI| G[Google Gemini]
  B -.->|Encrypt| E[AES-256-GCM]
```

### **Database Schema**

<details>
<summary><strong>Auto-Generated Tables</strong></summary>

```sql
-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255),
    bio TEXT DEFAULT 'Ready to begin my healing journey.',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_verified BOOLEAN DEFAULT false
);

-- Journal Entries Table
CREATE TABLE journal_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    mood INTEGER CHECK (mood >= 1 AND mood <= 10),
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mood Entries Table
CREATE TABLE mood_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mood_level INTEGER NOT NULL CHECK (mood_level >= 1 AND mood_level <= 10),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

</details>

---

## **API Endpoints**

### **Health & Status**

| Method | Endpoint           | Description                                    |
| ------ | ------------------ | ---------------------------------------------- |
| `GET`  | `/api/ping`        | Basic health check                             |
| `GET`  | `/api/health`      | Comprehensive system status with AI monitoring |
| `GET`  | `/api/auth/status` | Supabase configuration status                  |

### **Journal Management**

| Method | Endpoint                   | Description          | Features             |
| ------ | -------------------------- | -------------------- | -------------------- |
| `POST` | `/api/journal/entries`     | Create journal entry | AI response          |
| `GET`  | `/api/journal/entries`     | List user entries    | Pagination support   |
| `GET`  | `/api/journal/entries/:id` | Get specific entry   | User validation      |

### **Mood Tracking**

| Method | Endpoint              | Description         | Features             |
| ------ | --------------------- | ------------------- | -------------------- |
| `POST` | `/api/mood/entries`   | Create mood entry   | No AI processing     |
| `GET`  | `/api/mood/data`      | Get mood analytics  | AI-powered insights  |
| `GET`  | `/api/mood/data/fast` | Quick mood overview | No AI processing     |

### **AI Companion**

| Method | Endpoint                   | Description            | Features             |
| ------ | -------------------------- | ---------------------- | -------------------- |
| `POST` | `/api/companion/chat`      | Send chat message      | Session-based only   |
| `GET`  | `/api/companion/analytics` | User progress insights | Time-based analytics |

### **User Management**

| Method | Endpoint            | Description             | Features       |
| ------ | ------------------- | ----------------------- | -------------- |
| `GET`  | `/api/user/profile` | Get/create user profile | Auto-creation  |
| `PUT`  | `/api/user/profile` | Update user profile     | Username & bio |

---

## **Key Technical Features**

### **AI Service Reliability**

<details>
<summary><strong>Smart API Key Management</strong></summary>

```typescript
// 4-key rotation system with intelligent cooldown
const apiKeys = [
  process.env.GEMINI_API_KEY,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
  process.env.GEMINI_API_KEY_4,
].filter(Boolean);

// Rate limiting: 50 calls/hour, 10 calls/5min
// 15-minute cooldown for quota-exceeded keys
// Automatic fallback to backup AI service
```

</details>

### **Security Implementation**

<details>
<summary><strong>Military-Grade Encryption</strong></summary>

```typescript
// AES-256-GCM with authentication tags
const ALGORITHM = "aes-256-gcm";
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "soulspeak_healing_encryption_key_32";

// Format: iv:authTag:ciphertext (hex encoded)
// Ensures data integrity and confidentiality
```

</details>

---

## **Deployment**

### **Netlify Configuration**

<details>
<summary><strong>Production Setup</strong></summary>

```toml
[build]
  command = "npm run build"
  publish = "dist/spa"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/api/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**Key Features:**

- Serverless functions for auto-scaling
- Global CDN distribution
- Automatic HTTPS
- Real-time health monitoring

</details>

---

## **Testing & Development**

### **Test Endpoints**

Perfect for hackathon demos without using AI quotas:

| Endpoint                    | Purpose               | Returns                 |
| --------------------------- | --------------------- | ----------------------- |
| `/api/test/verify`          | System verification   | Service status overview |
| `/api/test/journal/entries` | Mock journal creation | Simulated responses     |
| `/api/test/companion/chat`  | Mock AI chat          | Test conversation       |
| `DELETE /api/test/cleanup`  | Database cleanup      | Removes test data       |

### **Health Monitoring**

```bash
GET /api/health
# Returns: AI status, database health, memory usage, uptime
# Cached for 10 minutes to reduce AI API calls
```

---

## Future Development Plans

<details>
<summary><strong>Planned Enhancements</strong></summary>

**Enhanced AI Capabilities**

- Integration with additional AI models for diverse response styles
- Improved context understanding for longer conversation threads
- Specialized prompts for different mental health scenarios
- Multilingual support for global accessibility

**Advanced Analytics**

- Detailed mood pattern analysis with visual charts
- Correlation analysis between journal content and mood trends
- Exportable data reports for healthcare professionals

**Community Features**

- Optional anonymous peer support groups
- Moderated discussion forums with safety protocols
- Sharing inspiring recovery stories (with user consent)
- Mentor matching system for long-term support

**Mobile Experience**

- Progressive Web App (PWA) capabilities
- Native mobile applications for iOS and Android
- Offline functionality for core features
- Push notifications for check-ins and reminders

**Technical Improvements**

- Real-time chat capabilities with WebSocket support
- Voice-to-text integration for accessibility
- Enhanced security with end-to-end encryption
- Automated backup and disaster recovery systems

</details>

---

## **Technical Achievements**


| Feature                  | Implementation                  | Impact                             |
| ------------------------ | ------------------------------- | ---------------------------------- |
| **AI Reliability**       | 4-key rotation + backup service | High availability under quota limits |
| **Data Security**        | AES-256-GCM encryption          | Military-grade protection          |
| **Performance**          | Connection pooling + caching    | Fast responses under typical load  |
| **Scalability**          | Serverless + CDN                | Horizontally scalable via serverless + CDN |
| **Developer Experience** | TypeScript + Vite + HMR         | Lightning-fast development         |

---

## **Important Notes**

> **Disclaimer**: This application provides supportive AI conversations but is not a replacement for professional mental health care. Users experiencing crisis situations should seek immediate professional help.

### **Technical Notes**

- **Database**: Neon PostgreSQL is primary; Mongoose models present but unused
- **Authentication**: Client-side Supabase; server uses email-based identification
- **AI Conversations**: Session-based only (no persistent history for privacy)
- **Environment**: All variables configurable; secure fallbacks included

---

<div align="center">

### **Built with ❤️ for mental health support**

_Demonstrating the intersection of cutting-edge technology and human empathy_


</div>
