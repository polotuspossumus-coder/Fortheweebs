# Security Policy

## Supported Versions

We release patches for security vulnerabilities. Currently supported versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to security@fortheweebs.com

You should receive a response within 48 hours. If for some reason you do not, please follow up via email to ensure we received your original message.

Please include the following information:

- Type of issue (e.g. buffer overflow, SQL injection, cross-site scripting, etc.)
- Full paths of source file(s) related to the issue
- Location of the affected source code (tag/branch/commit or direct URL)
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit it

We prefer all communications to be in English.

## Disclosure Policy

When we receive a security bug report, we will:

1. Confirm the problem and determine the affected versions
2. Audit code to find any similar problems
3. Prepare fixes for all releases still under maintenance
4. Release patches as soon as possible

## Bug Bounty Program

We currently do not offer a paid bug bounty program, but we will publicly acknowledge security researchers who responsibly disclose vulnerabilities to us.

## Security Best Practices for Users

### Environment Variables
- Never commit `.env` files to Git
- Rotate secrets regularly (JWT_SECRET, API keys)
- Use different secrets for development and production

### Stripe
- Always use test mode for development
- Keep webhook secrets secure
- Monitor for suspicious payment activity

### Supabase
- Enable Row Level Security on all tables
- Use service role key only in backend functions
- Review and audit security policies regularly

### Authentication
- Use strong passwords
- Enable 2FA when available
- Don't share admin QR codes

## Known Security Features

✅ Row Level Security (RLS) enabled on all database tables  
✅ HTTPS enforced via Netlify  
✅ Environment variables secured  
✅ XSS protection via React's built-in escaping  
✅ CSRF protection via same-origin policy  
✅ Secure headers configured in Netlify  
✅ Stripe PCI compliance  
✅ JWT-based authentication  
✅ Input validation on all forms  

## Security Updates

We regularly update dependencies to patch security vulnerabilities. Run:

```bash
npm audit
npm audit fix
```

## Contact

- **Security Issues:** security@fortheweebs.com
- **General Support:** support@fortheweebs.com
- **Twitter:** @ForTheWeebs
