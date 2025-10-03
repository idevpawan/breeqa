# Organization-Based Access Control Setup

This document explains how to set up the organization-based access control system for BREEQA.

## 🗄️ Database Setup

### 1. Run the Database Schema

Execute the SQL commands in `database-schema.sql` in your Supabase SQL Editor:

```sql
-- Copy and paste the entire contents of database-schema.sql
-- This will create all necessary tables, indexes, triggers, and RLS policies
```

### 2. Verify Tables Created

After running the schema, you should see these tables in your Supabase dashboard:

- `organizations` - Organization information
- `user_profiles` - User profile data
- `organization_members` - User-organization relationships
- `organization_invitations` - Pending invitations
- `projects` - Project data (for future use)

## 🔧 Environment Variables

Make sure your `.env.local` file includes:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 🚀 Features Implemented

### ✅ Core Organization System

- **Organization Creation**: New users must create an organization
- **User Profiles**: Automatic profile creation on signup
- **Role-Based Access**: 6 roles with hierarchical permissions
- **Multi-Organization Support**: Users can belong to multiple organizations

### ✅ Authentication Flow

- **Onboarding Flow**: Forces organization creation for new users
- **Organization Context**: All pages have organization context
- **Permission Checks**: Role-based UI and route protection
- **Invitation System**: Email-based invitations with tokens

### ✅ User Roles & Permissions

| Role          | Level | Permissions                                         |
| ------------- | ----- | --------------------------------------------------- |
| **Admin**     | 5     | Full organization control, user management, billing |
| **Manager**   | 4     | Project management, team oversight, invitations     |
| **Developer** | 3     | Project work, issue management, code access         |
| **Designer**  | 3     | Design assets, UI/UX work, design reviews           |
| **QA**        | 3     | Testing, quality assurance, bug reporting           |
| **Viewer**    | 1     | Read-only access to assigned projects               |

### ✅ Security Features

- **Row Level Security (RLS)**: Complete data isolation between organizations
- **Permission System**: Granular permission checking
- **Invitation Tokens**: Secure, time-limited invitation system
- **Middleware Protection**: Route-level access control

## 📱 User Flows

### New User Journey

1. **Sign Up** → OAuth/Email authentication
2. **Profile Creation** → Automatic user profile creation
3. **Organization Check** → Middleware checks for organizations
4. **Organization Creation** → Onboarding flow for new users
5. **Admin Setup** → First user becomes admin
6. **Dashboard Access** → Organization-specific dashboard

### Existing User Journey

1. **Sign In** → Authentication
2. **Organization Check** → Load user's organizations
3. **Organization Selection** → Choose active organization
4. **Dashboard Access** → Role-based dashboard

### Invitation Flow

1. **Admin/Manager** → Sends invitation with role
2. **Email Invitation** → User receives invitation link
3. **Acceptance** → User accepts and joins organization
4. **Role Assignment** → User gets assigned role
5. **Dashboard Access** → Role-appropriate access

## 🛠️ API Endpoints

### Organization Management

- `GET /api/organizations` - Get user's organizations
- `POST /api/organizations` - Create new organization
- `GET /api/organizations/[id]/members` - Get organization members
- `POST /api/organizations/[id]/invite` - Invite user to organization

### Invitation Management

- `GET /invite/[token]` - Invitation acceptance page
- `POST /api/invitations/[token]/accept` - Accept invitation

## 🔒 Security Considerations

### Row Level Security Policies

- Users can only see data from their organizations
- Admins can only manage their own organizations
- Invitations are scoped to specific organizations
- All data is completely isolated between organizations

### Permission System

- Role-based permission checking
- UI components respect permissions
- API endpoints validate permissions
- Middleware enforces organization access

## 🧪 Testing the System

### 1. Create a New User

1. Go to `/auth`
2. Sign up with OAuth or email
3. You'll be redirected to `/onboarding`
4. Create an organization
5. You'll be redirected to `/dashboard` as admin

### 2. Test Invitations

1. Go to `/dashboard/settings`
2. Invite a user with a specific role
3. Check the invitation email
4. Click the invitation link
5. Sign in/up to accept
6. Verify role assignment

### 3. Test Multi-Organization

1. Create a second organization
2. Invite the first user to the second organization
3. Test organization switching
4. Verify role-based access

## 🚧 Future Enhancements

### Planned Features

- **Project Management**: Full project and issue tracking
- **Team Management**: Advanced member management
- **Billing Integration**: Organization-level billing
- **Audit Logs**: Track all organization activities
- **API Keys**: Organization-specific API access
- **Webhooks**: Real-time organization events

### Advanced Permissions

- **Custom Roles**: Organization-specific role definitions
- **Resource Permissions**: Granular project-level permissions
- **Time-based Access**: Temporary role assignments
- **Approval Workflows**: Multi-step invitation processes

## 🐛 Troubleshooting

### Common Issues

1. **"No Organization Found"**

   - User needs to create an organization
   - Check if user profile was created properly

2. **"Access Denied"**

   - User doesn't have required permissions
   - Check role assignment and permission configuration

3. **"Invalid Invitation"**

   - Invitation token expired or invalid
   - Check invitation status in database

4. **Database Errors**
   - Verify RLS policies are enabled
   - Check if all tables were created properly
   - Ensure user has proper permissions

### Debug Mode

- Check browser console for client-side errors
- Check Supabase logs for database errors
- Verify environment variables are set correctly
- Test with different user roles

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [OAuth Providers](https://supabase.com/docs/guides/auth/social-login)

## 🤝 Contributing

When adding new features:

1. **Update Types**: Add new types to `organization.ts`
2. **Update Services**: Add new methods to `organization.ts`
3. **Update Context**: Add new context methods if needed
4. **Update Permissions**: Add new permissions to the system
5. **Update Database**: Add new tables/columns as needed
6. **Test Thoroughly**: Test with different roles and scenarios

## 📄 License

This organization system is part of the BREEQA project and follows the same license terms.
