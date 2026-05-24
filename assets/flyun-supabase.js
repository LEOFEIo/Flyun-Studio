/* ==========================================================
 * FLYUN SUPABASE · 数据库连接层
 * 站点连接 Supabase —— 公开数据 (博客/图片/文案/设置) 公共可读，
 * 后台改写需要 Supabase Auth 登录（邮箱+密码）。
 * ========================================================== */
(function (global) {
  'use strict';

  /* ===== 配置 ===== */
  const SUPABASE_URL = 'https://neppacfsixrjzpkvcgxy.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_YSgMffoDWwjYnjBrYYKTLQ_08Y5BLrz';

  /* ===== 加载 supabase-js (ESM) 并暴露 client ===== */
  let _client = null;
  let _ready = null;
  let _user = null;

  function ready() {
    if (_ready) return _ready;
    _ready = new Promise((resolve) => {
      // 动态加载 supabase-js v2
      import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm')
        .then((mod) => {
          _client = mod.createClient(SUPABASE_URL, SUPABASE_KEY, {
            auth: {
              persistSession: true,
              storageKey: 'flyun:sb-auth',
              autoRefreshToken: true
            }
          });
          // 同步当前用户
          _client.auth.getSession().then(({ data }) => {
            _user = data?.session?.user || null;
            resolve(_client);
            document.dispatchEvent(new CustomEvent('flyun:supabase-ready', { detail: { user: _user } }));
          });
          _client.auth.onAuthStateChange((event, session) => {
            _user = session?.user || null;
            document.dispatchEvent(new CustomEvent('flyun:auth-change', { detail: { event, user: _user } }));
          });
        })
        .catch((e) => {
          console.warn('[FlyunSupabase] 加载失败，将退化为本地缓存模式：', e);
          _client = null;
          resolve(null);
        });
    });
    return _ready;
  }

  function client() { return _client; }
  function getUser() { return _user; }

  /* ===== AUTH ===== */
  async function signIn(email, password) {
    await ready();
    if (!_client) throw new Error('Supabase 未就绪');
    const { data, error } = await _client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    _user = data.user;
    return data.user;
  }
  async function signUp(email, password) {
    await ready();
    if (!_client) throw new Error('Supabase 未就绪');
    const { data, error } = await _client.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  }
  async function signOut() {
    await ready();
    if (!_client) return;
    await _client.auth.signOut();
    _user = null;
  }
  async function isAdmin() {
    await ready();
    return !!_user;
  }

  /* ===== POSTS ===== */
  async function listPosts({ includeDrafts = false } = {}) {
    await ready();
    if (!_client) return [];
    let q = _client.from('posts').select('*').order('date', { ascending: false }).order('updated_at', { ascending: false });
    if (!includeDrafts) q = q.eq('status', 'published');
    const { data, error } = await q;
    if (error) { console.warn('[posts]', error); return []; }
    return (data || []).map(rowToPost);
  }
  async function getPost(id) {
    await ready();
    if (!_client) return null;
    const { data, error } = await _client.from('posts').select('*').eq('id', id).maybeSingle();
    if (error) { console.warn('[post]', error); return null; }
    return data ? rowToPost(data) : null;
  }
  async function upsertPost(post) {
    await ready();
    if (!_client) throw new Error('未连接到数据库');
    const row = postToRow(post);
    row.updated_at = new Date().toISOString();
    if (!row.id) row.id = 'p_' + Date.now();
    const { data, error } = await _client.from('posts').upsert(row, { onConflict: 'id' }).select().maybeSingle();
    if (error) throw error;
    return data ? rowToPost(data) : null;
  }
  async function deletePost(id) {
    await ready();
    if (!_client) throw new Error('未连接到数据库');
    const { error } = await _client.from('posts').delete().eq('id', id);
    if (error) throw error;
    return true;
  }
  function rowToPost(r) {
    return {
      id: r.id,
      title: { zh: r.title_zh || '', en: r.title_en || '' },
      excerpt: { zh: r.excerpt_zh || '', en: r.excerpt_en || '' },
      body: { zh: r.body_zh || '', en: r.body_en || '' },
      tags: Array.isArray(r.tags) ? r.tags : [],
      cover: r.cover || '',
      status: r.status || 'published',
      date: r.date || '',
      createdAt: r.created_at,
      updatedAt: r.updated_at
    };
  }
  function postToRow(p) {
    return {
      id: p.id || null,
      title_zh: p.title?.zh || '',
      title_en: p.title?.en || '',
      excerpt_zh: p.excerpt?.zh || '',
      excerpt_en: p.excerpt?.en || '',
      body_zh: p.body?.zh || '',
      body_en: p.body?.en || '',
      tags: Array.isArray(p.tags) ? p.tags : [],
      cover: p.cover || '',
      status: p.status || 'published',
      date: p.date || new Date().toISOString().slice(0, 10)
    };
  }

  /* ===== CONTENT OVERRIDES ===== */
  async function listContent() {
    await ready();
    if (!_client) return { zh: {}, en: {} };
    const { data, error } = await _client.from('content_overrides').select('key,lang,value');
    if (error) { console.warn('[content]', error); return { zh: {}, en: {} }; }
    const out = { zh: {}, en: {} };
    (data || []).forEach((r) => {
      if (!out[r.lang]) out[r.lang] = {};
      out[r.lang][r.key] = r.value || '';
    });
    return out;
  }
  async function upsertContent(lang, key, value) {
    await ready();
    if (!_client) throw new Error('未连接到数据库');
    const { error } = await _client.from('content_overrides').upsert(
      { key, lang, value: value || '', updated_at: new Date().toISOString() },
      { onConflict: 'key,lang' }
    );
    if (error) throw error;
    return true;
  }
  async function deleteContent(lang, key) {
    await ready();
    if (!_client) throw new Error('未连接到数据库');
    const { error } = await _client.from('content_overrides').delete().match({ key, lang });
    if (error) throw error;
    return true;
  }
  async function bulkSaveContent(content) {
    await ready();
    if (!_client) throw new Error('未连接到数据库');
    const rows = [];
    Object.keys(content || {}).forEach((lang) => {
      Object.keys(content[lang] || {}).forEach((key) => {
        rows.push({ key, lang, value: content[lang][key] || '', updated_at: new Date().toISOString() });
      });
    });
    if (!rows.length) return true;
    const { error } = await _client.from('content_overrides').upsert(rows, { onConflict: 'key,lang' });
    if (error) throw error;
    return true;
  }

  /* ===== IMAGES ===== */
  async function listImages() {
    await ready();
    if (!_client) return {};
    const { data, error } = await _client.from('images').select('key,url,label');
    if (error) { console.warn('[images]', error); return {}; }
    const out = {};
    (data || []).forEach((r) => {
      out[r.key] = { url: r.url || '', label: r.label || '' };
    });
    return out;
  }
  async function upsertImage(key, url, label) {
    await ready();
    if (!_client) throw new Error('未连接到数据库');
    const row = { key, url, label: label || '', updated_at: new Date().toISOString() };
    const { error } = await _client.from('images').upsert(row, { onConflict: 'key' });
    if (error) throw error;
    return true;
  }
  async function deleteImage(key) {
    await ready();
    if (!_client) throw new Error('未连接到数据库');
    const { error } = await _client.from('images').delete().eq('key', key);
    if (error) throw error;
    return true;
  }

  /* ===== SETTINGS ===== */
  async function listSettings() {
    await ready();
    if (!_client) return {};
    const { data, error } = await _client.from('site_settings').select('key,value');
    if (error) { console.warn('[settings]', error); return {}; }
    const out = {};
    (data || []).forEach((r) => { out[r.key] = r.value; });
    return out;
  }
  async function upsertSetting(key, value) {
    await ready();
    if (!_client) throw new Error('未连接到数据库');
    const { error } = await _client.from('site_settings').upsert(
      { key, value, updated_at: new Date().toISOString() },
      { onConflict: 'key' }
    );
    if (error) throw error;
    return true;
  }

  /* ===== STORAGE (image upload) ===== */
  const BUCKET = 'flyun-public';
  async function uploadFile(file, path) {
    await ready();
    if (!_client) throw new Error('未连接到数据库');
    const finalPath = path || ('img/' + Date.now() + '_' + (file.name || 'upload').replace(/[^\w.\-]/g, '_'));
    const { error } = await _client.storage.from(BUCKET).upload(finalPath, file, {
      cacheControl: '3600', upsert: true, contentType: file.type
    });
    if (error) throw error;
    const { data: pub } = _client.storage.from(BUCKET).getPublicUrl(finalPath);
    return pub.publicUrl;
  }

  global.FlyunSupabase = {
    URL: SUPABASE_URL,
    KEY: SUPABASE_KEY,
    BUCKET,
    ready, client, getUser,
    signIn, signUp, signOut, isAdmin,
    listPosts, getPost, upsertPost, deletePost,
    listContent, upsertContent, deleteContent, bulkSaveContent,
    listImages, upsertImage, deleteImage,
    listSettings, upsertSetting,
    uploadFile
  };

  // 自动初始化（不阻塞页面）
  ready();
})(window);
