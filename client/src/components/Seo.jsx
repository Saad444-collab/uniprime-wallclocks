import { useEffect } from 'react';

const DEFAULT_TITLE = 'UniPrime Wall Clocks | Luxury Timepieces';
const DEFAULT_DESC = 'Premium luxury wall clocks for your home and office. Shop handcrafted wall clocks with nationwide delivery.';
const SITE_URL = 'https://uniprimewallclocks.com/';

function setMeta(selector, attr, value) {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, value);
    document.head.appendChild(el);
  } else {
    el.setAttribute(attr, value);
  }
}

function absoluteUrl(value) {
  if (!value) return SITE_URL;
  return value.startsWith('http') ? value : SITE_URL + value.replace(/^\//, '');
}

export default function Seo({ title, description, image, path = '', type = 'website', jsonLd, jsonLdExtra, noindex = false }) {
  useEffect(() => {
    const fullTitle = title ? `${title} | UniPrime Wall Clocks` : DEFAULT_TITLE;
    const desc = description || DEFAULT_DESC;
    const url = absoluteUrl(path ? path.replace(/^\//, '') : '');
    const ogImage = absoluteUrl(image || '/clock-icon.svg');

    document.title = fullTitle;
    setMeta('meta[name="description"]', 'content', desc);
    setMeta('meta[property="og:title"]', 'content', fullTitle);
    setMeta('meta[property="og:description"]', 'content', desc);
    setMeta('meta[property="og:url"]', 'content', url);
    setMeta('meta[property="og:type"]', 'content', type);
    setMeta('meta[property="og:image"]', 'content', ogImage);
    setMeta('meta[name="twitter:title"]', 'content', fullTitle);
    setMeta('meta[name="twitter:description"]', 'content', desc);
    setMeta('meta[name="twitter:image"]', 'content', ogImage);
    setMeta('meta[name="twitter:card"]', 'content', type === 'product' ? 'summary_large_image' : 'summary_large_image');
    setMeta('link[rel="canonical"]', 'href', url);
    setMeta('meta[name="robots"]', 'content', noindex ? 'noindex, nofollow' : 'index, follow');

    if (jsonLd) {
      let el = document.getElementById('seo-jsonld');
      if (!el) {
        el = document.createElement('script');
        el.id = 'seo-jsonld';
        el.type = 'application/ld+json';
        document.head.appendChild(el);
      }
      el.textContent = JSON.stringify(jsonLd);
    }
    if (jsonLdExtra) {
      let el = document.getElementById('seo-jsonld-extra');
      if (!el) {
        el = document.createElement('script');
        el.id = 'seo-jsonld-extra';
        el.type = 'application/ld+json';
        document.head.appendChild(el);
      }
      el.textContent = JSON.stringify(jsonLdExtra);
    }

    return () => {
      const el = document.getElementById('seo-jsonld');
      if (el) el.remove();
      const el2 = document.getElementById('seo-jsonld-extra');
      if (el2) el2.remove();
    };
  }, [title, description, image, path, type, jsonLd, jsonLdExtra]);

  return null;
}