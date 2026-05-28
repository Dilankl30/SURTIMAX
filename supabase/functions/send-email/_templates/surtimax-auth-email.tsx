import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';

interface SurtimaxAuthEmailProps {
  appUrl: string;
  confirmationUrl: string;
  emailActionType: string;
  token: string;
}

const contentByAction: Record<string, { preview: string; title: string; body: string; cta: string }> = {
  signup: {
    preview: 'Confirma tu correo para activar tu cuenta SURTIMAX',
    title: 'Confirma tu cuenta SURTIMAX',
    body: 'Gracias por registrarte. Confirma tu correo o copia el código temporal para completar tu acceso.',
    cta: 'Confirmar correo',
  },
  magiclink: {
    preview: 'Tu enlace y código de acceso SURTIMAX',
    title: 'Ingresa a SURTIMAX',
    body: 'Usa este enlace seguro o copia el código temporal en la app para iniciar sesión.',
    cta: 'Ingresar a SURTIMAX',
  },
  recovery: {
    preview: 'Recupera el acceso a tu cuenta SURTIMAX',
    title: 'Recupera tu contraseña',
    body: 'Recibimos una solicitud para recuperar tu cuenta. Usa el enlace seguro o el código temporal.',
    cta: 'Recuperar acceso',
  },
  invite: {
    preview: 'Te invitaron a SURTIMAX',
    title: 'Acepta tu invitación',
    body: 'Te invitaron a SURTIMAX. Confirma tu correo para completar el acceso.',
    cta: 'Aceptar invitación',
  },
  email_change: {
    preview: 'Confirma el cambio de correo en SURTIMAX',
    title: 'Confirma tu nuevo correo',
    body: 'Usa este enlace seguro o el código temporal para confirmar el cambio de correo.',
    cta: 'Confirmar cambio',
  },
};

export function SurtimaxAuthEmail({
  appUrl,
  confirmationUrl,
  emailActionType,
  token,
}: SurtimaxAuthEmailProps) {
  const content = contentByAction[emailActionType] ?? contentByAction.magiclink;

  return (
    <Html>
      <Head />
      <Preview>{content.preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={brand}>SURTIMAX</Text>
          <Heading style={heading}>{content.title}</Heading>
          <Text style={paragraph}>{content.body}</Text>

          <Section style={buttonSection}>
            <Button href={confirmationUrl} style={button}>
              {content.cta}
            </Button>
          </Section>

          <Text style={paragraph}>También puedes copiar este código temporal en la app:</Text>
          <Text style={code}>{token}</Text>

          <Text style={muted}>Si no solicitaste este correo, puedes ignorarlo con seguridad.</Text>
          <Text style={footer}>
            <Link href={appUrl} style={footerLink}>
              Abrir SURTIMAX
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default SurtimaxAuthEmail;

const main = {
  backgroundColor: '#EEF6FF',
  margin: 0,
  padding: '32px 12px',
};

const container = {
  backgroundColor: '#FFFFFF',
  border: '1px solid #D9EAFB',
  borderRadius: '18px',
  boxShadow: '0 12px 32px rgba(13, 71, 161, 0.12)',
  margin: '0 auto',
  maxWidth: '560px',
  padding: '36px 28px',
};

const brand = {
  color: '#0D47A1',
  fontFamily: 'Arial, sans-serif',
  fontSize: '28px',
  fontWeight: 800,
  letterSpacing: '0.08em',
  margin: '0 0 18px',
  textAlign: 'center' as const,
};

const heading = {
  color: '#102A43',
  fontFamily: 'Arial, sans-serif',
  fontSize: '26px',
  fontWeight: 800,
  lineHeight: '32px',
  margin: '0 0 16px',
  textAlign: 'center' as const,
};

const paragraph = {
  color: '#334E68',
  fontFamily: 'Arial, sans-serif',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0 0 18px',
};

const buttonSection = {
  margin: '28px 0',
  textAlign: 'center' as const,
};

const button = {
  backgroundColor: '#1976D2',
  borderRadius: '12px',
  color: '#FFFFFF',
  display: 'inline-block',
  fontFamily: 'Arial, sans-serif',
  fontSize: '15px',
  fontWeight: 700,
  padding: '14px 22px',
  textDecoration: 'none',
};

const code = {
  backgroundColor: '#E3F2FD',
  border: '1px solid #BBDEFB',
  borderRadius: '14px',
  color: '#0D47A1',
  display: 'block',
  fontFamily: 'Arial, sans-serif',
  fontSize: '32px',
  fontWeight: 800,
  letterSpacing: '0.18em',
  margin: '10px 0 24px',
  padding: '22px 12px',
  textAlign: 'center' as const,
};

const muted = {
  color: '#718096',
  fontFamily: 'Arial, sans-serif',
  fontSize: '13px',
  lineHeight: '20px',
  margin: '0 0 20px',
};

const footer = {
  borderTop: '1px solid #E6F0FA',
  fontFamily: 'Arial, sans-serif',
  fontSize: '12px',
  margin: '20px 0 0',
  paddingTop: '18px',
  textAlign: 'center' as const,
};

const footerLink = {
  color: '#1976D2',
  textDecoration: 'underline',
};
