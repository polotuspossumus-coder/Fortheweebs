# Tax Compliance for Creators - Complete Guide

## TL;DR - You Don't Handle Tax Documents

**Stripe handles 100% of tax compliance automatically.** You never see or store tax documents. Stripe collects, verifies, files, and generates all forms.

## How It Works

### 1. Creator Clicks "Enable Payments"
They're redirected to Stripe's secure onboarding where they enter:
- Legal name
- SSN/Tax ID (US) or equivalent (International)
- Address
- Date of birth
- Bank account info

**You never see this data** - it's encrypted and stored by Stripe only.

### 2. Stripe Verifies Identity
- Instant SSN/Tax ID verification
- Bank account verification
- Address confirmation
- KYC/AML compliance checks

Takes 1-2 business days for approval.

### 3. Creator Receives Payments
- Money goes directly to their bank account
- Automatic payouts every 2 days (or weekly)
- Full payment history in their Stripe dashboard

### 4. Tax Season (Automatic)
**January 31st each year:**
- Stripe generates 1099-K forms for creators who earned $600+
- Forms sent to creator and IRS automatically
- Creator downloads from Stripe dashboard
- You do nothing

## Tax Forms by Jurisdiction

### United States
- **Form:** 1099-K
- **Threshold:** $600+ per year
- **Who gets it:** All US creators
- **Filed by:** Stripe (automatically)

### International (Non-US)
- **Form:** W-8BEN or W-8BEN-E
- **Purpose:** Claim tax treaty benefits
- **Withholding:** 30% default, reduced with tax treaty
- **Filed by:** Stripe (automatically)

### Canada
- No 1099-K required
- Creators report on T2125 (self-employment)
- Stripe provides transaction history for records

### EU Countries
- VAT may apply depending on country
- Stripe can collect VAT if configured
- Creators report on their local tax returns

### UK
- No 1099 forms
- Creators report on Self Assessment (SA103)
- Stripe provides transaction reports

## What Stripe Collects During Onboarding

### US Creators:
✅ Full legal name
✅ SSN or EIN
✅ Date of birth
✅ Home address
✅ Bank account (routing + account number)
✅ Business type (individual/LLC/corporation)

### International Creators:
✅ Full legal name
✅ Tax ID (equivalent to SSN)
✅ Address
✅ Bank account (IBAN/SWIFT)
✅ Proof of identity (passport/license)

## Tax Thresholds

| Country | Form | Threshold | Withholding |
|---------|------|-----------|-------------|
| US | 1099-K | $600/year | 0% |
| International | W-8BEN | $0 | 30% (or treaty rate) |
| Canada | None | N/A | 0% |
| UK | None | N/A | 0% |
| EU | VAT Invoice | Varies by country | 0-27% VAT |

## Creator's Tax Responsibilities

### What Creators Must Do:
1. ✅ Provide accurate info during Stripe onboarding
2. ✅ Keep records of earnings
3. ✅ File their own tax returns (quarterly or annual)
4. ✅ Pay estimated taxes quarterly (US: Form 1040-ES)
5. ✅ Report all income to their local tax authority

### What Stripe Does:
1. ✅ Collects W-9/W-8 forms
2. ✅ Generates 1099-K (if threshold met)
3. ✅ Files forms with IRS
4. ✅ Provides transaction history year-round
5. ✅ Sends forms by January 31st

## Your Platform's Responsibilities

### What You Do:
- ✅ Provide "Enable Payments" button
- ✅ Send creators to Stripe onboarding
- ✅ Display payment status in dashboard

### What You DON'T Do:
- ❌ Collect or store tax documents
- ❌ Verify SSN/Tax IDs
- ❌ Generate tax forms
- ❌ File with IRS or tax authorities
- ❌ Handle tax withholding
- ❌ Store sensitive financial data

**Stripe handles everything else.**

## Platform Fees & Tax Reporting

Your platform fee (0-15%) is:
- **Not reported on creator's 1099-K** (only their net earnings)
- **Your income** (you report it on your business taxes)
- **Automatically deducted** by Stripe before payout

### Example:
- Buyer pays: $100
- Platform fee (15%): $15
- Creator receives: $85
- Creator's 1099-K shows: $85 (not $100)
- You report: $15 as platform revenue

## Common Questions

**Q: Do I need to collect tax documents from creators?**
A: No. Stripe collects W-9/W-8 during onboarding.

**Q: Do I need to generate 1099 forms?**
A: No. Stripe generates and files 1099-K automatically.

**Q: What if a creator doesn't provide SSN?**
A: Stripe won't approve their account. They can't receive payments until they complete onboarding.

**Q: What about backup withholding?**
A: Stripe handles it. If creator provides invalid SSN, Stripe withholds 24%.

**Q: Do I need a tax lawyer?**
A: Not for creator payments. Stripe is fully compliant. You may need one for your own business taxes.

**Q: What if creator is international?**
A: Stripe collects W-8BEN and applies correct withholding based on tax treaties.

**Q: What records should I keep?**
A: None. Stripe keeps all records for 7 years (IRS requirement).

## Implementation Checklist

- [x] Stripe Connect API integrated (`/api/stripe-connect/*`)
- [x] "Enable Payments" button in creator dashboard
- [x] Redirect to Stripe onboarding on button click
- [x] Check account status on dashboard load
- [x] Show "Payments Enabled" once approved
- [ ] Add "Enable Payments" button to your creator dashboard

## Next Steps

1. **Add `<CreatorPaymentSetup />` to your creator dashboard**
2. **Test the flow:**
   - Click "Enable Payments"
   - Complete Stripe onboarding (test mode)
   - Verify "Payments Enabled" shows
3. **Go live** - switch to live Stripe keys

## Support Resources

- **Stripe Tax Guide:** https://stripe.com/docs/connect/taxes
- **1099-K Info:** https://stripe.com/docs/connect/1099-requirements
- **International Taxes:** https://stripe.com/docs/connect/international-taxes

---

**Bottom Line:** You literally don't touch tax documents. Creators enter info → Stripe handles everything → Creators get tax forms. That's it. 🎉
