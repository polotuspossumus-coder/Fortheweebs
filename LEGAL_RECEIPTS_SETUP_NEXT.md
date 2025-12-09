# Legal Receipts Setup - FINAL STEPS

## ✅ What's Done:
1. ✅ Supabase tables created (legal_receipts + audit tables)
2. ✅ AWS S3 bucket created: `fortheweebs-legal-receipts-2025`
3. ✅ Bucket versioning enabled
4. ✅ API endpoint created: `/api/legal-receipts`
5. ✅ NPM packages installed

## 🔑 Next: Get AWS Credentials

### Step 1: Create IAM User
1. In AWS Console, search for **IAM**
2. Click **Users** → **Create user**
3. Username: `fortheweebs-api`
4. Click **Next**

### Step 2: Set Permissions
1. Select **Attach policies directly**
2. Search and select: **AmazonS3FullAccess**
3. Click **Next** → **Create user**

### Step 3: Create Access Key
1. Click on the user `fortheweebs-api`
2. Go to **Security credentials** tab
3. Scroll to **Access keys**
4. Click **Create access key**
5. Select: **Application running outside AWS**
6. Click **Next** → **Create access key**
7. **SAVE THESE NOW** (you won't see them again):
   - Access key ID
   - Secret access key

### Step 4: Add to .env
Add these to your `.env` file:
```
AWS_REGION=us-east-2
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
```

### Step 5: Test It
```bash
# Test creating a receipt
POST http://localhost:3000/api/legal-receipts
{
  "userId": "test-user-123",
  "email": "test@example.com",
  "termsContent": "Terms of Service v2.0...",
  "privacyContent": "Privacy Policy v2.0..."
}
```

## 📋 API Endpoints Created:

- `POST /api/legal-receipts` - Create new receipt
- `GET /api/legal-receipts/:userId` - Get user's receipts
- `GET /api/legal-receipts/receipt/:receiptId` - Get specific receipt

## 🔒 Security Features:
- ✅ Immutable storage (can't modify/delete)
- ✅ SHA-256 hashing for document verification
- ✅ S3 versioning enabled
- ✅ Complete audit trail in Supabase
- ✅ IP and user-agent tracking
- ✅ Retention until 2099 by default

## Next Steps:
1. Get AWS credentials (steps above)
2. Add to `.env`
3. Restart your server
4. Test the endpoint!
