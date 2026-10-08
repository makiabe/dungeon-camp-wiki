/* Japanese pages do not need the English dictionary. */
(() => {
  const url = new URL(document.currentScript.src);
  let ready;
  window.WikiEnglish = {
    ensure() {
      if (window.WIKI_EN) return Promise.resolve();
      if (!ready) ready = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = new URL('locale-en.js?v=9526d8cb48f2-notice', url).href;
        script.onload = resolve;
        script.onerror = () => { script.remove(); ready = null; reject(new Error('English dictionary unavailable')); };
        document.head.append(script);
      });
      return ready;
    }
  };
})();
