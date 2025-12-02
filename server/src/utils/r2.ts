import Cloudflare from "cloudflare";
import { Secret } from "jsonwebtoken";

export const cf = new Cloudflare({
    apiToken: process.env.CLOUDFLARE_API_TOKEN!
});
