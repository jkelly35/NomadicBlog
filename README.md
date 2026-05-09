# NomadicBlog

## Supabase Login Framework

The site now includes a shared auth scaffold on every HTML page:

- Login button is injected into the header nav by `js/auth-ui.js`
- Supabase browser client is loaded from CDN
- Email/password sign-in and sign-up modal is wired
- Auth state is tracked so users see `Login` or `Account`

### Configure Supabase

1. Open `js/supabase-config.js`
2. Set your project values:

```js
window.NOMADIC_SUPABASE_URL = "https://YOUR-PROJECT.supabase.co";
window.NOMADIC_SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";
window.NOMADIC_SUPABASE_OAUTH_REDIRECT = "https://your-domain.com/index.html";
```

3. In your Supabase dashboard, add your site URL(s) to Authentication URL settings.
4. If email confirmation is enabled, new users will need to confirm their email before login is fully active.

### GitHub OAuth

If GitHub is enabled in Supabase, the login modal now includes a `Continue with GitHub` button.

1. In Supabase Auth providers, ensure GitHub is enabled and credentials are saved.
2. In Supabase URL configuration, include your redirect URL.
3. Set `window.NOMADIC_SUPABASE_OAUTH_REDIRECT` in `js/supabase-config.js` to a URL that exists on your site.
4. In your GitHub OAuth app settings, ensure the callback URL matches what Supabase requires for your project.

### Files Added

- `js/supabase-config.js`
- `js/auth-ui.js`
- `js/athlete-profile.js`
- `profile.html`

### Athlete Profile Page

Once authenticated, users see a "Profile" link in the header navigation.

**Features:**
- Protected page (redirects to home if not logged in)
- Display account info: email, creation date, last sign-in
- Editable athletic profile fields: name, sport, experience level, bio, age, location
- Profile data stored in Supabase `athlete_profiles` table
- Account deletion option

**Database Setup:**
Create a table in Supabase called `athlete_profiles` with these columns:
```sql
CREATE TABLE athlete_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name text,
  sport text,
  level text,
  bio text,
  age int,
  location text,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Enable RLS
ALTER TABLE athlete_profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to read/write their own profile
CREATE POLICY "Users can read own profile" ON athlete_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON athlete_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON athlete_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile" ON athlete_profiles
  FOR DELETE USING (auth.uid() = user_id);
```

### Admin Dashboard

The admin dashboard at `/admin.html` is restricted to `joe@nomadicperformance.com` and provides full athlete management.

**Features:**
- Protected page (redirects to home if not logged in or not admin)
- Stats cards: total athletes, profiles created
- Searchable table of all athletes with email, name, sport, level, joined date
- Edit athlete profile fields
- Reset athlete password
- Delete athlete account
- Pagination for large athlete lists

**Setup:**
1. Ensure you're logged in as `joe@nomadicperformance.com`
2. Navigate to `/admin.html`
3. Use the search bar to filter athletes
4. Click "Edit" to open athlete details modal
5. Update athlete profile fields or perform account actions

**Database Requirements:**
Admin access uses the same `athlete_profiles` table. You'll need to add admin-specific RLS policies if you want to restrict admin actions via the database (optional):

```sql
-- Create a table to track admin roles (optional, for production)
CREATE TABLE admin_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamp DEFAULT now()
);

ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read admin list (optional)
CREATE POLICY "Anyone can read admins" ON admin_roles FOR SELECT USING (true);
```

For now, admin access is verified client-side by email check. In production, consider using Supabase RLS policies with a server-side admin verification.

### Notes

- Keep the anon key in `js/supabase-config.js` (do not use the service role key in browser code).
- This is a front-end framework scaffold; you can extend it with profile pages, password reset, protected content, or OAuth providers.
- Admin email `joe@nomadicperformance.com` is hardcoded in `js/admin.js`. To change it, update the `ADMIN_EMAIL` constant in that file.
- Password reset emails are sent via Supabase. Ensure your Supabase project has email provider configured in project settings.