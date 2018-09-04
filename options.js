const createSite = function (id, origin) {
  const site = document.createElement('tr');
  site.id = `site-${id}`;
  const originTd = document.createElement('td');
  const originInput = document.createElement('input');
  originInput.type = 'text';
  originInput.className = 'origin';
  originInput.value = origin;
  originInput.required = true;
  originTd.appendChild(originInput);
  site.appendChild(originTd);
  const remTd = document.createElement('td');
  const remButton = document.createElement('button');
  remButton.className = 'rem';
  remButton.type = 'button';
  remButton.appendChild(document.createTextNode('Remove'));
  remButton.addEventListener('click', function (e) {
    site.parentNode.removeChild(site);
  });
  remTd.appendChild(remButton);
  site.appendChild(remTd);
  return site;
}
const addSite = function (...args) {
  const sites = document.querySelector('#sites');
  sites.appendChild(createSite(sites.children.length, ...args));
}
const clearSites = function () {
  const sites = document.querySelector('#sites');
  while (sites.firstChild) {
    sites.removeChild(sites.firstChild);
  }
}

const saveOptions = function (e) {
  const newSites = [];
  for (const tr of document.querySelector('#sites').children) {
    const origin = tr.getElementsByClassName('origin')[0].value;
    newSites.push(origin);
  }
  browser.storage.local.set({
    sites: newSites
  });
  e.preventDefault();
  return false;
}

const restoreOptions = function () {
  browser.storage.local.get('sites').then(({sites}) => {
    clearSites();
    if (typeof sites !== 'object' || !Array.isArray(sites)) {
      browser.storage.local.set({sites: []});
      sites = [];
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
