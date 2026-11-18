(() => {
  const frame = document.querySelector('.site-frame');
  if (!frame) return;

  frame.addEventListener('error', () => {
    document.body.innerHTML = '<p dir="rtl">تعذر تحميل الصفحة. <a href="../index.html">افتح السيرة المهنية مباشرة</a>.</p>';
  });
})();
