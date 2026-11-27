import {
  handleAdminLogin,
  handleAdminSetup,
  handleAdminStatus,
  handleAdminVerify,
  handleAuthLogin,
  handleAuthOtpLogin,
  handleAuthProfileUpdate,
  handleAuthRegister,
  handleAuthResetPassword,
  handleAuthVerify,
  handleEmailOtpRequest,
  handleEmailOtpVerify,
  handleLogout,
  handleRequestOtp,
  handleSupabaseSessionSync,
  handleVerifyOtp,
  AuthRouteResponse
} from '../../src/server/authHandlers';
import {
  handleAdminContentSync,
  handleAdminSupabaseSeed,
  handleAdminSupabaseStatus,
  handleContentBootstrap,
  handleCreateCommunityPost,
  handleGetCommunity,
  handleGetNews,
  handleGetOrders,
  handleReportCommunityPost
} from '../../src/server/contentHandlers';
import { dbService } from '../../src/server/dbService';
import { supabaseService } from '../../src/server/supabaseService';

function buildResponseHeaders(event: any): Record<string, string> {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json; charset=utf-8',
    'X-Robots-Tag': 'noindex, nofollow'
  };

  const origin = event.headers?.origin || event.headers?.Origin || '';
  const host = (event.headers?.['x-forwarded-host'] || event.headers?.host || event.headers?.Host || '')
    .split(',')[0]
    .trim()
    .toLowerCase();

  if (origin) {
    try {
      const originHost = new URL(origin).host.toLowerCase();
      if (originHost === host || originHost === 'upcos.netlify.app') {
        headers['Access-Control-Allow-Origin'] = origin;
        headers['Access-Control-Allow-Credentials'] = 'true';
        headers['Vary'] = 'Origin';
      }
    } catch {
      // Ignore malformed Origin header
    }
  }

  return headers;
}

function formatAuthResponse(baseHeaders: Record<string, string>, result: AuthRouteResponse) {
  const headers = { ...baseHeaders };
  if (result.cookie) {
    headers['Set-Cookie'] = result.cookie;
  }
  return {
    statusCode: result.status,
    headers,
    body: JSON.stringify(result.body)
  };
}

