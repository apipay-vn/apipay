import {ApiReferenceReact} from '@scalar/api-reference-react';
import '@scalar/api-reference-react/style.css';
import {Link, useParams} from 'react-router-dom';

export default function ApiReferencePage() {
  const {locale} = useParams<{locale: string}>();

  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          padding: '0.75rem 1.5rem',
          background: 'var(--scalar-background-1, #fff)',
          borderBottom: '1px solid var(--scalar-border-color, #e5e7eb)',
          fontSize: '0.875rem',
        }}
      >
        <Link
          to={`/${locale || 'en'}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            textDecoration: 'none',
            color: 'var(--scalar-color-1, #111)',
            fontWeight: 600,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          ApiPay Docs
        </Link>
        <span style={{color: 'var(--scalar-color-2, #6b7280)'}}>/</span>
        <span style={{color: 'var(--scalar-color-2, #6b7280)'}}>API Reference</span>
      </div>
      <div style={{paddingTop: '3rem'}}>
        <ApiReferenceReact
          configuration={{
            url: '/openapi.json',
            authentication: {
              preferredSecurityScheme: 'bearerAuth',
            },
            hideClientButton: true,
            persistAuth: true,
          }}
        />
      </div>
    </>
  );
}
