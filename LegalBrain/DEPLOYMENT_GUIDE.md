# LegalBrain - Complete Deployment Guide

## 🚀 DEPLOYMENT INSTRUCTIONS

### 1. SUPABASE SETUP (Required)

#### Create Supabase Project:
1. Go to [Supabase Dashboard](https://supabase.com/dashboard/projects)
2. Click "New Project"
3. Enter project name: `legalbrain-db`
4. Set database password (save this!)
5. Select region closest to your users
6. Click "Create new project"

#### Get Database Connection:
1. Once project is created, click "Connect" button
2. Copy the URI from "Connection string" → "Transaction pooler"
3. Replace `[YOUR-PASSWORD]` with your database password
4. Save this URL as `DATABASE_URL`

#### Setup Database Schema:
1. Go to SQL Editor in Supabase
2. Run this SQL to create all required tables:

```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Sessions table (required for Replit Auth)
CREATE TABLE IF NOT EXISTS sessions (
  sid VARCHAR PRIMARY KEY,
  sess JSONB NOT NULL,
  expire TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON sessions (expire);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR UNIQUE,
  first_name VARCHAR,
  last_name VARCHAR,
  profile_image_url VARCHAR,
  role VARCHAR DEFAULT 'citizen',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- FIR Reports table
CREATE TABLE IF NOT EXISTS fir_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id VARCHAR REFERENCES users(id),
  fir_number VARCHAR UNIQUE NOT NULL,
  complainant_name VARCHAR NOT NULL,
  address TEXT,
  phone_number VARCHAR,
  incident_date DATE,
  incident_time TIME,
  location TEXT,
  crime_type VARCHAR,
  description TEXT,
  police_station VARCHAR,
  witness_name VARCHAR,
  witness_contact VARCHAR,
  evidence_type VARCHAR,
  status VARCHAR DEFAULT 'pending',
  investigating_officer VARCHAR,
  ipc_sections TEXT[],
  pdf_url VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Chat Logs table
CREATE TABLE IF NOT EXISTS chat_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id VARCHAR REFERENCES users(id),
  query TEXT NOT NULL,
  response TEXT NOT NULL,
  language VARCHAR DEFAULT 'english',
  confidence DECIMAL(3,2),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Case Status table
CREATE TABLE IF NOT EXISTS case_status (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id VARCHAR NOT NULL,
  fir_id UUID REFERENCES fir_reports(id),
  user_id VARCHAR REFERENCES users(id),
  status VARCHAR DEFAULT 'pending',
  court VARCHAR,
  judge VARCHAR,
  hearing_date TIMESTAMP,
  remarks TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Audit Logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id VARCHAR REFERENCES users(id),
  module VARCHAR NOT NULL,
  action VARCHAR NOT NULL,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Setup Row Level Security (RLS):
```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE fir_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (id = current_user);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (id = current_user);

-- FIR policies
CREATE POLICY "Users can view own FIRs" ON fir_reports FOR SELECT USING (user_id = current_user);
CREATE POLICY "Users can create FIRs" ON fir_reports FOR INSERT WITH CHECK (user_id = current_user);
CREATE POLICY "Police can view all FIRs" ON fir_reports FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE id = current_user AND role IN ('police', 'admin'))
);

-- Chat logs policies
CREATE POLICY "Users can view own chats" ON chat_logs FOR SELECT USING (user_id = current_user);
CREATE POLICY "Users can create chats" ON chat_logs FOR INSERT WITH CHECK (user_id = current_user);

-- Case status policies
CREATE POLICY "Users can view own cases" ON case_status FOR SELECT USING (user_id = current_user);
CREATE POLICY "Police can view all cases" ON case_status FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE id = current_user AND role IN ('police', 'admin'))
);

