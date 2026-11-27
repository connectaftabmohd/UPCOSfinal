/**
 * Shared Server Website Content & Supabase Database Handlers
 * Used identically by Express (server.ts) and Netlify Functions (netlify/functions/api.ts).
 */

import { dbService } from './dbService';
import { supabaseService } from './supabaseService';
import {
  extractSessionToken,
  isRequestOriginAllowed,
  validateSessionToken
} from './securityService';
import type { AuthRouteRequest, AuthRouteResponse } from './authHandlers';

function requireAdminSession(req: AuthRouteRequest): AuthRouteResponse | null {
  const token = extractSessionToken(req.headers);
  const session = validateSessionToken(token);
  if (!session.valid || session.role !== 'admin') {
    return {
      status: 401,
      body: { success: false, error: 'प्रशासक प्रमाणीकरण आवश्यक है (Admin Unauthorized)।' }
    };
  }
  return null;
}

export async function handleContentBootstrap(): Promise<AuthRouteResponse> {
  const localNews = dbService.getNews();
  const localOrders = dbService.getOrders();
  const localDepartments = dbService.getDepartments();
  const localFaqs = dbService.getFaqs();
  const localTicker = dbService.getTickerItems();

  if (!supabaseService.isConfigured()) {
    return {
      status: 200,
      body: {
        source: 'local',
        news: localNews,
        orders: localOrders,
        departments: localDepartments,
        faqs: localFaqs,
        ticker: localTicker
      }
    };
  }

  const [sbNews, sbOrders, sbDepts, sbFaqs, sbTicker] = await Promise.all([
    supabaseService.getNews(),
    supabaseService.getOrders(),
    supabaseService.getDepartments(),
    supabaseService.getFaqs(),
    supabaseService.getTickerItems()
  ]);

  let source: 'supabase' | 'local' = 'local';

  // Auto-seed Supabase tables if they exist (non-null) and are empty
  let finalNews = localNews;
  if (sbNews !== null) {
    source = 'supabase';
    if (sbNews.length > 0) {
      finalNews = sbNews;
    } else if (localNews.length > 0) {
      await supabaseService.syncNews(localNews);
    }
  }

  let finalOrders = localOrders;
  if (sbOrders !== null) {
    source = 'supabase';
    if (sbOrders.length > 0) {
      finalOrders = sbOrders;
    } else if (localOrders.length > 0) {
      await supabaseService.syncOrders(localOrders);
    }
  }

  let finalDepts = localDepartments;
  if (sbDepts !== null) {
    source = 'supabase';
    if (sbDepts.length > 0) {
      finalDepts = sbDepts;
    } else if (localDepartments.length > 0) {
      await supabaseService.syncDepartments(localDepartments);
    }
  }

  let finalFaqs = localFaqs;
  if (sbFaqs !== null) {
    source = 'supabase';
    if (sbFaqs.length > 0) {
      finalFaqs = sbFaqs;
    } else if (localFaqs.length > 0) {
      await supabaseService.syncFaqs(localFaqs);
    }
  }

  let finalTicker = localTicker;
  if (sbTicker !== null && sbTicker.length > 0) {
    source = 'supabase';
    finalTicker = sbTicker;
  } else if (source === 'supabase' && localTicker.length > 0) {
    await supabaseService.syncTickerItems(localTicker);
  }

  return {
    status: 200,
    body: {
      source,
      news: finalNews,
      orders: finalOrders,
      departments: finalDepts,
      faqs: finalFaqs,
      ticker: finalTicker
    }
  };
}

export async function handleGetNews(): Promise<AuthRouteResponse> {
  if (supabaseService.isConfigured()) {
    const remote = await supabaseService.getNews();
    if (remote && remote.length > 0) {
      return { status: 200, body: remote as unknown as Record<string, any> };
    }
  }
  return { status: 200, body: dbService.getNews() as unknown as Record<string, any> };
}

export async function handleGetOrders(): Promise<AuthRouteResponse> {
  if (supabaseService.isConfigured()) {
    const remote = await supabaseService.getOrders();
    if (remote && remote.length > 0) {
      return { status: 200, body: remote as unknown as Record<string, any> };
    }
  }
  return { status: 200, body: dbService.getOrders() as unknown as Record<string, any> };
}

export async function handleGetCommunity(): Promise<AuthRouteResponse> {
  if (supabaseService.isConfigured()) {
    const remote = await supabaseService.getCommunityPosts();
    if (remote && remote.length > 0) {
      return { status: 200, body: remote as unknown as Record<string, any> };
    }
  }
  return { status: 200, body: dbService.getCommunityPosts() as unknown as Record<string, any> };
}

