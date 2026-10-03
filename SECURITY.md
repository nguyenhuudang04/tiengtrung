# SECURITY REVIEW & BEST PRACTICES

## MVP Status
Currently, this website is an **MVP (Minimum Viable Product)** without Authentication enabled. It is designed to be run locally or for personal use by a single user.

## Current Policies
The Supabase Row Level Security (RLS) policies for tables such as `vocabulary` and `learning_progress` are currently set to allow **public write access** (e.g. `USING (true) WITH CHECK (true)`) using the anonymous key.

**⚠️ WARNING:** 
Because `NEXT_PUBLIC_SUPABASE_ANON_KEY` is exposed to the frontend (as is standard), anyone who visits your live website URL could potentially ADD, UPDATE, or DELETE your vocabulary data.

## Recommendations for Production Deployment
Before sharing this website's link publicly:

1. **Enable Authentication:** Set up Supabase Auth (e.g. Email/Password or OAuth).
2. **Update RLS Policies:** Restrict the policies on `vocabulary` and `learning_progress` so that only the authenticated user can read/write their own data.
   Example:
   ```sql
   create policy "Users can read own data" on vocabulary for select using (auth.uid() = user_id);
   create policy "Users can insert own data" on vocabulary for insert with check (auth.uid() = user_id);
   -- ...and same for update/delete
   ```
3. **Migrate existing data:** Add a `user_id` column to existing tables and map them to your new user UUID.

## Environment Variables
- Ensure `.env.local` is never committed to the repository (already handled by `.gitignore`).
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` is safe to expose on the frontend **only when** RLS is strictly configured to protect your data.
- **Never** use or expose `service_role` key in frontend code.
