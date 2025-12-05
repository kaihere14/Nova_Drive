import { useEffect } from "react";

function createOrUpdateMeta(selector, attrs = {}) {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement(attrs.tag || 'meta');
    if (attrs.tag) delete attrs.tag;
    if (attrs.selectorName && attrs.selectorValue) {
      // noop - handled by selector
    }
    document.head.appendChild(el);
  }
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === 'tag') return;
    el.setAttribute(k, v);
  });
  return el;
}

export default function usePageMeta(title, description) {
  useEffect(() => {
    if (title) document.title = title;

    if (description) {
      // meta description
      let desc = document.head.querySelector('meta[name="description"]');
      if (!desc) {
        desc = document.createElement('meta');
        desc.setAttribute('name', 'description');
        document.head.appendChild(desc);
      }
      desc.setAttribute('content', description);

      // Open Graph title
      createOrUpdateMeta('meta[property="og:title"]', {
        property: 'og:title',
        content: title || document.title,
      });

      // Open Graph description
      createOrUpdateMeta('meta[property="og:description"]', {
        property: 'og:description',
        content: description,
      });

      // Twitter card
      createOrUpdateMeta('meta[name="twitter:card"]', {
        name: 'twitter:card',
        content: 'summary_large_image',
      });
    }
  }, [title, description]);
}
