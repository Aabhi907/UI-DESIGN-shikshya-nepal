# Supabase authentication setup

Apply `20260907_role_auth_and_claims.sql` after the earlier migrations.

1. In Supabase Authentication, enable Email/password and **Confirm Email**. The registration route now requires this setting: a signup must return no session until the student clicks the confirmation link.
2. In Authentication > URL Configuration, set the production Site URL and allow `https://YOUR_DOMAIN/account/login` (plus `http://localhost:3000/account/login` for local testing). Set `NEXT_PUBLIC_SITE_URL` to the same site origin.
3. Keep the Confirm signup email template using Supabase's `{{ .ConfirmationURL }}` link (or provide an equivalent verified server-side callback). Configure SMTP/delivery for real student addresses and test a confirmation email before launch.
4. Create the owner account in Supabase Authentication or register it at `/account/register`.
5. In Supabase SQL Editor, promote only the trusted owner account:

```sql
update public.profiles
set role = 'owner', updated_at = now()
where id = (select id from auth.users where email = 'OWNER_EMAIL_HERE');
```

6. Set `ADMIN_EMAIL` to that same email in `.env.local` and in the Vercel project environment variables. Only this email with the `owner` role can use admin pages or APIs.
7. The owner signs in at `/admin/login` using email and password.
8. Representatives register, sign in, and submit a request at `/account/claim`.
9. The owner verifies the requester through official contact details before approving `/admin/claims`.

## Google sign-in

1. In Google Cloud Console, create an OAuth 2.0 Web application.
2. Add the Supabase callback URL shown under **Supabase → Authentication → Providers → Google** as an authorized redirect URI. It normally looks like `https://PROJECT_REF.supabase.co/auth/v1/callback`.
3. Paste the Google client ID and client secret into the Supabase Google provider and enable it.
4. In **Supabase → Authentication → URL Configuration**, set the production site URL and add these redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `https://YOUR_DOMAIN/auth/callback`
5. Test both `/account/login` and `/account/register`. A successful Google login returns the student to `/my-path`.

Never place passwords, access tokens, or the Supabase service-role key in Git. The service-role key is server-only. There is no fallback admin password.
