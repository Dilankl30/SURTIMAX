import React from 'npm:react@18.3.1';
import { renderAsync } from 'npm:@react-email/components@0.0.22';
import { Resend } from 'npm:resend@4.0.0';
import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0';
import { SurtimaxAuthEmail } from './_templates/surtimax-auth-email.tsx';

interface SendEmailHookPayload {
  user: {
    email?: string;
    new_email?: string;
  };
  email_data: {
    token: string;
    token_hash: string;
    redirect_to: string;
    email_action_type: string;
    token_new?: string;
    token_hash_new?: string;
  };
}

const resendApiKey = Deno.env.get('RESEND_API_KEY');
const rawHookSecret = Deno.env.get('SEND_EMAIL_HOOK_SECRET') ?? '';
const hookSecret = rawHookSecret.replace('v1,whsec_', '');
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const appUrl = Deno.env.get('APP_URL') ?? 'https://surtimax.com';
const emailFrom = Deno.env.get('AUTH_EMAIL_FROM') ?? 'SURTIMAX <onboarding@resend.dev>';

const resend = new Resend(resendApiKey);

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function buildConfirmationUrl(tokenHash: string, emailActionType: string, redirectTo: string) {
  const verifyUrl = new URL('/auth/v1/verify', supabaseUrl);
  verifyUrl.searchParams.set('token', tokenHash);
  verifyUrl.searchParams.set('type', emailActionType);
  verifyUrl.searchParams.set('redirect_to', redirectTo || appUrl);
  return verifyUrl.toString();
}

async function sendAuthEmail({
  email,
  emailActionType,
  token,
  tokenHash,
  redirectTo,
}: {
  email: string;
  emailActionType: string;
  token: string;
  tokenHash: string;
  redirectTo: string;
}) {
  const confirmationUrl = buildConfirmationUrl(tokenHash, emailActionType, redirectTo);
  const html = await renderAsync(
    React.createElement(SurtimaxAuthEmail, {
      appUrl,
      confirmationUrl,
      emailActionType,
      token,
    }),
  );

  const { error } = await resend.emails.send({
    from: emailFrom,
    to: [email],
    subject: 'Tu código de acceso SURTIMAX',
    html,
  });

  if (error) throw error;
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('not allowed', { status: 400 });
  }

  if (!resendApiKey || !hookSecret || !supabaseUrl) {
    return jsonResponse({ error: 'Faltan RESEND_API_KEY, SEND_EMAIL_HOOK_SECRET o SUPABASE_URL.' }, 500);
  }

  try {
    const payload = await req.text();
    const headers = Object.fromEntries(req.headers);
    const webhook = new Webhook(hookSecret);
    const { user, email_data } = webhook.verify(payload, headers) as SendEmailHookPayload;

    const {
      token,
      token_hash,
      token_new,
      token_hash_new,
      redirect_to,
      email_action_type,
    } = email_data;

    if (email_action_type === 'email_change' && token_new && token_hash_new && user.email && user.new_email) {
      await Promise.all([
        sendAuthEmail({
          email: user.email,
          emailActionType: email_action_type,
          token,
          tokenHash: token_hash_new,
          redirectTo: redirect_to,
        }),
        sendAuthEmail({
          email: user.new_email,
          emailActionType: email_action_type,
          token: token_new,
          tokenHash: token_hash,
          redirectTo: redirect_to,
        }),
      ]);
    } else {
      const email = user.new_email || user.email;
      if (!email) throw new Error('El payload del hook no incluye correo de destino.');

      await sendAuthEmail({
        email,
        emailActionType: email_action_type,
        token: token_new || token,
        tokenHash: token_hash,
        redirectTo: redirect_to,
      });
    }

    return jsonResponse({});
  } catch (error) {
    console.error(error);
    return jsonResponse(
      {
        error: {
          message: error instanceof Error ? error.message : 'No se pudo enviar el correo de autenticación.',
        },
      },
      401,
    );
  }
});
