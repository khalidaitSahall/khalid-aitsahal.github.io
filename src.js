(() => {
  // Prevent duplicate initialization if the script is included more than once.
  if (window.__khalidSiteEnhancementsLoaded) return;
  window.__khalidSiteEnhancementsLoaded = true;

  function initializeSiteEnhancements() {
    const root = document.documentElement;
    const themeToggle = document.getElementById('theme-toggle');

    function applyTheme(theme) {
      root.dataset.theme = theme;
      if (themeToggle) {
        const isDark = theme === 'dark';
        themeToggle.setAttribute('aria-pressed', String(isDark));
        themeToggle.setAttribute('aria-label', isDark ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الداكن');
        const icon = themeToggle.querySelector('.theme-icon');
        if (icon) icon.textContent = isDark ? '☀️' : '🌙';
      }
      try { localStorage.setItem('preferred-theme', theme); } catch (error) { /* Storage is optional. */ }
    }

    let theme;
    try { theme = localStorage.getItem('preferred-theme'); } catch (error) { /* Use system preference. */ }
    if (theme !== 'light' && theme !== 'dark') {
      theme = root.dataset.theme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    }
    applyTheme(theme);

    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        applyTheme(root.dataset.theme === 'dark' ? 'light' : 'dark');
      });
    }

    const mainNav = document.querySelector('.main-nav');
    if (mainNav && !mainNav.querySelector('a[href="page7/H.html"]')) {
      const page7Link = document.createElement('a');
      page7Link.href = 'page7/H.html';
      page7Link.textContent = 'الصفحة 7';
      page7Link.title = 'فتح page7/H.html';
      mainNav.append(page7Link);
    }

    const contactSection = document.querySelector('.contact-section');
    if (contactSection && !document.getElementById('site-actions')) {
      const actions = document.createElement('div');
      actions.className = 'site-actions';
      actions.id = 'site-actions';
      actions.setAttribute('aria-label', 'حفظ ومشاركة السيرة الذاتية');

      const pdfButton = document.createElement('button');
      pdfButton.className = 'button button-secondary action-button';
      pdfButton.type = 'button';
      pdfButton.textContent = 'حفظ السيرة الذاتية PDF';
      pdfButton.title = 'اختر حفظ كـ PDF في نافذة الطباعة';
      pdfButton.addEventListener('click', () => window.print());
      actions.append(pdfButton);

      const pageUrl = () => window.location.href.split('#')[0];
      const encodedUrl = encodeURIComponent(pageUrl());
      const addShareLink = (label, href) => {
        const link = document.createElement('a');
        link.className = 'button button-secondary action-button';
        link.href = href;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = label;
        actions.append(link);
      };
      addShareLink('Facebook', `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`);
      addShareLink('WhatsApp', `https://wa.me/?text=${encodedUrl}`);
      addShareLink('X', `https://twitter.com/intent/tweet?url=${encodedUrl}`);

      const instagramButton = document.createElement('button');
      instagramButton.className = 'button button-secondary action-button';
      instagramButton.type = 'button';
      instagramButton.textContent = 'Instagram / نسخ الرابط';
      instagramButton.title = 'انسخ رابط الموقع لمشاركته على Instagram';
      instagramButton.addEventListener('click', async () => {
        let copied = false;
        try {
          await navigator.clipboard.writeText(pageUrl());
          copied = true;
        } catch (error) {
          const input = document.createElement('textarea');
          input.value = pageUrl();
          input.setAttribute('readonly', '');
          input.style.position = 'fixed';
          input.style.opacity = '0';
          document.body.append(input);
          input.select();
          copied = document.execCommand('copy');
          input.remove();
        }
        instagramButton.textContent = copied ? 'تم نسخ الرابط ✓' : 'تعذر نسخ الرابط';
        window.setTimeout(() => { instagramButton.textContent = 'Instagram / نسخ الرابط'; }, 2500);
      });
      actions.append(instagramButton);
      contactSection.append(actions);
    }

    const printStyles = document.createElement('style');
    printStyles.textContent = `
      .site-actions { display:flex; flex-wrap:wrap; gap:.65rem; margin-top:1.25rem; }
      .action-button { min-height:42px; padding:.55rem .9rem; font-size:.9rem; cursor:pointer; }
      @media (max-width:620px) { .site-actions { width:100%; } .action-button { flex:1 1 42%; } }
      @media print {
        @page { size:A4; margin:14mm; }
        :root { color-scheme:light !important; --bg:#fff !important; --paper:#fff !important; --paper-soft:#f2f2f2 !important; --ink:#111 !important; --muted:#333 !important; --line:#ccc !important; --blue:#0866ff !important; }
        body { min-width:0 !important; background:#fff !important; color:#111 !important; font-size:10pt !important; }
        .site-header, .site-footer, .hero-actions, .site-actions, .status-dot { display:none !important; }
        .hero, .content-section, .contact-section { margin:0 !important; padding:8mm 0 !important; background:#fff !important; color:#111 !important; break-inside:avoid; }
        .hero { display:grid !important; grid-template-columns:1.4fr .6fr !important; gap:8mm !important; }
        h1 { font-size:25pt !important; }
        h2 { font-size:16pt !important; }
        h3 { font-size:12pt !important; }
        .description, .profile-card p, .info-box li, .timeline-content ul, .contact-copy p { color:#222 !important; }
        .profile-grid, .languages-grid { grid-template-columns:1fr 1fr !important; }
        .profile-card, .info-box, .timeline-item, .mini-stats li, .photo-card { box-shadow:none !important; background:#fff !important; border:1px solid #bbb !important; break-inside:avoid; }
        .photo-card { width:45mm !important; padding:2mm !important; }
        .photo-card img { border-radius:0 !important; }
        .photo-card::before { display:none !important; }
        a { color:#111 !important; }
      }
    `;
    document.head.append(printStyles);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSiteEnhancements, { once: true });
  } else {
    initializeSiteEnhancements();
  }
})();
