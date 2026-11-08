import { 
  verifyAdminCredentials, 
  createSessionToken, 
  validateSessionToken, 
  invalidateSessionToken, 
  requestSecureOtp, 
  verifySecureOtp 
} from '../../src/server/securityService';
import { dbService } from '../../src/server/dbService';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Content-Type': 'application/json; charset=utf-8'
};

export const handler = async (event: any) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: CORS_HEADERS,
      body: ''
    };
  }

  const path = event.path.replace(/^\/\.netlify\/functions\/api/, '').replace(/^\/api/, '') || '/';
  const method = event.httpMethod;

  try {
    const body = event.body ? JSON.parse(event.body) : {};

    // 1. Admin Authentication
    if (path === '/admin/login' && method === 'POST') {
      const { loginId, passkey } = body;
      const verifyRes = verifyAdminCredentials(loginId, passkey);
      if (!verifyRes.success) {
        return {
          statusCode: 401,
          headers: CORS_HEADERS,
          body: JSON.stringify({ success: false, error: verifyRes.error })
        };
      }
      const token = createSessionToken('admin-aftab', 'admin');
      return {
        statusCode: 200,
        headers: {
          ...CORS_HEADERS,
          'Set-Cookie': `uposn_session=${token}; HttpOnly; Path=/; SameSite=Strict; Max-Age=86400`
        },
        body: JSON.stringify({
          success: true,
          token,
          user: {
            id: 'admin-aftab',
            name: 'आफताब मोहम्मद (Admin)',
            email: 'aftab.mohd9@gmail.com',
            role: 'admin',
            isAdmin: true
          }
        })
      };
    }

    if (path === '/admin/verify' && method === 'GET') {
      const authHeader = event.headers.authorization || event.headers.Authorization || '';
      const token = authHeader.replace(/^Bearer\s+/i, '');
      const session = validateSessionToken(token);
      if (!session.valid || session.role !== 'admin') {
        return {
          statusCode: 401,
          headers: CORS_HEADERS,
          body: JSON.stringify({ valid: false, error: 'Unauthorized or expired session' })
        };
      }
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          valid: true,
          user: {
            id: 'admin-aftab',
            name: 'आफताब मोहम्मद (Admin)',
            email: 'aftab.mohd9@gmail.com',
            role: 'admin',
            isAdmin: true
          }
        })
      };
    }

    if (path === '/admin/logout' && method === 'POST') {
      const authHeader = event.headers.authorization || event.headers.Authorization || '';
      const token = authHeader.replace(/^Bearer\s+/i, '');
      invalidateSessionToken(token);
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ success: true })
      };
    }

    // 2. Secure OTP Endpoints
    if (path === '/request-otp' && method === 'POST') {
      const { mobile } = body;
      const res = requestSecureOtp(mobile || '');
      return {
        statusCode: res.success ? 200 : 400,
        headers: CORS_HEADERS,
        body: JSON.stringify(res)
      };
    }

    if (path === '/verify-otp' && method === 'POST') {
      const { mobile, otp } = body;
      const res = verifySecureOtp(mobile || '', otp || '');
      return {
        statusCode: res.success ? 200 : 400,
        headers: CORS_HEADERS,
        body: JSON.stringify(res)
      };
    }

    // 3. Contact Form Submission
    if (path === '/contact' && method === 'POST') {
      const { name, email, phone, subject, message, honeypot } = body;
      if (honeypot) {
        // Anti-spam bot trap
        return {
          statusCode: 200,
          headers: CORS_HEADERS,
          body: JSON.stringify({ success: true })
        };
      }
      if (!name || !email || !message) {
        return {
          statusCode: 400,
          headers: CORS_HEADERS,
          body: JSON.stringify({ success: false, error: 'कृपया नाम, ईमेल और संदेश अवश्य भरें।' })
        };
      }
      const record = dbService.saveContact({ name, email, phone, subject: subject || 'सामान्य पूछताछ', message });
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ success: true, id: record.id })
      };
    }

    // 4. Public Content Read APIs
    if (path === '/content/news' && method === 'GET') {
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify(dbService.getNews())
      };
    }

    if (path === '/content/orders' && method === 'GET') {
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify(dbService.getOrders())
      };
    }

    if (path === '/content/community' && method === 'GET') {
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify(dbService.getCommunityPosts())
      };
    }

    if (path === '/content/community' && method === 'POST') {
      const { authorId, authorName, authorDistrict, authorDepartment, category, content } = body;
      if (!authorName || !content || !content.trim()) {
        return {
          statusCode: 400,
          headers: CORS_HEADERS,
          body: JSON.stringify({ success: false, error: 'संदेश सामग्री रिक्त नहीं हो सकती।' })
        };
      }
      const created = dbService.createCommunityPost({
        authorId: authorId || 'anon',
        authorName,
        authorDistrict: authorDistrict || 'उत्तर प्रदेश',
        authorDepartment: authorDepartment || 'समस्त विभाग',
        category: category || 'सामान्य',
        content
      });
      return {
        statusCode: 201,
        headers: CORS_HEADERS,
        body: JSON.stringify({ success: true, post: created })
      };
    }

    if (path === '/content/community/report' && method === 'POST') {
      const { postId } = body;
      const ok = dbService.reportCommunityPost(postId || '');
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ success: ok })
      };
    }

    return {
      statusCode: 404,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: `Not Found: ${method} ${path}` })
    };
  } catch (err: any) {
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: err?.message || 'Internal Server Error' })
    };
  }
};
