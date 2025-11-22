# 🎯 SQL FILES TO RUN IN SUPABASE

**Run these 2 files IN ORDER in your Supabase SQL Editor:**

## 1. `autonomous-tables-FOR-POLOTUS.sql`
**What it does:**
- Creates `ai_conversations` table (chat logs)
- Creates `suggestions` table (feature requests)
- Creates `claude_notifications` table (owner dashboard)
- Updates `bug_reports` table (adds autonomous fields)
- Sets up RLS policies with YOUR email

**Your email is already configured:** `polotuspossumus@gmail.com`

---

## 2. `COMPLETE_VIP_LIST.sql`
**What it does:**
- Grants LIFETIME_VIP tier to all 11 VIP users
- Creates users if they don't exist
- Updates tier if they already exist

**VIP Users (11 total):**
1. chesed04@aol.com
2. Colbyg123f@gmail.com
3. PerryMorr94@gmail.com
4. remyvogt@gmail.com
5. kh@savantenergy.com
6. Bleska@mindspring.com
7. palmlana@yahoo.com
8. Billyxfitzgerald@yahoo.com
9. Yeahitsmeangel@yahoo.com
10. Atolbert66@gmail.com
11. brookewhitley530@gmail.com

---

## How to Run:

1. Go to: https://supabase.com/dashboard
2. Select your project
3. Click "SQL Editor" in left sidebar
4. Click "New query"
5. Open `autonomous-tables-FOR-POLOTUS.sql`
6. Copy entire contents
7. Paste into SQL Editor
8. Click "Run"
9. Look for ✅ success messages
10. Repeat for `COMPLETE_VIP_LIST.sql`

---

## ⚠️ Other SQL Files (Don't Run These)

The following files are archived and don't need to be run:
- `blocks-table.sql` - Optional multi-account blocking
- `create-remaining-tables.sql` - Legacy
- `database_autonomous_system.sql` - Legacy
- `payment-tables-only.sql` - Already in database
- `privacy-enforcement-table.sql` - Optional audit logging
- `user-columns.sql` - Legacy
- `user-payment-info-table.sql` - Legacy

---

**You only need to run the 2 files listed at the top!**
