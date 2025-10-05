# Email Service Setup Guide

This guide will help you set up Resend email service for team invitations.

## 🚀 Quick Setup

### 1. Create Resend Account

1. Go to [resend.com](https://resend.com)
2. Sign up for a free account
3. Verify your email address

### 2. Get API Key

1. Go to [API Keys](https://resend.com/api-keys) in your Resend dashboard
2. Click "Create API Key"
3. Name it "Breeqa Production" (or similar)
4. Copy the API key

### 3. Set Up Domain (Optional for Development)

For development, you can use Resend's default domain. For production:

1. Go to [Domains](https://resend.com/domains) in your Resend dashboard
2. Add your domain (e.g., `yourdomain.com`)
3. Follow the DNS setup instructions
4. Verify your domain

### 4. Environment Variables

Add these to your `.env.local` file:

```env
# Resend Email Configuration (Server-side)
RESEND_API_KEY=re_your_api_key_here
RESEND_DOMAIN=yourdomain.com

# Site URL (for invitation links)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 📧 Email Templates

The invitation email template is located at:

- `src/components/emails/invitation-email.tsx`

### Customizing the Email Template

You can customize the email template by editing the React component:

1. **Colors and Styling**: Modify the style objects at the bottom of the file
2. **Content**: Update the JSX content
3. **Branding**: Add your logo and company information

### Email Preview

To preview emails in development, you can use the email preview route:

- `/api/email-preview/invitation` - Preview invitation email

## 🧪 Testing

### Test Email Function

Use the test email function to verify your setup:

```typescript
import { emailService } from "@/lib/services/email-service";

// Test email delivery
const result = await emailService.sendTestEmail("your-email@example.com");
console.log(result);
```

### Development Mode

In development, emails are sent to your configured email address. Check your Resend dashboard for delivery status.

## 🔧 Troubleshooting

### Common Issues

1. **"RESEND_API_KEY environment variable is required"**
   - Make sure you've added `RESEND_API_KEY` to your `.env.local` file
   - Restart your development server after adding the environment variable

2. **"Invalid API key"**
   - Verify your API key is correct
   - Make sure there are no extra spaces or characters

3. **"Domain not verified"**
   - For production, make sure your domain is verified in Resend
   - For development, you can use the default Resend domain

4. **Emails not being delivered**
   - Check your Resend dashboard for delivery status
   - Check spam folder
   - Verify the recipient email address is valid

### Debug Mode

Enable debug logging by adding this to your environment:

```env
DEBUG=resend:*
```

## 📊 Monitoring

### Resend Dashboard

- View email delivery statistics
- Monitor bounce rates
- Check delivery logs

### Application Logs

- Email sending errors are logged to the console
- Check browser console and server logs for issues

## 🚀 Production Deployment

### Environment Variables

Make sure to set these in your production environment:

```env
RESEND_API_KEY=re_your_production_api_key
RESEND_DOMAIN=yourdomain.com
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

### Domain Setup

1. Add your production domain to Resend
2. Set up DNS records as instructed
3. Verify domain ownership
4. Update `RESEND_DOMAIN` environment variable

## 💰 Pricing

- **Free Tier**: 3,000 emails/month
- **Paid Plans**: Starting at $20/month for 50,000 emails
- **Pay-as-you-scale**: $0.40 per 1,000 additional emails

## 📚 Resources

- [Resend Documentation](https://resend.com/docs)
- [React Email Documentation](https://react.email/docs)
- [Resend API Reference](https://resend.com/docs/api-reference)