export const handler = async (event: any) => {
  const baseHeaders = buildResponseHeaders(event);

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: baseHeaders,
      body: ''
    };
  }

  const path = event.path.replace(/^\/\.netlify\/functions\/api/, '').replace(/^\/api/, '') || '/';
  const method = event.httpMethod;
  const xfProto = (event.headers?.['x-forwarded-proto'] || 'https').split(',')[0].trim().toLowerCase();
  const isHttps = xfProto === 'https';

  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const authReq = {
      body,
      headers: (event.headers || {}) as Record<string, string | string[] | undefined>,
      isHttps
    };

    // 1. Admin Authentication
    if (path === '/admin/status' && method === 'GET') {
      return formatAuthResponse(baseHeaders, await handleAdminStatus());
    }
    if (path === '/admin/setup' && method === 'POST') {
      return formatAuthResponse(baseHeaders, await handleAdminSetup(authReq));
    }
    if (path === '/admin/login' && method === 'POST') {
      return formatAuthResponse(baseHeaders, await handleAdminLogin(authReq));
    }
    if (path === '/admin/verify' && method === 'GET') {
      return formatAuthResponse(baseHeaders, handleAdminVerify(authReq));
    }
    if (path === '/admin/logout' && method === 'POST') {
      return formatAuthResponse(baseHeaders, handleLogout(authReq));
    }

    // 2. Employee User Authentication
    if (path === '/auth/verify' && method === 'GET') {
      return formatAuthResponse(baseHeaders, await handleAuthVerify(authReq));
    }
    if (path === '/auth/register' && method === 'POST') {
      return formatAuthResponse(baseHeaders, await handleAuthRegister(authReq));
    }
    if (path === '/auth/login' && method === 'POST') {
      return formatAuthResponse(baseHeaders, await handleAuthLogin(authReq));
    }
    if (path === '/auth/otp-login' && method === 'POST') {
      return formatAuthResponse(baseHeaders, await handleAuthOtpLogin(authReq));
    }
    if (path === '/auth/email-otp/request' && method === 'POST') {
      return formatAuthResponse(baseHeaders, await handleEmailOtpRequest(authReq));
    }
    if (path === '/auth/email-otp/verify' && method === 'POST') {
      return formatAuthResponse(baseHeaders, await handleEmailOtpVerify(authReq));
    }
    if (path === '/auth/supabase-session' && method === 'POST') {
      return formatAuthResponse(baseHeaders, await handleSupabaseSessionSync(authReq));
    }
    if (path === '/auth/reset-password' && method === 'POST') {
      return formatAuthResponse(baseHeaders, await handleAuthResetPassword(authReq));
    }
    if (path === '/auth/profile' && method === 'POST') {
      return formatAuthResponse(baseHeaders, await handleAuthProfileUpdate(authReq));
    }
    if (path === '/auth/logout' && method === 'POST') {
      return formatAuthResponse(baseHeaders, handleLogout(authReq));
    }

    // 3. Secure OTP Endpoints
    if (path === '/request-otp' && method === 'POST') {
      return formatAuthResponse(baseHeaders, await handleRequestOtp(authReq));
    }
    if (path === '/verify-otp' && method === 'POST') {
      return formatAuthResponse(baseHeaders, handleVerifyOtp(authReq));
    }

    // 4. Contact Form Submission
    if (path === '/contact' && method === 'POST') {
      const { name, email, phone, subject, message, honeypot } = body;
      if (honeypot) {
        return {
          statusCode: 200,
          headers: baseHeaders,
          body: JSON.stringify({ success: true })
        };
      }
      if (!name || !email || !message) {
        return {
          statusCode: 400,
          headers: baseHeaders,
          body: JSON.stringify({ success: false, error: 'कृपया नाम, ईमेल और संदेश अवश्य भरें।' })
        };
      }
      const record = dbService.saveContact({ name, email, phone, subject: subject || 'सामान्य पूछताछ', message });
      if (supabaseService.isConfigured()) {
        await supabaseService.saveContact(record);
      }
      return {
        statusCode: 200,
        headers: baseHeaders,
        body: JSON.stringify({ success: true, id: record.id })
      };
    }

    // 5. Public Content & Supabase Database APIs
    if (path === '/content/bootstrap' && method === 'GET') {
      return formatAuthResponse(baseHeaders, await handleContentBootstrap());
    }

    if (path === '/content/news' && method === 'GET') {
      return formatAuthResponse(baseHeaders, await handleGetNews());
    }

    if (path === '/content/orders' && method === 'GET') {
      return formatAuthResponse(baseHeaders, await handleGetOrders());
    }

    if (path === '/content/community' && method === 'GET') {
      return formatAuthResponse(baseHeaders, await handleGetCommunity());
    }

    if (path === '/content/community' && method === 'POST') {
      return formatAuthResponse(baseHeaders, await handleCreateCommunityPost(authReq));
    }

    if (path === '/content/community/report' && method === 'POST') {
      return formatAuthResponse(baseHeaders, await handleReportCommunityPost(authReq));
    }

    // 6. Admin Supabase Database Setup & Content Sync
    if (path === '/admin/supabase-status' && method === 'GET') {
      return formatAuthResponse(baseHeaders, await handleAdminSupabaseStatus(authReq));
    }

    if (path === '/admin/content/sync' && method === 'POST') {
      return formatAuthResponse(baseHeaders, await handleAdminContentSync(authReq));
    }

    if (path === '/admin/supabase-seed' && method === 'POST') {
      return formatAuthResponse(baseHeaders, await handleAdminSupabaseSeed(authReq));
    }

    return {
      statusCode: 404,
      headers: baseHeaders,
      body: JSON.stringify({ error: `Not Found: ${method} ${path}` })
    };
  } catch (err: any) {
    return {
      statusCode: 500,
      headers: baseHeaders,
      body: JSON.stringify({ error: err?.message || 'Internal Server Error' })
    };
  }
};
