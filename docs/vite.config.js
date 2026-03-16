import mdx from "@mdx-js/rollup";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import { defineConfig } from "vite";
export default defineConfig({
    plugins: [
        mdx({
            remarkPlugins: [remarkGfm, remarkFrontmatter, remarkMdxFrontmatter],
            rehypePlugins: [rehypeSlug, rehypeAutolinkHeadings],
            providerImportSource: "@mdx-js/react",
        }),
        react(),
        tailwindcss(),
    ],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
});
