export default async function handler(req, res) {
  const { slug } = req.query;
  const cleanSlug = (slug || '').replace(/\.(mp4|stream|video|mov)$/i, '');

  const SUPABASE_URL = 'https://nccgkccjbrojavagmpbf.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_uVtTSdbdFwyYgCaER986oQ_E6WwbJuH';

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/links?slug=eq.${cleanSlug}&select=*`, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`
      }
    });
    const data = await response.json();

    if (!data || data.length === 0) {
      return res.redirect(302, '/');
    }

    const link = data[0];

    fetch(`${SUPABASE_URL}/rest/v1/links?id=eq.${link.id}`, {
      method: 'PATCH',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ clicks: (link.clicks || 0) + 1 })
    }).catch(() => {});

    const title = link.title || 'Watch Video';
    const desc = link.description || 'Click to view content';
    const img = link.image_url || '';

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${desc}" />
  <meta property="og:image" content="${img}" />
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${desc}" />
  <meta name="twitter:image" content="${img}" />
  <meta http-equiv="refresh" content="0;url=${link.target_url}" />
</head>
<body style="background:#000;color:#fff;font-family:sans-serif;text-align:center;padding-top:20%;">
  <p>Redirecting...</p>
  <script>window.location.replace("${link.target_url}");</script>
</body>
</html>`);
  } catch (e) {
    return res.redirect(302, '/');
  }
}
