import fs from "node:fs";
import path from "node:path";
import Image from "@11ty/eleventy-img";

const ICON_DIR = "node_modules/lucide-static/icons";
const iconCache = new Map();

export default function (eleventyConfig) {
  // Files copied to the output unchanged
  eleventyConfig.addPassthroughCopy({ "src/static": "/" });
  eleventyConfig.addPassthroughCopy("src/assets/css");
  eleventyConfig.addPassthroughCopy("src/assets/js");
  eleventyConfig.addPassthroughCopy("src/assets/fonts");
  eleventyConfig.addPassthroughCopy("src/assets/docs");
  eleventyConfig.addPassthroughCopy("src/assets/images/brand");
  eleventyConfig.addPassthroughCopy({ "src/CNAME": "CNAME" });
  eleventyConfig.addWatchTarget("src/assets/");

  // {% icon "name", "extra-class" %} — inline Lucide icon (decorative)
  eleventyConfig.addShortcode("icon", (name, cls = "") => {
    if (!iconCache.has(name)) {
      const file = path.join(ICON_DIR, `${name}.svg`);
      if (!fs.existsSync(file)) throw new Error(`Unknown icon "${name}" (see lucide.dev/icons)`);
      const svg = fs
        .readFileSync(file, "utf8")
        .replace(/<!--.*?-->/s, "")
        .replace(/\s*\n\s*/g, " ")
        .replace(/class="[^"]*"/, "")
        .replace(/ width="24" height="24"/, "")
        .replace('stroke-width="2"', 'stroke-width="1.6"')
        .trim();
      iconCache.set(name, svg);
    }
    return iconCache.get(name).replace("<svg", `<svg class="icon ${cls}" aria-hidden="true" focusable="false"`);
  });

  // {% image "/assets/images/x.jpg", "Alt text", "sizes", "eager", "class" %} — responsive, optimised image
  eleventyConfig.addAsyncShortcode("image", async (src, alt, sizes = "100vw", loading = "lazy", cls = "") => {
    if (alt === undefined) throw new Error(`Missing alt text for ${src}`);
    const metadata = await Image(path.join("src", src), {
      widths: [480, 960, 1600],
      formats: ["avif", "webp", "jpeg"],
      outputDir: "_site/assets/img/",
      urlPath: "/assets/img/",
      sharpJpegOptions: { quality: 78, progressive: true },
      sharpWebpOptions: { quality: 76 },
      sharpAvifOptions: { quality: 55 },
    });
    return Image.generateHTML(metadata, {
      alt,
      sizes,
      loading,
      decoding: "async",
      ...(loading === "eager" ? { fetchpriority: "high" } : {}),
      ...(cls ? { class: cls } : {}),
    });
  });

  // URL of the largest JPEG rendition (for lightbox links)
  eleventyConfig.addAsyncShortcode("imageUrl", async (src) => {
    const metadata = await Image(path.join("src", src), {
      widths: [480, 960, 1600],
      formats: ["avif", "webp", "jpeg"],
      outputDir: "_site/assets/img/",
      urlPath: "/assets/img/",
    });
    const jpegs = metadata.jpeg;
    return jpegs[jpegs.length - 1].url;
  });

  eleventyConfig.addFilter("absUrl", (url, base) => new URL(url, base).href);
  eleventyConfig.addFilter("year", () => new Date().getFullYear());
  eleventyConfig.addFilter("isoDate", (d) => new Date(d).toISOString().slice(0, 10));
  eleventyConfig.addFilter("byGroup", (list, group) => list.filter((s) => s.group === group));
  eleventyConfig.addFilter("except", (list, slug) => list.filter((s) => s.slug !== slug));
  eleventyConfig.addFilter("where", (list, key, val) => list.filter((x) => x[key] === val));
  eleventyConfig.addFilter("pad", (n) => String(n).padStart(2, "0"));
  eleventyConfig.addFilter("json", (v) => JSON.stringify(v));

  return {
    dir: { input: "src", includes: "_includes", data: "_data", output: "_site" },
    templateFormats: ["njk", "md", "11ty.js"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
}
