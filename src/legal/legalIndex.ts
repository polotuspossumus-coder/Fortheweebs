export interface LegalDocument {
  id: string;
  title: string;
  path: string;
  version: string;
  lastUpdated: string;
  requiredAcceptance: boolean;
  changes?: string[];
}

export const legalIndex: LegalDocument[] = [
  {
    id: 'terms-of-service',
    title: 'Terms of Service',
    path: '/legal/terms-of-service.md',
    version: '1.0.0',
    lastUpdated: '2025-10-11',
    requiredAcceptance: true,
    changes: [
      'Initial release',
      'Added liability disclaimer for creator content',
      'Added data breach waiver',
      'Added no complaints/snitching clause',
      'Clarified user blocking responsibility',
      'Declared zero obligations for Fortheweebs'
    ]
  },
  {
    id: 'privacy-policy',
    title: 'Privacy Policy',
    path: '/legal/privacy-policy.md',
    version: '1.0.0',
    lastUpdated: '2025-10-11',
    requiredAcceptance: true,
    changes: [
      'Initial release',
      'Outlined data collection and usage boundaries',
      'Declared no liability for data breaches',
      'Reinforced no moderation or complaint handling',
      'Added open suggestion policy'
    ]
  },
  {
    id: 'creator-agreement',
    title: 'Creator Agreement',
    path: '/legal/creator-agreement.md',
    version: '1.0.0',
    lastUpdated: '2025-10-11',
    requiredAcceptance: true,
    changes: [
      'Initial release',
      'Declared creator independence',
      'Waived all liability for creator actions',
      'Added indemnification clause',
      'Enforced no complaints/snitching policy',
      'Declared zero obligations and moderation duties',
      'Added user blocking responsibility',
      'Enabled open suggestions'
    ]
  }
];
