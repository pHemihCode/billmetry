export default function ThemeScript() {
  const script = `
    (function() {
      try {
        var theme = localStorage.getItem('billmetry-theme') || 'dark';
        var resolved = theme;
        if (theme === 'system') {
          resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        document.documentElement.classList.add(resolved);
      } catch(e) {
        document.documentElement.classList.add('dark');
      }
    })();
  `
  return <script dangerouslySetInnerHTML={{ __html: script }} />
}