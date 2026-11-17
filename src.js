(() => {
  const root = document.documentElement;
  const themeToggle = document.getElementById('theme-toggle');
  if (!themeToggle) return;

  function applyTheme(theme) {
    root.dataset.theme = theme;
    const isDark = theme === 'dark';
    themeToggle.setAttribute('aria-pressed', String(isDark));
    themeToggle.setAttribute('aria-label', isDark ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الداكن');
    const icon = themeToggle.querySelector('.theme-icon');
    if (icon) icon.textContent = isDark ? '☀️' : '🌙';
    try { localStorage.setItem('preferred-theme', theme); } catch (error) { /* Storage is optional. */ }
  }

  let theme;
  try { theme = localStorage.getItem('preferred-theme'); } catch (error) { /* Use system preference. */ }
  if (theme !== 'light' && theme !== 'dark') {
    theme = root.dataset.theme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  }
  applyTheme(theme);

  themeToggle.addEventListener('click', () => {
    const currentTheme = root.dataset.theme || 'light';
    applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
  });
})();