-- Audit logs - admin only
CREATE POLICY "Admin can view audit logs" ON audit_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE id = current_user AND role = 'admin')
);
```

#### Setup Storage for FIR PDFs:
1. Go to Storage in Supabase
2. Create bucket: `fir-documents`
3. Set bucket as public
4. Add policy for authenticated users to upload

### 2. REPLIT BACKEND DEPLOYMENT

#### Environment Variables (Add in Replit Secrets):
```
DATABASE_URL=postgresql://[user]:[password]@[host]:5432/[database]
SESSION_SECRET=your-super-secret-session-key-min-32-chars
ENCRYPTION_KEY=your-aes-256-encryption-key-32-bytes
REPL_ID=your-repl-id
ISSUER_URL=https://replit.com/oidc
REPLIT_DOMAINS=your-repl-domain.replit.app
```

#### Backend Installation:
1. Fork this repository to Replit
2. Add all environment variables in Secrets tab
3. The backend will auto-start with `npm run dev`
4. Backend serves API at: `https://your-repl.replit.app/api/`

### 3. VERCEL FRONTEND DEPLOYMENT

#### Environment Variables (Add in Vercel):
```
VITE_API_BASE_URL=https://your-repl.replit.app
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

#### Frontend Deployment:
1. Connect GitHub repo to Vercel
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variables
5. Deploy

### 4. FINAL TESTING CHECKLIST

#### Complete System Test Flow:

**Step 1: User Registration & Login**
- [ ] Visit deployed frontend URL
- [ ] Click "Login" → Redirects to Replit OAuth
- [ ] Complete Replit authentication
- [ ] Verify redirect back to application
- [ ] Check user appears in Supabase `users` table

**Step 2: AI Chatbot Testing**
- [ ] Navigate to Chatbot page
- [ ] Ask: "What is Section 498A of IPC?"
- [ ] Verify AI response with confidence score
- [ ] Test Hindi: "मुझे धारा 498ए के बारे में बताएं"
- [ ] Test Marathi: "कृपया धारा 498ए बद्दल सांगा"
- [ ] Check chat_logs table for conversation history

**Step 3: FIR Filing & PDF Generation**
- [ ] Navigate to FIR Filing page
- [ ] Fill out complete FIR form:
  - Complainant details
  - Crime type: "Domestic Violence"
  - Incident description (minimum 50 words)
  - Location and date/time
- [ ] Submit form → Get FIR number
- [ ] Click "Download PDF" button
- [ ] Verify PDF downloads with encryption notice
- [ ] Check fir_reports table for encrypted data
- [ ] Verify case_status entry created

**Step 4: Case Tracking**
- [ ] Navigate to Case Tracking page
- [ ] View filed FIR in case list
- [ ] Click case to see court details:
  - Court name and judge assigned
  - Hearing date scheduled
  - Investigation timeline
- [ ] Test PDF download from case view

**Step 5: Role-Based Access Testing**
```sql
-- In Supabase SQL Editor, update user role to test:
UPDATE users SET role = 'police' WHERE id = 'your-user-id';
```
- [ ] Logout and login again
- [ ] Verify redirect to Police Dashboard
- [ ] Test access to all FIRs (not just own)
- [ ] Change role to 'admin' and test Admin Dashboard

**Step 6: Security & Encryption Verification**
- [ ] In Supabase, check fir_reports.description is encrypted
- [ ] Verify audit_logs table records all actions
- [ ] Test RLS policies work (user can't see other's data)
- [ ] Verify HTTPS-only access in production

#### Database Verification Queries:
```sql
-- Check user registration
SELECT * FROM users ORDER BY created_at DESC LIMIT 5;

-- Check FIR encryption (should see encrypted text)
SELECT fir_number, description, created_at FROM fir_reports ORDER BY created_at DESC LIMIT 3;

-- Check chat interactions
SELECT query, response, language, confidence FROM chat_logs ORDER BY created_at DESC LIMIT 5;

-- Check case status creation
SELECT case_id, status, court, hearing_date FROM case_status ORDER BY created_at DESC LIMIT 3;

