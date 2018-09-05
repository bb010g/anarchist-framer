const element = (tagName, props = {}, children = [], listeners = {}) => {
  const el = document.createElement(tagName);
  Object.assign(el, props);
  for (const child of children) {
    el.appendChild(child);
  }
  for (const ev in listeners) {
    el.addEventListener(ev, listeners[ev]);
  }
  return el;
};

const createSite = (id, origin) =>
  element('tr', {id: `site-${id}`}, [
    element('td', {}, [
      element('input', {
        type: 'text',
        className: 'origin',
        value: origin,
        required: true,
      }),
    ]),
    element('td', {}, [
      element(
        'button',
        {className: 'rem', type: 'button'},
        [document.createTextNode('Remove')],
        {click: function (e) {
          const site = this.parentNode.parentNode;
          site.parentNode.removeChild(site);
        }}
      ),
    ])
  ]);

const addSite = (...args) => {
  const sites = document.querySelector('#sites');
  sites.appendChild(createSite(sites.children.length, ...args));
}
const clearSites = () => {
  const sites = document.querySelector('#sites');
  while (sites.firstChild) {
    sites.removeChild(sites.firstChild);
  }
}

const saveOptions = function (e) {
  const sites = [];
  for (const tr of document.querySelector('#sites').children) {
    const origin = tr.getElementsByClassName('origin')[0].value;
    sites.push(origin);
  }
  browser.storage.local.set({sites});
  e.preventDefault();
  return false;
}

const restoreOptions = function (e) {
  browser.storage.local.get('sites').then(({sites}) => {
    clearSites();
    if (!Array.isArray(sites)) {
      sites = [];
      browser.storage.local.set({sites});
    }
    for (const origin of sites) {
      addSite(origin);
    }
  });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector('form').addEventListener('submit', saveOptions);
document.querySelector('#add-site').addEventListener('click', function (e) {
  addSite('', '');
});
