# Supabase Authentication Setup

This project uses Supabase for authentication with GitHub and Google OAuth providers.

## Setup Instructions

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for the project to be ready

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

You can find these values in your Supabase project dashboard under Settings > API.

### 3. Configure OAuth Providers

#### GitHub OAuth Setup

1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create a new OAuth App with:
   - **Application name**: BREEQA
   - **Homepage URL**: `http://localhost:3000` (or your domain)
   - **Authorization callback URL**: `https://your-project-ref.supabase.co/auth/v1/callback`
3. Copy the Client ID and Client Secret
4. In Supabase Dashboard > Authentication > Providers > GitHub:
   - Enable GitHub provider
   - Add your Client ID and Client Secret
   - Set the redirect URL to: `http://localhost:3000/auth/callback`

#### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to Credentials > Create Credentials > OAuth 2.0 Client IDs
5. Configure the OAuth consent screen
6. Create OAuth client with:
   - **Application type**: Web application
   - **Authorized redirect URIs**: `https://your-project-ref.supabase.co/auth/v1/callback`
7. Copy the Client ID and Client Secret
8. In Supabase Dashboard > Authentication > Providers > Google:
   - Enable Google provider
   - Add your Client ID and Client Secret
   - Set the redirect URL to: `http://localhost:3000/auth/callback`

### 4. Configure Site URL

In Supabase Dashboard > Authentication > URL Configuration:

- Set **Site URL** to: `http://localhost:3000` (or your production domain)
- Add **Redirect URLs**: `http://localhost:3000/auth/callback`

### 5. Test the Authentication

1. Start your development server: `npm run dev`
2. Go to `http://localhost:3000/auth`
3. Try logging in with GitHub or Google
4. You should be redirected to the dashboard after successful authentication

## File Structure

```
src/
├── lib/supabase/
│   ├── client.ts          # Browser client
│   └── server.ts          # Server client
├── middleware.ts           # Auth middleware
├── app/
│   ├── auth/
│   │   ├── page.tsx       # Auth page
│   │   ├── callback/
│   │   │   └── route.ts   # OAuth callback handler
│   │   ├── auth-code-error/
│   │   │   └── page.tsx   # Auth error page
│   │   └── logout/
│   │       └── route.ts   # Logout handler
│   └── dashboard/
│       └── page.tsx       # Protected dashboard
```

## Features

- ✅ GitHub OAuth authentication
- ✅ Google OAuth authentication
- ✅ Server-side rendering (SSR) support
- ✅ Protected routes with middleware
- ✅ Automatic redirects
- ✅ Error handling
- ✅ Logout functionality
- ✅ User session management

## Troubleshooting

### Common Issues

1. **"Invalid redirect URL"**: Make sure your redirect URLs match exactly in both Supabase and OAuth provider settings
2. **"Client ID not found"**: Verify your environment variables are set correctly
3. **CORS errors**: Ensure your site URL is configured correctly in Supabase

### Debug Mode

To debug authentication issues, check the browser console and network tab for error messages.
