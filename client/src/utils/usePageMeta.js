import { useEffect } from "react";

function ensureTag(tagName, selector, attrs = {}) {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement(tagName);
    Object.entries(attrs).forEach(([k, v]) => {
      el.setAttribute(k, v);
    });
    document.head.appendChild(el);
  } else {
    Object.entries(attrs).forEach(([k, v]) => {
      el.setAttribute(k, v);
    });
  }
  return el;
}

export default function usePageMeta(titleOrOptions, description) {
  useEffect(() => {
    const defaultImage =
      "https://res.cloudinary.com/dw87upoot/image/upload/v1765959245/Logo_Feedback_Dec_17_2025_1_bha0nd.png";

    const defaults = {
      title: "NovaDrive",
      description:
        "NovaDrive — secure, fast cloud storage with AI-powered auto-tagging and smart organization.",
      image: defaultImage,
      canonical:
        typeof window !== "undefined"
          ? window.location.href
          : "https://novadrive.example.com/",
      keywords: "NovaDrive, cloud storage, AI tagging, secure storage",
      robots: "index,follow",
    };

    let opts = {};
    if (typeof titleOrOptions === "object" && titleOrOptions !== null) {
      opts = { ...defaults, ...titleOrOptions };
    } else {
      opts = {
        ...defaults,
        title: titleOrOptions || defaults.title,
        description: description || defaults.description,
      };
    }

    // Title
    if (opts.title) document.title = opts.title;

    // Basic meta tags
    ensureTag("meta", 'meta[name="description"]', {
      name: "description",
      content: opts.description,
    });

    ensureTag("meta", 'meta[name="keywords"]', {
      name: "keywords",
      content: opts.keywords,
    });

    ensureTag("meta", 'meta[name="robots"]', {
      name: "robots",
      content: opts.robots,
    });

    // canonical link
    ensureTag("link", 'link[rel="canonical"]', {
      rel: "canonical",
      href: opts.canonical,
    });

    // Open Graph
    ensureTag("meta", 'meta[property="og:title"]', {
      property: "og:title",
      content: opts.title,
    });
    ensureTag("meta", 'meta[property="og:description"]', {
      property: "og:description",
      content: opts.description,
    });
    ensureTag("meta", 'meta[property="og:image"]', {
      property: "og:image",
      content: opts.image,
    });
    ensureTag("meta", 'meta[property="og:type"]', {
      property: "og:type",
      content: "website",
    });

    // Twitter
    ensureTag("meta", 'meta[name="twitter:card"]', {
      name: "twitter:card",
      content: "summary_large_image",
    });
    ensureTag("meta", 'meta[name="twitter:title"]', {
      name: "twitter:title",
      content: opts.title,
    });
    ensureTag("meta", 'meta[name="twitter:description"]', {
      name: "twitter:description",
      content: opts.description,
    });
    ensureTag("meta", 'meta[name="twitter:image"]', {
      name: "twitter:image",
      content: opts.image,
    });
  }, [titleOrOptions, description]);
}
