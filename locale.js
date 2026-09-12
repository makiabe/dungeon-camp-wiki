/* Language preference is separate from game data and never rewrites IDs. */
(function (global) {
  'use strict';
  const supported = ['ja', 'en'];
  const key = 'dungeonCamp.wikiLanguage';
  const valid = value => supported.includes(value);
  function resolve(url, saved, preferred = 'ja') {
    const specified = new URL(url).searchParams.get('lang');
    return valid(specified) ? specified : valid(saved) ? saved : /^en(?:-|$)/i.test(preferred) ? 'en' : 'ja';
  }
  let saved; try { saved = localStorage.getItem(key); } catch {}
  let language = resolve(location.href, saved, navigator.language);
  const originals = new WeakMap();
  const attributes = new WeakMap();
  const missing = new Set();
  function text(value) {
    if (language === 'ja') return value;
    const source = String(value), trimmed = source.trim();
    const translated = global.WIKI_EN?.[trimmed];
    if (translated !== undefined) return source.replace(trimmed, translated);
    // Numeric labels need templates: exact dictionary entries cannot cover every value.
    const patterns = [
      [/^([\d.]+|—)秒$/, m => `${m[1]} s`],
      [/^効果時間：([\d.]+)秒$/, m => `Duration: ${m[1]} s`],
      [/^回復量：攻撃力 ×([\d.]+)(?:〜([\d.]+)（発動ごとにランダム）)?$/, m => `Healing: ATK ×${m[1]}${m[2] ? `–${m[2]} (random per cast)` : ''}`],
      [/^被ダメージ ([\d.]+)%軽減$/, m => `Damage taken reduced by ${m[1]}%`],
      [/^攻撃間隔 ×([\d.]+)$/, m => `Attack interval ×${m[1]}`],
      [/^(与ダメージ|敵の被ダメージ) ×([\d.]+)$/, m => `${m[1]==='与ダメージ'?'Damage dealt':'Enemy damage taken'} ×${m[2]}`],
      [/^最大HPの([\d.]+)%を([\d.]+)秒ごとに回復$/, m => `Restore ${m[1]}% max HP every ${m[2]} s`],
      [/^攻撃力 ×([\d.]+) \/ ([\d.]+)秒ごと$/, m => `ATK ×${m[1]} every ${m[2]} s`],
      [/^シールド：最大HPの([\d.]+)%$/, m => `Shield: ${m[1]}% max HP`],
      [/^継続回復：最大HPの([\d.]+)% \/ ([\d.]+)秒$/, m => `Regeneration: ${m[1]}% max HP / ${m[2]} s`],
      [/^最大HPの([\d.]+)%で復活$/, m => `Revive with ${m[1]}% max HP`],
      [/^ボスへのダメージ \+([\d.]+)%$/, m => `Damage to bosses +${m[1]}%`],
      [/^· (.+)$/, m => `· ${global.WIKI_EN?.[m[1]] || m[1]}`],

      [/^(\d+)位$/, m => `#${m[1]}`],
      [/^(\d+)人の図鑑 →$/, m => `${m[1]} companions →`],
      [/^年間(\d+)イベント →$/, m => `${m[1]} annual events →`],
      [/^(\d+)月(\d+)〜(\d+)日$/, m => `${m[1]}/${m[2]}–${m[1]}/${m[3]}`],
      [/^(\d+)月(\d+)日〜月末$/, m => `${m[1]}/${m[2]}–month end`],
      [/^HP ([\d.,]+) \/ 攻撃 ([\d.,]+) \/ 防御 ([\d.,]+)$/, m => `HP ${m[1]} / ATK ${m[2]} / DEF ${m[3]}`],
      [/^攻撃力 ×([\d.]+)$/, m => `ATK ×${m[1]}`],
      [/^攻撃力 ×([\d.]+) ×(\d+)回（合計([\d.]+)倍）$/, m => `ATK ×${m[1]} ×${m[2]} hits (${m[3]}× total)`],
      [/^· (★+) · (限定|常設)$/, m => `· ${m[1]} · ${m[2] === '限定' ? 'Limited' : 'Permanent'}`],
      [/^木曜0:00更新 \/ (.+)まで$/, m => `Updates Thursday at 00:00 JST / until ${m[1]}`]
    ];
    for (const [pattern, render] of patterns) {
      const match = trimmed.match(pattern);
      if (match) return source.replace(trimmed, render(match));
    }

    if (/[\u3040-\u30ff\u3400-\u9fff]/.test(trimmed)) missing.add(trimmed);
    return source;
  }
  function translate(root) {
    if (!root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      if (node.parentElement?.closest('script,style,textarea,[translate="no"],[data-language-switch]')) continue;
      const previous = originals.get(node);
      const original = previous && node.data === previous.rendered ? previous.original : node.data;
      const rendered = text(original);
      originals.set(node, { original, rendered });
      if (node.data !== rendered) node.data = rendered;
    }
    root.querySelectorAll('[placeholder],[aria-label],[alt]').forEach(element => {
      if (element.closest('[translate="no"],[data-language-switch]')) return;
      let record = attributes.get(element); if (!record) attributes.set(element, record = {});
      ['placeholder', 'aria-label', 'alt'].forEach(name => {
        if (!element.hasAttribute(name)) return;
        const value = element.getAttribute(name), prior = record[name];
        const original = prior && value === prior.rendered ? prior.original : value;
        const rendered = text(original); record[name] = {original, rendered};
        if (value !== rendered) element.setAttribute(name, rendered);
      });
    });
  }
  function urlFor(lang, href = location.href) {
    if (!valid(lang)) throw new Error('Unsupported language');
    const url = new URL(href, location.href); url.searchParams.set('lang', lang); return url;
  }
  function sync() {
    document.documentElement.lang = language;
    document.querySelectorAll('[data-language-switch] a').forEach(link => {
      const lang = link.dataset.language;
      link.href = urlFor(lang).href;
      if (lang === language) link.setAttribute('aria-current', 'true'); else link.removeAttribute('aria-current');
    });
    document.querySelectorAll('a[href]').forEach(link => {
      if (link.closest('[data-language-switch]')) return;
      const url = new URL(link.getAttribute('href'), location.href);
      if (url.origin === location.origin && /(?:\/|\/index\.html|\/support\.html|\/privacy\.html|\/faq\.html)$/.test(url.pathname)) {
        url.searchParams.set('lang', language); link.href = url.href;
      }
    });
  }
  function select(lang) {
    if (!valid(lang)) return;
    language = lang;
    try { localStorage.setItem(key, lang); } catch {}
    history.replaceState(history.state, '', urlFor(lang));
    missing.clear();
    global.dispatchEvent(new CustomEvent('wiki-language-change', {detail: {language}}));
    translate(document.body); sync();
  }
  global.WikiLocale = {get language() {return language;}, text, translate, sync, select, resolve, urlFor, missing};
  document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('[data-language-switch]')) return;
    const nav = document.createElement('nav');
    nav.className = 'language-switch'; nav.dataset.languageSwitch = '';
    nav.setAttribute('aria-label', 'Language / 言語');
    nav.innerHTML = '<a data-language="ja" lang="ja" hreflang="ja">日本語</a><a data-language="en" lang="en" hreflang="en">English</a>';
    nav.addEventListener('click', event => {
      const link = event.target.closest('a[data-language]');
      if (!link || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault(); select(link.dataset.language);
    });
    document.body.append(nav);
    history.replaceState(history.state, '', urlFor(language));
    translate(document.body); sync();
  });
  global.addEventListener('hashchange', sync);
  global.addEventListener('popstate', () => {
    let preference; try { preference = localStorage.getItem(key); } catch {}
    const next = resolve(location.href, preference, navigator.language);
    if (next !== language) {
      language = next;
      global.dispatchEvent(new CustomEvent('wiki-language-change', {detail: {language}}));
      translate(document.body);
    }
    sync();
  });
})(window);
