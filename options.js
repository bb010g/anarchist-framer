/* global browser */

const ensureArray = val =>
    Array.isArray(val)
        ? val
        : [ val ];

const map = (fn, val) =>
    Array.prototype.map.call(val, fn);

const q = str =>
    document.querySelector(str);

const el = (str, props = {}) => {
    const elem = document.createElement(str);
    Object.assign(elem, props);
    return elem;
};

const text = str =>
    document.createTextNode(str);

const append = (parent, children = []) => {
    ensureArray(children)
        .forEach(child =>
            parent.appendChild(child));
    return parent;
};


const createSite = function (id, origin) {
    const remButton = append(
        el('button', {
            className: 'rem',
            type: 'button'
        }),
        text('Remove'));
    const site = append(
        el('tr', { id: `site-${id}` }),
        [
            append(
                el('td'),
                el('input', {
                    type: 'text',
                    className: 'origin',
                    value: origin,
                    required: true
                })),
            append(
                el('td'),
                remButton)
        ]);
    remButton.addEventListener('click', () =>
        site.parentNode.removeChild(site));
    return site;
};
const addSite = (...args) => {
    const sites = q('#sites');
    return append(
        sites,
        createSite(sites.children.length, ...args));
};

const clearSites = () => {
    const sites = q('#sites');
    while (sites.firstChild) {
        sites.removeChild(sites.firstChild);
    }
};

const saveOptions = (e) => {
    browser.storage.local.set({
        sites: map(
            tr =>tr.getElementsByClassName('origin')[0].value,
            document.querySelector('#sites').children)
    });
    e.preventDefault();
    return false;
};

const restoreOptions = () =>
    browser.storage.local.get('sites')
        .then(({ sites }) => {
            clearSites();
            if (!Array.isArray(sites)) {
                browser.storage.local.set({ sites: [] });
                sites = [];
            }
            sites.forEach(addSite);
        });

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector('form').addEventListener('submit', saveOptions);
document.querySelector('#add-site').addEventListener('click', () =>
    addSite('', ''));
