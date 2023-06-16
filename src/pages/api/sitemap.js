import fs from 'fs';
import path from 'path';
import { getStaticPaths } from '../[...slug]';
import { getStaticPaths as getStaysStaticPaths } from '../stays/[[...slug]]';
import { getStaticPaths as getbookingPolicyPaths } from '../booking-policy/[slug]';
import { getStaticPaths as getExperiencePaths } from '../experience/[slug]';
import { getStaticPaths as getGuideBookPaths } from '../guidebook/[slug]';

// Function to generate the XML content
function generateSitemapXML(pathsArray) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://dev-dreamerswelcome.vercel.app';
  const currentDate = new Date().toISOString();

  let xml = `<?xml version="1.0" encoding="UTF-8"?>`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  // Add static URLs
  xml += `
    <url>
      <loc>${baseUrl}</loc>
      <lastmod>${currentDate}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>1.0</priority>
    </url>
    <url>
      <loc>${baseUrl}/about</loc>
      <lastmod>${currentDate}</lastmod>
      <changefreq>monthly</changefreq>
      <priority>0.8</priority>
    </url>
    <!-- Add more static URLs here -->
  `;

  pathsArray.forEach((path) => {
    if (!Array.isArray(path.params.slug)) {
      path.params.slug = [path.params.slug];
    }

    const slug = path.params.slug.join('/');
    const url = `${baseUrl}/${slug}`;
    xml += `
      <url>
        <loc>${url}</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.5</priority>
      </url>
    `;
  });

  xml += `</urlset>`;
  return xml;
}

export default async function handler(req, res) {
  const pathsArray = [];

  const { paths } = await getStaticPaths();
  pathsArray.push(...paths);

  const stayPathsResult = await getStaysStaticPaths();
  const staysPaths = stayPathsResult.paths;
  pathsArray.push(...staysPaths);

  const bookingPolicyResult = await getbookingPolicyPaths();
  const bookingPolicyPaths = bookingPolicyResult.paths;
  pathsArray.push(...bookingPolicyPaths);

  const experienceResult = await getExperiencePaths();
  const experiencePaths = experienceResult.paths;
  pathsArray.push(...experiencePaths);

  const getGuideBookPathsResult = await getGuideBookPaths();
  const guideBookPaths = getGuideBookPathsResult.paths;
  pathsArray.push(...guideBookPaths);

  const xml = generateSitemapXML(pathsArray);

  const filePath = path.join(process.cwd(), 'public', 'sitemap.xml');
  fs.writeFileSync(filePath, xml);

  res.setHeader('Content-Type', 'text/xml');
  res.send(xml);
}
