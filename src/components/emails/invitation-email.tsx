import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface InvitationEmailProps {
  organizationName: string;
  inviterName: string;
  role: string;
  invitationUrl: string;
  expiresAt: string;
}

export const InvitationEmail = ({
  organizationName,
  inviterName,
  role,
  invitationUrl,
  expiresAt,
}: InvitationEmailProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatRole = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  return (
    <Html>
      <Head />
      <Preview>
        You're invited to join {organizationName} as a {formatRole(role)}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoContainer}>
            <Text style={logo}>Breeqa</Text>
          </Section>

          <Heading style={h1}>
            You're invited to join {organizationName}
          </Heading>

          <Text style={text}>
            <strong>{inviterName}</strong> has invited you to join{" "}
            <strong>{organizationName}</strong> as a{" "}
            <strong>{formatRole(role)}</strong>.
          </Text>

          <Text style={text}>
            Click the button below to accept your invitation and get started:
          </Text>

          <Section style={buttonContainer}>
            <Link style={button} href={invitationUrl}>
              Accept Invitation
            </Link>
          </Section>

          <Text style={text}>
            Or copy and paste this URL into your browser:
          </Text>
          <Text style={link}>{invitationUrl}</Text>

          <Text style={text}>
            <strong>Important:</strong> This invitation will expire on{" "}
            {formatDate(expiresAt)}. If you don't accept it by then, you'll need
            to request a new invitation.
          </Text>

          <Text style={text}>
            If you didn't expect this invitation, you can safely ignore this
            email.
          </Text>

          <Section style={footer}>
            <Text style={footerText}>
              This invitation was sent by {inviterName} from {organizationName}.
            </Text>
            <Text style={footerText}>
              If you have any questions, please contact your team administrator.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
};

const logoContainer = {
  textAlign: "center" as const,
  marginBottom: "32px",
};

const logo = {
  fontSize: "24px",
  fontWeight: "bold",
  color: "#1f2937",
  margin: "0",
};

const h1 = {
  color: "#1f2937",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "40px 0",
  padding: "0",
  textAlign: "center" as const,
};

const text = {
  color: "#374151",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "16px 0",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#3b82f6",
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 24px",
  margin: "0",
};

const link = {
  color: "#3b82f6",
  fontSize: "14px",
  textDecoration: "underline",
  wordBreak: "break-all" as const,
  margin: "16px 0",
};

const footer = {
  borderTop: "1px solid #e5e7eb",
  marginTop: "32px",
  paddingTop: "24px",
};

const footerText = {
  color: "#6b7280",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "8px 0",
};

export default InvitationEmail;
