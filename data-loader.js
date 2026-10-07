/* Fetch each detail once, share concurrent requests, and permit retry on failure. */
window.WikiDataLoader = (() => {
  const pending = new Map();
  function load(url, apply) {
    if (!pending.has(url)) pending.set(url, fetch(url).then(response => {
      if (!response.ok) throw new Error(`Wiki data: ${response.status}`);
      return response.json();
    }).then(apply).catch(error => { pending.delete(url); throw error; }));
    return pending.get(url);
  }
  async function ensure(page, id) {
    const tasks = [];
    if (['contracts', 'contract', 'dungeon', 'search'].includes(page)) {
      tasks.push(load(WIKI_CHUNKS.contracts, value => { WIKI_DATA.contracts = value; }));
    }
    if (page === 'event' && WIKI_CHUNKS.events[id]) {
      tasks.push(load(WIKI_CHUNKS.events[id], value => {
        WIKI_DATA.events.find(event => event.id === id).difficulties = value;
      }));
    }
    await Promise.all(tasks);
  }
  return { ensure };
})();
