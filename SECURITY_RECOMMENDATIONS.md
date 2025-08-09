# 🔒 Security Recommendations for Anantya Stone Management System

## 📊 Current Security Status
✅ **Working Features:**
- JWT-based authentication
- Password hashing with bcrypt
- Session management
- Route protection
- Environment variable security
- iPhone QR code authentication
- Multi-factor authentication support

## 🚨 Critical Security Improvements

### 1. **Database Security**
```sql
-- Enable Row Level Security (RLS) in Supabase
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Create security policies
CREATE POLICY "Users can only see their own data" ON users
FOR ALL USING (auth.uid() = id);

CREATE POLICY "Admin access to all data" ON inventory
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

### 2. **Authentication Enhancements**
```typescript
// Implement account lockout after failed attempts
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

// Add password strength requirements
const passwordSchema = z.string()
  .min(12, "Password must be at least 12 characters")
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
    "Password must contain uppercase, lowercase, number, and special character");

// Implement session timeout
const SESSION_TIMEOUT = 2 * 60 * 60 * 1000; // 2 hours
```

### 3. **API Security**
```typescript
// Rate limiting
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

// CORS configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Input validation middleware
const validateInput = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      res.status(400).json({ message: 'Invalid input data' });
    }
  };
};
```

### 4. **Data Protection**
```typescript
// Encrypt sensitive data at rest
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // 32 bytes key
const IV_LENGTH = 16; // For AES, this is always 16

function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipher('aes-256-cbc', ENCRYPTION_KEY);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

function decrypt(text: string): string {
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift()!, 'hex');
  const encryptedText = textParts.join(':');
  const decipher = crypto.createDecipher('aes-256-cbc', ENCRYPTION_KEY);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
```

### 5. **Audit Logging**
```typescript
// Implement comprehensive audit logging
interface AuditLog {
  userId: string;
  action: string;
  resource: string;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  details?: any;
}

const auditLogger = {
  log: async (entry: AuditLog) => {
    // Store in secure audit table
    await supabase.from('audit_logs').insert(entry);
  }
};

// Usage in routes
app.post('/api/sales', authenticateToken, async (req, res) => {
  // ... sale creation logic
  
  await auditLogger.log({
    userId: req.user.id,
    action: 'CREATE_SALE',
    resource: 'sales',
    timestamp: new Date(),
    ipAddress: req.ip,
    userAgent: req.get('User-Agent'),
    details: { saleId: newSale.id, amount: newSale.totalAmount }
  });
});
```

## 🛡️ Advanced Security Measures

### 1. **Content Security Policy (CSP)**
```typescript
// Add CSP headers
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' https://replit.com; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "connect-src 'self' https://api.gemini.com;"
  );
  next();
});
```

### 2. **File Upload Security**
```typescript
// Secure file upload for certifications
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/certifications/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req: any, file: any, cb: any) => {
  // Only allow PDF and image files
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only PDF and image files are allowed'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: fileFilter
});
```

### 3. **Environment Security**
```bash
# .env.example - Add these security variables
NODE_ENV=production
ENCRYPTION_KEY=your-32-byte-encryption-key-here
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
SESSION_SECRET=your-super-secret-session-key
AUDIT_LOG_RETENTION_DAYS=90
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_DURATION_MINUTES=15
PASSWORD_RESET_TOKEN_EXPIRY=1h
```

### 4. **Database Backup & Recovery**
```sql
-- Automated backup schedule
CREATE OR REPLACE FUNCTION backup_critical_data()
RETURNS void AS $$
BEGIN
  -- Export critical tables to secure backup location
  COPY users TO '/secure/backup/users_' || to_char(now(), 'YYYY_MM_DD') || '.csv' CSV HEADER;
  COPY inventory TO '/secure/backup/inventory_' || to_char(now(), 'YYYY_MM_DD') || '.csv' CSV HEADER;
  COPY sales TO '/secure/backup/sales_' || to_char(now(), 'YYYY_MM_DD') || '.csv' CSV HEADER;
END;
$$ LANGUAGE plpgsql;

-- Schedule daily backups
SELECT cron.schedule('daily-backup', '0 2 * * *', 'SELECT backup_critical_data();');
```

## 🔍 Security Monitoring

### 1. **Real-time Alerts**
```typescript
// Security alert system
const securityAlerts = {
  suspiciousActivity: async (userId: string, activity: string) => {
    // Send alert to admin
    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: '🚨 Security Alert - Suspicious Activity',
      body: `Suspicious activity detected for user ${userId}: ${activity}`
    });
  },
  
  failedLogins: async (ip: string, attempts: number) => {
    if (attempts >= 3) {
      // Block IP temporarily
      await addToBlacklist(ip, 15 * 60 * 1000); // 15 minutes
    }
  }
};
```

### 2. **Security Dashboard**
```typescript
// Add security metrics to dashboard
const securityMetrics = {
  failedLoginAttempts: await getFailedLoginCount(24), // Last 24 hours
  suspiciousActivities: await getSuspiciousActivities(7), // Last 7 days
  activeUsers: await getActiveUserCount(),
  dataBreachAttempts: await getDataBreachAttempts(30), // Last 30 days
};
```

## 📋 Security Checklist

### ✅ **Immediate Actions (High Priority)**
- [ ] Enable HTTPS/SSL certificate
- [ ] Implement rate limiting on all endpoints
- [ ] Add input validation to all forms
- [ ] Enable Supabase Row Level Security
- [ ] Set up automated backups
- [ ] Configure CSP headers
- [ ] Implement session timeout

### 🔄 **Medium Priority**
- [ ] Add audit logging for all critical actions
- [ ] Implement account lockout mechanism
- [ ] Set up security monitoring alerts
- [ ] Add file upload validation
- [ ] Implement data encryption for sensitive fields
- [ ] Create security incident response plan

### 🎯 **Long-term Security (Low Priority)**
- [ ] Penetration testing
- [ ] Security code review
- [ ] Compliance audit (if required)
- [ ] Advanced threat detection
- [ ] Security training for team members

## 🚀 **Quick Implementation Guide**

### Step 1: Install Security Dependencies
```bash
npm install express-rate-limit helmet cors express-validator
npm install --save-dev @types/cors
```

### Step 2: Basic Security Middleware
```typescript
import helmet from 'helmet';
import cors from 'cors';

// Add to server/index.ts
app.use(helmet());
app.use(cors(corsOptions));
app.use(limiter);
```

### Step 3: Environment Variables
```bash
# Add to .env
ENCRYPTION_KEY=generate-32-byte-key-here
MAX_LOGIN_ATTEMPTS=5
SESSION_TIMEOUT=7200000
ALLOWED_ORIGINS=http://localhost:3000
```

## 📞 **Emergency Contacts**
- **Security Issues**: Immediately change all passwords and API keys
- **Data Breach**: Contact legal team and prepare incident report
- **System Compromise**: Take system offline and restore from backup

---

**Remember**: Security is an ongoing process, not a one-time setup. Regularly review and update these measures as your application grows.