export async function handleCreateCommunityPost(req: AuthRouteRequest): Promise<AuthRouteResponse> {
  if (!isRequestOriginAllowed(req.headers)) {
    return { status: 403, body: { success: false, error: 'Forbidden origin' } };
  }
  const { authorId, authorName, authorDistrict, authorDepartment, category, content } = req.body || {};
  if (typeof authorName !== 'string' || !authorName.trim() || typeof content !== 'string' || !content.trim()) {
    return { status: 400, body: { success: false, error: 'संदेश सामग्री रिक्त नहीं हो सकती।' } };
  }

  const created = dbService.createCommunityPost({
    authorId: typeof authorId === 'string' && authorId.trim() ? authorId.trim() : 'anon',
    authorName: authorName.trim().slice(0, 120),
    authorDistrict: typeof authorDistrict === 'string' && authorDistrict.trim() ? authorDistrict.trim() : 'उत्तर प्रदेश',
    authorDepartment:
      typeof authorDepartment === 'string' && authorDepartment.trim() ? authorDepartment.trim() : 'समस्त विभाग',
    category: typeof category === 'string' && category.trim() ? category.trim() : 'सामान्य',
    content: content.trim().slice(0, 4000)
  });

  if (supabaseService.isConfigured()) {
    await supabaseService.createCommunityPost(created);
  }

  return { status: 201, body: { success: true, post: created } };
}

export async function handleReportCommunityPost(req: AuthRouteRequest): Promise<AuthRouteResponse> {
  if (!isRequestOriginAllowed(req.headers)) {
    return { status: 403, body: { success: false, error: 'Forbidden origin' } };
  }
  const postId = typeof req.body?.postId === 'string' ? req.body.postId.trim() : '';
  const localOk = dbService.reportCommunityPost(postId);
  let remoteOk = false;
  if (supabaseService.isConfigured()) {
    remoteOk = await supabaseService.reportCommunityPost(postId);
  }
  return { status: 200, body: { success: localOk || remoteOk } };
}

export async function handleAdminSupabaseStatus(req: AuthRouteRequest): Promise<AuthRouteResponse> {
  const authErr = requireAdminSession(req);
  if (authErr) return authErr;

  const status = await supabaseService.getWebsiteDatabaseStatus();
  return {
    status: 200,
    body: {
      success: true,
      ...status
    }
  };
}

export async function handleAdminContentSync(req: AuthRouteRequest): Promise<AuthRouteResponse> {
  if (!isRequestOriginAllowed(req.headers)) {
    return { status: 403, body: { success: false, error: 'Forbidden origin' } };
  }
  const authErr = requireAdminSession(req);
  if (authErr) return authErr;

  const { news, orders, departments, faqs, ticker } = req.body || {};

  if (Array.isArray(news)) dbService.replaceAllNews(news);
  if (Array.isArray(orders)) dbService.replaceAllOrders(orders);
  if (Array.isArray(departments)) dbService.saveDepartments(departments);
  if (Array.isArray(faqs)) dbService.saveFaqs(faqs);
  if (Array.isArray(ticker)) dbService.saveTickerItems(ticker);

  let supabaseSynced: Record<string, number> = {};
  let supabaseSuccess = false;

  if (supabaseService.isConfigured()) {
    const syncRes = await supabaseService.syncAllWebsiteData({
      news: Array.isArray(news) ? news : undefined,
      orders: Array.isArray(orders) ? orders : undefined,
      departments: Array.isArray(departments) ? departments : undefined,
      faqs: Array.isArray(faqs) ? faqs : undefined,
      ticker: Array.isArray(ticker) ? ticker : undefined
    });
    supabaseSuccess = syncRes.success;
    supabaseSynced = syncRes.synced;
  }

  return {
    status: 200,
    body: {
      success: true,
      supabaseConfigured: supabaseService.isConfigured(),
      supabaseSynced: supabaseSuccess,
      syncedCounts: supabaseSynced
    }
  };
}

export async function handleAdminSupabaseSeed(req: AuthRouteRequest): Promise<AuthRouteResponse> {
  if (!isRequestOriginAllowed(req.headers)) {
    return { status: 403, body: { success: false, error: 'Forbidden origin' } };
  }
  const authErr = requireAdminSession(req);
  if (authErr) return authErr;

  if (!supabaseService.isConfigured()) {
    return {
      status: 400,
      body: {
        success: false,
        error: 'Supabase एनवायरनमेंट वेरिएबल्स (SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY) अभी सर्वर पर सेट नहीं हैं।'
      }
    };
  }

  const body = req.body || {};
  const payload = {
    news: Array.isArray(body.news) ? body.news : dbService.getNews(),
    orders: Array.isArray(body.orders) ? body.orders : dbService.getOrders(),
    departments: Array.isArray(body.departments) ? body.departments : dbService.getDepartments(),
    faqs: Array.isArray(body.faqs) ? body.faqs : dbService.getFaqs(),
    ticker: Array.isArray(body.ticker) ? body.ticker : dbService.getTickerItems()
  };

  dbService.replaceAllNews(payload.news);
  dbService.replaceAllOrders(payload.orders);
  dbService.saveDepartments(payload.departments);
  dbService.saveFaqs(payload.faqs);
  dbService.saveTickerItems(payload.ticker);

  const result = await supabaseService.syncAllWebsiteData(payload);
  if (!result.success) {
    return {
      status: 500,
      body: {
        success: false,
        error:
          'Supabase डेटाबेस टेबल्स में डेटा सहेजने में त्रुटि आई। कृपया सुनिश्चित करें कि supabase/schema.sql आपके Supabase SQL Editor में चलाया जा चुका है और SUPABASE_SERVICE_ROLE_KEY सही है।'
      }
    };
  }

  return {
    status: 200,
    body: {
      success: true,
      syncedCounts: result.synced
    }
  };
}
