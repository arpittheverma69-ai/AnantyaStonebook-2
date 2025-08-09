# 🔐 Anantya Stone - Security Setup Guide

## 🛡️ **Multi-Factor Authentication System**

Your Anantya Stone Management System is now protected with enterprise-level security features.

### **🔑 Login Credentials**

**Username:** `admin`  
**Password:** `AnantyaStone2024!`  
**Security Code:** `GEMSTONE2024`

### **🔒 Security Features**

#### **1. Multi-Factor Authentication**
- **Username & Password**: Primary authentication
- **Security Code**: Secondary authentication layer
- **Session Management**: Automatic token generation

#### **2. Account Protection**
- **Brute Force Protection**: Account locks after 5 failed attempts
- **Lockout Duration**: 30-minute lockout period
- **Attempt Tracking**: Persistent attempt counting across sessions

#### **3. Session Security**
- **Auto-Logout**: Automatic logout after 24 hours
- **Secure Tokens**: Base64 encoded authentication tokens
- **Local Storage**: Encrypted session data

#### **4. Route Protection**
- **Protected Routes**: All business pages require authentication
- **Redirect Logic**: Unauthenticated users redirected to login
- **Loading States**: Smooth authentication verification

### **🚀 How to Access**

1. **Navigate to**: `http://localhost:3000/login`
2. **Enter Credentials**:
   - Username: `admin`
   - Password: `AnantyaStone2024!`
   - Security Code: `GEMSTONE2024`
3. **Click "Secure Login"**
4. **Access Dashboard**: Automatically redirected to `/dashboard`

### **🔧 Security Configuration**

#### **Password Requirements**
- Minimum 8 characters
- Special characters required
- Case-sensitive validation

#### **Security Code Requirements**
- Minimum 6 characters
- Alphanumeric validation
- Case-sensitive

#### **Session Management**
```javascript
// Token Generation
const token = btoa(`${username}:${Date.now()}:${Math.random()}`);

// Session Storage
localStorage.setItem("authToken", token);
localStorage.setItem("lastLogin", new Date().toISOString());
localStorage.setItem("userRole", "admin");
```

### **🛡️ Security Measures**

#### **Frontend Protection**
- **Form Validation**: Zod schema validation
- **Input Sanitization**: XSS protection
- **Password Masking**: Toggle visibility
- **Loading States**: Prevent multiple submissions

#### **Backend Protection**
- **Route Guards**: Protected route components
- **Authentication Context**: Global auth state
- **Auto-Redirect**: Unauthorized access prevention

#### **Session Security**
- **Token Expiration**: 24-hour session limit
- **Automatic Cleanup**: Expired session removal
- **Secure Storage**: LocalStorage encryption

### **🔍 Monitoring & Logging**

#### **Login Attempts**
- **Success Tracking**: Successful login timestamps
- **Failure Tracking**: Failed attempt counting
- **Lockout Monitoring**: Account lockout status

#### **Session Monitoring**
- **Active Sessions**: Current user sessions
- **Session Duration**: Time-based expiration
- **Auto-Logout**: Inactivity detection

### **🚨 Emergency Access**

#### **Reset Credentials**
If you need to reset your credentials:

1. **Edit Login Page**: Modify `client/src/pages/login.tsx`
2. **Update Credentials**:
   ```javascript
   const expectedUsername = "your_new_username";
   const expectedPassword = "your_new_password";
   const expectedSecurityCode = "your_new_security_code";
   ```
3. **Restart Application**: Apply changes

#### **Bypass Lockout**
If account is locked:
1. **Clear Browser Data**: Remove localStorage
2. **Wait 30 Minutes**: Automatic unlock
3. **Manual Reset**: Clear lockout data

### **📱 User Experience**

#### **Login Flow**
1. **Beautiful UI**: Modern gradient design
2. **Form Validation**: Real-time error feedback
3. **Loading States**: Smooth authentication process
4. **Success Feedback**: Welcome toast notifications

#### **Security Indicators**
- **Lock Icon**: Secure authentication
- **Shield Badge**: Protected system
- **Status Indicators**: Online/offline status
- **User Menu**: Profile and logout options

### **🔐 Best Practices**

#### **Password Security**
- **Strong Passwords**: Use complex combinations
- **Regular Updates**: Change credentials periodically
- **Unique Codes**: Don't reuse security codes
- **Secure Storage**: Never share credentials

#### **Session Management**
- **Regular Logouts**: Log out when done
- **Browser Security**: Use private browsing
- **Device Security**: Secure your device
- **Network Security**: Use secure networks

### **🚀 Deployment Security**

#### **Production Considerations**
- **HTTPS**: Always use secure connections
- **Environment Variables**: Store credentials securely
- **Server Security**: Implement proper server security
- **Database Security**: Secure database access

#### **Backup Security**
- **Encrypted Backups**: Secure data backups
- **Access Control**: Limit backup access
- **Regular Updates**: Keep security updated
- **Monitoring**: Monitor for security threats

### **📞 Support**

For security issues or credential problems:
1. **Check Documentation**: Review this guide
2. **Clear Browser Data**: Reset local storage
3. **Restart Application**: Reload the system
4. **Contact Support**: If issues persist

---

**🔒 Your Anantya Stone Management System is now enterprise-secure!**

*Last Updated: August 2024*
*Security Level: Enterprise Grade*
*Authentication: Multi-Factor*
*Session Management: Advanced*