-- Check audit trail
SELECT user_id, module, action, details, created_at FROM audit_logs ORDER BY created_at DESC LIMIT 10;

-- Verify RLS is working (should only show current user's data)
SELECT COUNT(*) as my_firs FROM fir_reports WHERE user_id = current_user;
```

### 5. SECURITY FEATURES IMPLEMENTED

#### Encryption:
- FIR data encrypted with AES-256 before storage
- PDF files encrypted before upload to Supabase Storage
- Secure session management with PostgreSQL store

#### Authentication:
- JWT-based authentication with Replit OAuth
- Role-based access control (Citizen, Police, Admin)
- Session timeout and refresh token handling

#### Network Security:
- HTTPS-only communication
- CORS protection enabled
- Input validation with Zod schemas
- SQL injection prevention with parameterized queries

#### Data Protection:
- Row Level Security (RLS) in Supabase
- Audit logging for all sensitive operations
- IP address and user agent tracking
- Data anonymization for logs

### 6. API ENDPOINTS IMPLEMENTED

#### Authentication:
- `GET /api/auth/user` - Get current user
- `GET /api/login` - Initiate login
- `GET /api/logout` - Logout user

#### AI Features:
- `POST /api/chatbot` - AI legal assistance
- `POST /api/ai/ipc-suggestions` - Get IPC section suggestions

#### FIR Management:
- `POST /api/fir/generate` - Create encrypted FIR with PDF
- `GET /api/fir/user` - Get user's FIRs
- `PATCH /api/fir/:id/status` - Update FIR status

#### Case Management:
- `GET /api/case-status/:caseId` - Get case details with court info
- `GET /api/cases/user` - Get user's cases

#### Admin Features:
- `GET /api/audit-logs` - System audit logs
- `GET /api/fir/all` - All FIRs (police/admin)
- `GET /api/cases/all` - All cases (police/admin)

### 7. PRODUCTION CHECKLIST

#### Pre-Launch:
- [ ] All environment variables set correctly
- [ ] Database schema deployed to Supabase
- [ ] RLS policies configured and tested
- [ ] SSL certificates configured
- [ ] Error monitoring setup (Sentry recommended)
- [ ] Backup strategy for database
- [ ] Rate limiting configured
- [ ] GDPR compliance documentation

#### Post-Launch Monitoring:
- [ ] Database performance monitoring
- [ ] API response time monitoring
- [ ] Error rate tracking
- [ ] User authentication success rates
- [ ] Storage usage tracking
- [ ] Security audit logs review

### 8. SCALING CONSIDERATIONS

#### Database:
- Supabase auto-scales to 500MB free tier
- Upgrade to Pro for larger scale ($25/month)
- Consider connection pooling for high traffic

#### API:
- Replit automatically handles basic scaling
- Consider Replit Hacker plan for better performance
- Alternative: Deploy to Railway/Render for production

#### Frontend:
- Vercel handles CDN and auto-scaling
- Optimize images and assets
- Implement lazy loading for better performance

#### Storage:
- Supabase Storage: 1GB free, scales with plan
- Implement file compression for PDFs
- Consider archiving old documents

---

## 🔒 SECURITY NOTES

1. **Never commit secrets** to version control
2. **Rotate encryption keys** regularly in production
3. **Monitor audit logs** for suspicious activity
4. **Backup database** before major updates
5. **Test RLS policies** thoroughly with different user roles
6. **Use HTTPS everywhere** - never HTTP in production
7. **Validate all inputs** on both frontend and backend
8. **Regular security audits** of dependencies

## 📞 SUPPORT

For deployment issues:
1. Check Replit console logs
2. Check Vercel deployment logs  
3. Check Supabase logs and metrics
4. Verify all environment variables are set
5. Test API endpoints individually with Postman/curl

---

**Deploy Time: ~30 minutes**  
**Cost: $0 (with free tiers)**  
**Supports: Unlimited users with free tier limits**