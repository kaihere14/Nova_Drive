import Cloudflare from "cloudflare"

export const cf = new Cloudflare({
    apiToken: process.env.CLOUDFLARE_API_TOKEN!
});

export const r2 = cf.r2;