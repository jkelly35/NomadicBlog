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

### Notes

- Keep the anon key in `js/supabase-config.js` (do not use the service role key in browser code).
- This is a front-end framework scaffold; you can extend it with profile pages, password reset, protected content, or OAuth providers.