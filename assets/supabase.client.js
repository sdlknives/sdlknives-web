// Inisialisasi Supabase JS Client dan helper
// Memerlukan: assets/config.js dan CDN @supabase/supabase-js@2 dimuat sebelumnya
(function(){
  if (!window.SUPABASE_URL || !window.SUPABASE_ANON_KEY) {
    console.warn('[Supabase] URL/ANON_KEY belum diisi. Frontend akan fallback ke API PHP.');
    return;
  }
  if (typeof window.supabase === 'undefined' && typeof window.createClient === 'undefined') {
    console.error('[Supabase] Library tidak ditemukan. Pastikan CDN @supabase/supabase-js@2 sudah dimuat.');
    return;
  }
  // createClient tersedia di UMD: window.supabase.createClient
  const client = window.supabase?.createClient
    ? window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY)
    : window.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

  window.supabase = client;

  // Helper upload ke storage
  window.supaUploadImage = async function(file) {
    const bucket = window.SUPABASE_BUCKET || 'produk';
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth()+1).padStart(2,'0');
    const base = (file.name || 'image').replace(/[^a-zA-Z0-9_.-]/g, '_');
    const uniq = Math.random().toString(36).slice(2,8);
    const path = `${y}/${m}/${uniq}_${base}`;

    const { data, error } = await client.storage.from(bucket).upload(path, file, {
      contentType: file.type || 'application/octet-stream',
      upsert: false,
    });
    if (error) throw error;
    const pub = client.storage.from(bucket).getPublicUrl(path);
    const publicUrl = pub?.data?.publicUrl || '';
    return {
      type: 'upload',
      path: publicUrl,
      filename: base,
      original_name: file.name || base,
    };
  };

  // Helper CRUD produk
  window.supaListProducts = async function() {
    const { data, error } = await client.from('products').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  };

  window.supaCreateProduct = async function(payload) {
    const { data, error } = await client.from('products').insert(payload).select('*').single();
    if (error) throw error;
    return data;
  };

  window.supaUpdateProduct = async function(id, payload) {
    const { data, error } = await client.from('products').update(payload).eq('id', id).select('*').single();
    if (error) throw error;
    return data;
  };

  window.supaDeleteProduct = async function(id) {
    const { error } = await client.from('products').delete().eq('id', id);
    if (error) throw error;
    return true;
  };

  window.supaToggleVisibility = async function(id, visible) {
    const { data, error } = await client.from('products').update({ visible }).eq('id', id).select('*').single();
    if (error) throw error;
    return data;
  };

  // Auth helpers
  window.supaGetUser = async function() {
    const { data } = await client.auth.getUser();
    return data?.user || null;
  };
  window.supaSignIn = async function(email, password) {
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data?.user || null;
  };
  window.supaSignOut = async function() {
    await client.auth.signOut();
  };

  // Sign up helper (membuat akun Supabase Auth)
  window.supaSignUp = async function(email, password) {
    const { data, error } = await client.auth.signUp({ email, password });
    if (error) throw error;
    return data?.user || null;
  };

  // Resend verification email helper
  window.supaResendVerification = async function(email) {
    const { data, error } = await client.auth.resend({ type: 'signup', email });
    if (error) throw error;
    return data || null;
  };
})();