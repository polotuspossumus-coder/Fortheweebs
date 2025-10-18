import React from 'react';
import LegalDocPage from '../../src/components/LegalDocPage';

export default function Page({ title, lastUpdated, version, content }) {
  return <LegalDocPage title={title} lastUpdated={lastUpdated} version={version} content={content} />;
}

export async function getStaticPaths() {
  return {
    paths: [
      { params: { slug: 'privacy-policy' } },
      { params: { slug: 'terms-of-service' } },
    ],
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const fs = require('fs');
  const path = require('path');
  const matter = require('gray-matter');
  const filePath = path.join(process.cwd(), 'public', 'legal', `${params.slug}.md`);
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileContent);

  return {
    props: {
      title: data.title || params.slug,
      lastUpdated: data.lastUpdated || null,
      version: data.version || null,
      requiredAcceptance: data.requiredAcceptance || false,
      content,
    },
  };
}
