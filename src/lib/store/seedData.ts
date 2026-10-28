import { Conversation, KnowledgeArticle, ResponseTemplate, Team } from '@/types';

export const SEED_TEAMS: Team[] = [
  { id: 'team-billing', name: 'Billing & Payments', slug: 'billing', member_count: 4, description: 'Invoices, refunds, duplicate charges, payment methods' },
  { id: 'team-tech', name: 'Technical Support', slug: 'tech', member_count: 6, description: 'App bugs, crash diagnostics, API integrations, performance' },
  { id: 'team-security', name: 'Security', slug: 'security', member_count: 3, description: 'Account takeovers, 2FA recovery, audit reviews, suspicious activity' },
  { id: 'team-sales', name: 'Sales', slug: 'sales', member_count: 4, description: 'Enterprise plans, volume pricing, demo requests' },
  { id: 'team-cs', name: 'Customer Success', slug: 'cs', member_count: 5, description: 'Onboarding, feature suggestions, general retention' },
];

export const SEED_KNOWLEDGE_ARTICLES: KnowledgeArticle[] = [
  {
    id: 'kb-1',
    title: 'Duplicate Payment Policy',
    category: 'Billing',
    excerpt: 'Resolution steps and automatic credit process when a customer is billed twice for the same subscription cycle.',
    content: `When a customer is charged twice for the same subscription cycle due to bank processing delays or rapid button clicks:
1. Verify the two distinct charge reference IDs in the Stripe/Braintree billing dashboard.
2. If two active authorizations exist for the same invoice, immediately trigger a full refund for the duplicate transaction.
3. Inform the customer that banks typically reflect the refund within 3–5 business days.
4. Ensure no service interruption or license deactivation occurs on the primary active license.`,
    status: 'approved',
    version: 2,
    updated_at: '2026-10-15T10:00:00Z',
  },
  {
    id: 'kb-2',
    title: 'Refund Eligibility Guidelines',
    category: 'Billing',
    excerpt: 'Standard 14-day money-back guarantee terms and exceptions for annual vs monthly plans.',
    content: `1. Customers requesting cancellation within 14 days of their first initial purchase are eligible for a 100% full refund with no questions asked.
2. For annual renewals, customers who contact support within 7 calendar days of the automated renewal charge can request a full renewal refund.
3. Monthly recurring charges beyond the initial 14-day window are non-refundable, but cancellation prevents any future charges.
4. Duplicate charges or billing system errors are always 100% refundable regardless of tenure.`,
    status: 'approved',
    version: 3,
    updated_at: '2026-10-20T14:30:00Z',
  },
  {
    id: 'kb-3',
    title: 'Payment Issue Troubleshooting',
    category: 'Billing',
    excerpt: 'Resolving failed 3D-Secure verifications, expired cards, and zip code mismatch errors.',
    content: `Common card decline codes and actions:
- 'card_declined' / 'insufficient_funds': Ask customer to contact their card issuer to authorize international SaaS transactions.
- 'incorrect_zip': Ensure the postal code entered matches the cardholder's registered banking billing address.
- 'do_not_honor': Requires customer to speak with fraud prevention department at their bank.
- We support Visa, Mastercard, American Express, PayPal, and ACH transfer for Enterprise accounts.`,
    status: 'approved',
    version: 1,
    updated_at: '2026-09-08T09:15:00Z',
  },
  {
    id: 'kb-4',
    title: 'Account Takeover Prevention',
    category: 'Security',
    excerpt: 'Protocols for handling suspected compromised credentials or unauthorized login reports.',
    content: `Immediate response actions for suspicious login alerts:
1. Invalidate all active browser sessions and API refresh tokens for the reported account.
2. Issue a mandatory password reset email link with a single-use 15-minute token.
3. Review audit logs for unexpected IP addresses or unusual data export spikes.
4. Advise customer to enforce Multi-Factor Authentication (MFA) across all team members.`,
    status: 'approved',
    version: 4,
    updated_at: '2026-10-22T16:00:00Z',
  },
  {
    id: 'kb-5',
    title: '2FA Recovery Guide',
    category: 'Security',
    excerpt: 'Verification procedures when a user loses their authenticator app and backup codes.',
    content: `When a user cannot access their TOTP authenticator device:
1. Request secondary verification from the Workspace Owner or Billing Admin.
2. If the user is the sole Workspace Owner, require government ID or domain DNS TXT record challenge verification.
3. Once verified, support specialists can temporarily bypass 2FA for a 2-hour window to allow re-enrollment.`,
    status: 'approved',
    version: 2,
    updated_at: '2026-09-19T11:45:00Z',
  },
  {
    id: 'kb-6',
    title: 'Login & Session Diagnostics Guide',
    category: 'Technical',
    excerpt: 'Troubleshooting login loops, white screen crashes, and cookie partition issues.',
    content: `Steps to resolve client-side login crashes:
1. Advise customer to try Incognito/Private mode to test if browser extensions (e.g. adblockers) interfere with auth tokens.
2. Ask for user-agent string and OS version.
3. Check browser console logs for Content Security Policy (CSP) violations or CORS errors.
4. Verify whether the organization uses Okta/Azure AD SSO with strict redirect URI rules.`,
    status: 'approved',
    version: 2,
    updated_at: '2026-10-01T12:00:00Z',
  },
  {
    id: 'kb-7',
    title: 'Enterprise Plan Custom Quotes & SLA',
    category: 'Sales',
    excerpt: 'Pricing tiers, volume discounts, 99.95% uptime SLA, and dedicated Slack support channels.',
    content: `Enterprise tier highlights:
- Minimum seat threshold: 25 seats.
- Annual commitment with custom invoice billing (Net 30/60).
- Dedicated customer success manager, custom training webinars, and 1-hour priority SLA.
- HIPAA, SOC 2 Type II, and ISO 27001 compliance documentation available under mutual NDA.`,
    status: 'approved',
    version: 1,
    updated_at: '2026-08-14T08:00:00Z',
  },
  {
    id: 'kb-8',
    title: 'Feature Suggestion & Roadmap Process',
    category: 'General',
    excerpt: 'How user feedback is routed to product managers and logged in product portal.',
    content: `When receiving feature requests:
1. Acknowledge customer creativity and thank them warmly.
2. Record the specific use case, business impact, and user role in Productboard.
3. Provide public roadmap link (roadmap.postmark.internal) so users can vote and subscribe to updates.
4. Never promise specific delivery dates unless committed in an executive release note.`,
    status: 'approved',
    version: 2,
    updated_at: '2026-10-18T10:30:00Z',
  },
];

export const SEED_TEMPLATES: ResponseTemplate[] = [
  {
    id: 'tpl-1',
    title: 'Duplicate Payment Refund Confirmation',
    category: 'Billing',
    shortcut: '/duplicate-refund',
    content: `Hi {{name}},

Thank you for contacting us. I've inspected your billing history and verified that an accidental duplicate charge of {{amount}} took place.

I have submitted a refund request for the duplicate transaction. The funds should return to your original payment method within 3–5 business days depending on your bank's processing schedule.

Please accept our apologies for this inconvenience. Let me know if you need any additional receipts or documentation!

Best regards,
The Support Team`,
  },
  {
    id: 'tpl-2',
    title: 'Login Crash Investigation',
    category: 'Technical',
    shortcut: '/crash-investigation',
    content: `Hi {{name}},

I'm sorry you are experiencing crashes when trying to sign in.

To help our engineering team pinpoint this immediately:
1. What browser and version are you currently using?
2. Does the crash happen when using an incognito/private browser tab?
3. Could you take a screenshot of any error message shown on the screen?

We will escalate this to our senior engineers as soon as you reply.

Best regards,
Technical Support`,
  },
  {
    id: 'tpl-3',
    title: 'Feature Request Thanks & Logging',
    category: 'General',
    shortcut: '/feature-thanks',
    content: `Hi {{name}},

Thank you so much for taking the time to share this feature suggestion with us!

I have logged this directly with our Product Design team. User feedback like yours plays a big role in shaping our upcoming quarterly roadmap.

We truly appreciate your support in making Postmark better!

Warmly,
Customer Success`,
  },
];

export const SEED_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    workspace_id: 'ws-default',
    subject: 'Charged twice for my subscription',
    snippet: 'Hello, I purchased your monthly subs...',
    sender_name: 'Rahul Sharma',
    sender_email: 'rahul.sharma@gmail.com',
    sender_initials: 'RS',
    avatar_color: '#E0E7FF',
    received_at: '10:24 AM',
    status: 'inbox',
    team_id: 'team-billing',
    priority: 'high',
    unread: true,
    starred: true,
    is_demo: true,
    tags: ['High Priority', 'Billing & Payments', 'Needs Review'],
    messages: [
      {
        id: 'msg-1-1',
        conversation_id: 'conv-1',
        sender_name: 'Rahul Sharma',
        sender_email: 'rahul.sharma@gmail.com',
        sender_type: 'customer',
        body_text: `Hello,

I purchased your monthly subscription yesterday, but my bank account has been charged twice. Please check this issue and let me know how I can get my money back.

Thank you,
Rahul Sharma`,
        received_at: '10:24 AM',
      },
    ],
    classification: {
      id: 'cls-1',
      conversation_id: 'conv-1',
      topic: 'Billing & Payments',
      subtopic: 'Duplicate Charge',
      urgency: 'high',
      sentiment: 'frustrated',
      assigned_team: 'Billing Team',
      confidence: 0.94,
      risk_flag: 'Potential payment dispute',
      explanation: 'The customer mentions being charged twice and requests a refund, which clearly indicates a billing issue. The tone suggests frustration and requires prompt attention.',
      needs_human_review: true,
      provider: 'nvidia',
      model: 'meta/llama-3.3-70b-instruct',
      latency_ms: 184,
      created_at: '2026-10-28T10:24:12Z',
    },
    draft: {
      id: 'drf-1',
      conversation_id: 'conv-1',
      version: 1,
      content: `Hi Rahul,

Thank you for bringing this to our attention. I'm sorry for the inconvenience.

Our billing team will review the transactions associated with your subscription to determine whether a duplicate charge occurred. Once we've verified the transactions, we'll update you on the next steps in accordance with our billing policy.

Thank you for your patience.

Best regards,
The Support Team`,
      tone: 'professional',
      is_approved: false,
      provider: 'nvidia',
      model: 'meta/llama-3.3-70b-instruct',
      latency_ms: 320,
      cited_knowledge_ids: ['kb-1', 'kb-2', 'kb-3'],
      created_at: '2026-10-28T10:25:00Z',
      updated_at: '2026-10-28T10:25:00Z',
    },
  },
  {
    id: 'conv-2',
    workspace_id: 'ws-default',
    subject: 'App crashes on login',
    snippet: "I'm unable to log into my account. It s...",
    sender_name: 'Priya Patel',
    sender_email: 'priya.patel@gmail.com',
    sender_initials: 'PP',
    avatar_color: '#FCE7F3',
    received_at: '09:50 AM',
    status: 'inbox',
    team_id: 'team-tech',
    priority: 'high',
    unread: true,
    starred: false,
    is_demo: true,
    tags: ['High Priority', 'Technical Support'],
    messages: [
      {
        id: 'msg-2-1',
        conversation_id: 'conv-2',
        sender_name: 'Priya Patel',
        sender_email: 'priya.patel@gmail.com',
        sender_type: 'customer',
        body_text: `Hi Support,

I'm unable to log into my account. It suddenly displays a blank screen right after I enter my password and hit Enter. I've tried restarting the app twice but nothing changes.

Could someone please look into this urgently?

Thanks,
Priya`,
        received_at: '09:50 AM',
      },
    ],
    classification: {
      id: 'cls-2',
      conversation_id: 'conv-2',
      topic: 'Technical Support',
      subtopic: 'Login Crash',
      urgency: 'high',
      sentiment: 'frustrated',
      assigned_team: 'Technical Support',
      confidence: 0.96,
      risk_flag: 'Service blocker',
      explanation: 'Customer is completely blocked from accessing their account due to a crash upon login.',
      needs_human_review: true,
      provider: 'nvidia',
      model: 'meta/llama-3.3-70b-instruct',
      latency_ms: 165,
      created_at: '2026-10-28T09:50:30Z',
    },
    draft: {
      id: 'drf-2',
      conversation_id: 'conv-2',
      version: 1,
      content: `Hi Priya,

I'm very sorry for the trouble with the login crash!

To help us pinpoint the problem right away, could you let us know whether you are using the desktop application or a web browser? In the meantime, opening the web version in an incognito window often clears cached session errors.

Our engineering team is actively investigating this.

Best regards,
Technical Support`,
      tone: 'empathetic',
      is_approved: false,
      provider: 'nvidia',
      model: 'meta/llama-3.3-70b-instruct',
      latency_ms: 290,
      cited_knowledge_ids: ['kb-6'],
      created_at: '2026-10-28T09:51:15Z',
      updated_at: '2026-10-28T09:51:15Z',
    },
  },
  {
    id: 'conv-3',
    workspace_id: 'ws-default',
    subject: 'Product pricing inquiry',
    snippet: 'Could you please share the pricing f...',
    sender_name: 'Amit Shah',
    sender_email: 'amit.shah@enterprise.co',
    sender_initials: 'AS',
    avatar_color: '#DCFCE7',
    received_at: '09:12 AM',
    status: 'inbox',
    team_id: 'team-sales',
    priority: 'medium',
    unread: false,
    starred: false,
    is_demo: true,
    tags: ['Medium Priority', 'Sales'],
    messages: [
      {
        id: 'msg-3-1',
        conversation_id: 'conv-3',
        sender_name: 'Amit Shah',
        sender_email: 'amit.shah@enterprise.co',
        sender_type: 'customer',
        body_text: `Hello team,

Could you please share the pricing for teams with more than 50 members? We are evaluating Postmark for our customer experience division and would like to know about volume discounts and SLA guarantees.

Best regards,
Amit Shah
Enterprise Procurement Lead`,
        received_at: '09:12 AM',
      },
    ],
    classification: {
      id: 'cls-3',
      conversation_id: 'conv-3',
      topic: 'Sales',
      subtopic: 'Enterprise Pricing',
      urgency: 'medium',
      sentiment: 'positive',
      assigned_team: 'Sales',
      confidence: 0.92,
      explanation: 'Inquiry regarding 50+ user enterprise tier and SLA pricing.',
      needs_human_review: false,
      provider: 'openrouter',
      model: 'meta-llama/llama-3.3-70b-instruct',
      latency_ms: 210,
      created_at: '2026-10-28T09:12:45Z',
    },
    draft: {
      id: 'drf-3',
      conversation_id: 'conv-3',
      version: 1,
      content: `Hi Amit,

Thank you for your interest in Postmark for your customer experience team!

For teams with 50+ members, we offer custom Enterprise packages that include dedicated SLA guarantees (99.95% uptime), volume discounting, custom SSO integration, and a dedicated Success Manager.

I'd be delighted to arrange a brief 15-minute call with our enterprise director to walk through custom pricing. Would tomorrow at 2:00 PM EST work for your schedule?

Best regards,
The Sales Team`,
      tone: 'professional',
      is_approved: false,
      provider: 'openrouter',
      model: 'meta-llama/llama-3.3-70b-instruct',
      latency_ms: 310,
      cited_knowledge_ids: ['kb-7'],
      created_at: '2026-10-28T09:13:20Z',
      updated_at: '2026-10-28T09:13:20Z',
    },
  },
  {
    id: 'conv-4',
    workspace_id: 'ws-default',
    subject: 'Feature suggestion',
    snippet: 'It would be great if you could add a d...',
    sender_name: 'Neha Joshi',
    sender_email: 'neha.j@designco.io',
    sender_initials: 'NJ',
    avatar_color: '#FEF3C7',
    received_at: 'Yesterday',
    status: 'inbox',
    team_id: 'team-cs',
    priority: 'low',
    unread: false,
    starred: false,
    is_demo: true,
    tags: ['Low Priority', 'Customer Success'],
    messages: [
      {
        id: 'msg-4-1',
        conversation_id: 'conv-4',
        sender_name: 'Neha Joshi',
        sender_email: 'neha.j@designco.io',
        sender_type: 'customer',
        body_text: `Hi Postmark team,

It would be great if you could add a dark mode toggle or customizable keyboard shortcuts for quick approvals. Our support agents handle over 100 tickets a day and shortcut navigation would boost productivity significantly.

Keep up the great work!
Neha`,
        received_at: 'Yesterday',
      },
    ],
    classification: {
      id: 'cls-4',
      conversation_id: 'conv-4',
      topic: 'Customer Success',
      subtopic: 'Feature Request',
      urgency: 'low',
      sentiment: 'positive',
      assigned_team: 'Customer Success',
      confidence: 0.95,
      explanation: 'Customer offering constructive product feedback regarding keyboard shortcuts and themes.',
      needs_human_review: false,
      provider: 'nvidia',
      model: 'meta/llama-3.3-70b-instruct',
      latency_ms: 145,
      created_at: '2026-10-27T15:20:00Z',
    },
    draft: {
      id: 'drf-4',
      conversation_id: 'conv-4',
      version: 1,
      content: `Hi Neha,

Thank you so much for the thoughtful suggestion!

Customizable keyboard shortcuts and power-user navigation are definitely high on our radar. I have logged your request directly in our product planning system for our design engineering team to review.

We really appreciate your feedback in helping us make Postmark faster and more ergonomic for support specialists!

Warm regards,
Customer Success Team`,
      tone: 'friendly',
      is_approved: false,
      provider: 'nvidia',
      model: 'meta/llama-3.3-70b-instruct',
      latency_ms: 260,
      cited_knowledge_ids: ['kb-8'],
      created_at: '2026-10-27T15:22:00Z',
      updated_at: '2026-10-27T15:22:00Z',
    },
  },
  {
    id: 'conv-5',
    workspace_id: 'ws-default',
    subject: 'Refund request',
    snippet: 'I would like to request a refund for m...',
    sender_name: 'Karan Mehta',
    sender_email: 'karan.m@startup.dev',
    sender_initials: 'KM',
    avatar_color: '#EDE9FE',
    received_at: 'Yesterday',
    status: 'inbox',
    team_id: 'team-billing',
    priority: 'high',
    unread: false,
    starred: false,
    is_demo: true,
    tags: ['High Priority', 'Billing & Payments'],
    messages: [
      {
        id: 'msg-5-1',
        conversation_id: 'conv-5',
        sender_name: 'Karan Mehta',
        sender_email: 'karan.m@startup.dev',
        sender_type: 'customer',
        body_text: `Hello,

I signed up 4 days ago for the annual plan, but our project requirements changed unexpectedly and we won't be needing the software. Per your 14-day refund policy, I would like to request a full refund to my credit card.

Invoice number: INV-2026-8812.

Thanks,
Karan`,
        received_at: 'Yesterday',
      },
    ],
    classification: {
      id: 'cls-5',
      conversation_id: 'conv-5',
      topic: 'Billing & Payments',
      subtopic: 'Refund Request',
      urgency: 'high',
      sentiment: 'neutral',
      assigned_team: 'Billing Team',
      confidence: 0.98,
      risk_flag: 'Full refund requested within policy window',
      explanation: 'Customer requested refund within the eligible 14-day money-back guarantee window.',
      needs_human_review: true,
      provider: 'nvidia',
      model: 'meta/llama-3.3-70b-instruct',
      latency_ms: 170,
      created_at: '2026-10-27T16:10:00Z',
    },
    draft: {
      id: 'drf-5',
      conversation_id: 'conv-5',
      version: 1,
      content: `Hi Karan,

Thank you for reaching out. 

Since your purchase was made 4 days ago, your account is fully eligible under our 14-day money-back guarantee. I have initiated a 100% refund of your annual subscription for invoice INV-2026-8812.

The refund will appear on your card statement within 3–5 business days. If there's ever an opportunity to work together in the future, we'd love to welcome you back!

Best regards,
The Billing Team`,
      tone: 'professional',
      is_approved: false,
      provider: 'nvidia',
      model: 'meta/llama-3.3-70b-instruct',
      latency_ms: 285,
      cited_knowledge_ids: ['kb-2'],
      created_at: '2026-10-27T16:12:00Z',
      updated_at: '2026-10-27T16:12:00Z',
    },
  },
  {
    id: 'conv-6',
    workspace_id: 'ws-default',
    subject: 'Account security concern',
    snippet: 'I noticed a login from an unknown de...',
    sender_name: 'Simran Kaur',
    sender_email: 'simran.k@fintech.net',
    sender_initials: 'SK',
    avatar_color: '#FEE2E2',
    received_at: 'Yesterday',
    status: 'needs_review',
    team_id: 'team-security',
    priority: 'high',
    unread: false,
    starred: true,
    is_demo: true,
    tags: ['High Priority', 'Security', 'Needs Review'],
    messages: [
      {
        id: 'msg-6-1',
        conversation_id: 'conv-6',
        sender_name: 'Simran Kaur',
        sender_email: 'simran.k@fintech.net',
        sender_type: 'customer',
        body_text: `URGENT:

I received an automated alert about a login to my workspace from Frankfurt, Germany today at 04:12 UTC. I live in Canada and did not initiate this login. 

Has my account been compromised? Please terminate any active sessions immediately.

Simran Kaur`,
        received_at: 'Yesterday',
      },
    ],
    classification: {
      id: 'cls-6',
      conversation_id: 'conv-6',
      topic: 'Security',
      subtopic: 'Unauthorized Login',
      urgency: 'critical',
      sentiment: 'frustrated',
      assigned_team: 'Security',
      confidence: 0.99,
      risk_flag: 'Suspected account takeover',
      explanation: 'Customer reported an unrecognized foreign login. Critical risk requiring immediate session termination.',
      needs_human_review: true,
      provider: 'nvidia',
      model: 'meta/llama-3.3-70b-instruct',
      latency_ms: 195,
      created_at: '2026-10-27T18:00:00Z',
    },
    draft: {
      id: 'drf-6',
      conversation_id: 'conv-6',
      version: 1,
      content: `Hi Simran,

Thank you for alerting us immediately. We have taken precautionary action right away.

All active sessions and authorization tokens on your account have been terminated. We have triggered a secure password reset link to your verified email address. Please follow that link to set a new password and ensure Two-Factor Authentication (2FA) is turned on.

Our security engineering team is actively auditing the IP connection logs and will provide a follow-up report within 2 hours.

Best regards,
Security Operations`,
      tone: 'empathetic',
      is_approved: false,
      provider: 'nvidia',
      model: 'meta/llama-3.3-70b-instruct',
      latency_ms: 340,
      cited_knowledge_ids: ['kb-4', 'kb-5'],
      created_at: '2026-10-27T18:02:00Z',
      updated_at: '2026-10-27T18:02:00Z',
    },
  },
  {
    id: 'conv-7',
    workspace_id: 'ws-default',
    subject: 'Invoice not received',
    snippet: "I haven't received my invoice for this ...",
    sender_name: 'Vikram Rao',
    sender_email: 'vikram.rao@agency.com',
    sender_initials: 'VR',
    avatar_color: '#E0F2FE',
    received_at: 'Apr 10',
    status: 'inbox',
    team_id: 'team-billing',
    priority: 'medium',
    unread: false,
    starred: false,
    is_demo: true,
    tags: ['Medium Priority', 'Billing & Payments'],
    messages: [
      {
        id: 'msg-7-1',
        conversation_id: 'conv-7',
        sender_name: 'Vikram Rao',
        sender_email: 'vikram.rao@agency.com',
        sender_type: 'customer',
        body_text: `Hello support,

Our accounting department needs the tax invoice and receipt for our payment made on April 1st. I looked in my billing portal but could only see the receipt. Could you email a PDF copy of invoice #INV-4921?

Thank you,
Vikram Rao`,
        received_at: 'Apr 10',
      },
    ],
    classification: {
      id: 'cls-7',
      conversation_id: 'conv-7',
      topic: 'Billing & Payments',
      subtopic: 'Invoice Request',
      urgency: 'medium',
      sentiment: 'neutral',
      assigned_team: 'Billing Team',
      confidence: 0.93,
      explanation: 'Customer requests a PDF invoice for tax and accounting records.',
      needs_human_review: false,
      provider: 'openrouter',
      model: 'meta-llama/llama-3.3-70b-instruct',
      latency_ms: 180,
      created_at: '2026-04-10T11:20:00Z',
    },
    draft: {
      id: 'drf-7',
      conversation_id: 'conv-7',
      version: 1,
      content: `Hi Vikram,

Thanks for reaching out!

I have generated the official tax invoice for payment #INV-4921. You can download it directly from your Billing Settings under "Invoices & Receipts", or reply to this message and I will attach it as a direct PDF.

Please let me know if your accounting team requires any custom VAT or tax ID numbers added to the invoice header.

Best regards,
The Billing Team`,
      tone: 'professional',
      is_approved: false,
      provider: 'openrouter',
      model: 'meta-llama/llama-3.3-70b-instruct',
      latency_ms: 300,
      cited_knowledge_ids: ['kb-1', 'kb-3'],
      created_at: '2026-04-10T11:22:00Z',
      updated_at: '2026-04-10T11:22:00Z',
    },
  },
  {
    id: 'conv-8',
    workspace_id: 'ws-default',
    subject: 'Unable to update payment method',
    snippet: "I'm facing an issue while trying to up...",
    sender_name: 'Ananya Verma',
    sender_email: 'ananya.v@techcorp.in',
    sender_initials: 'AV',
    avatar_color: '#FFEDD5',
    received_at: 'Apr 9',
    status: 'inbox',
    team_id: 'team-billing',
    priority: 'medium',
    unread: false,
    starred: false,
    is_demo: true,
    tags: ['Medium Priority', 'Billing & Payments'],
    messages: [
      {
        id: 'msg-8-1',
        conversation_id: 'conv-8',
        sender_name: 'Ananya Verma',
        sender_email: 'ananya.v@techcorp.in',
        sender_type: 'customer',
        body_text: `Hi,

Our corporate credit card expired last week. Whenever I enter the new card details in the Billing portal, I receive a message saying "Verification failed: 3D Secure error". 

How can we resolve this before our monthly renewal fails?

Thanks,
Ananya`,
        received_at: 'Apr 9',
      },
    ],
    classification: {
      id: 'cls-8',
      conversation_id: 'conv-8',
      topic: 'Billing & Payments',
      subtopic: 'Payment Method Error',
      urgency: 'medium',
      sentiment: 'uncertain',
      assigned_team: 'Billing Team',
      confidence: 0.94,
      risk_flag: 'Impending renewal failure',
      explanation: 'Customer experiencing 3D Secure verification error while updating payment card.',
      needs_human_review: false,
      provider: 'nvidia',
      model: 'meta/llama-3.3-70b-instruct',
      latency_ms: 190,
      created_at: '2026-04-09T09:40:00Z',
    },
    draft: {
      id: 'drf-8',
      conversation_id: 'conv-8',
      version: 1,
      content: `Hi Ananya,

Thank you for getting in touch. 3D Secure errors usually occur when a bank's OTP popup is blocked by a browser popup blocker or when international transactions require bank pre-authorization.

Here are two quick steps to complete the update:
1. Temporarily disable any popup blockers or try completing the card update in a private/incognito window.
2. Confirm with your bank that corporate e-mandates / recurring international SaaS charges are enabled.

Your account has a 7-day grace period, so your services will remain active while we get this sorted out.

Best regards,
The Billing Team`,
      tone: 'friendly',
      is_approved: false,
      provider: 'nvidia',
      model: 'meta/llama-3.3-70b-instruct',
      latency_ms: 310,
      cited_knowledge_ids: ['kb-3'],
      created_at: '2026-04-09T09:42:00Z',
      updated_at: '2026-04-09T09:42:00Z',
    },
  },
  {
    id: 'conv-9',
    workspace_id: 'ws-default',
    subject: 'Webhook endpoint returning 500 error',
    snippet: 'Our server has been receiving 500 er...',
    sender_name: 'David Chen',
    sender_email: 'd.chen@cloudscale.io',
    sender_initials: 'DC',
    avatar_color: '#CCFBF1',
    received_at: 'Apr 8',
    status: 'inbox',
    team_id: 'team-tech',
    priority: 'high',
    unread: false,
    starred: false,
    is_demo: true,
    tags: ['High Priority', 'Technical Support'],
    messages: [
      {
        id: 'msg-9-1',
        conversation_id: 'conv-9',
        sender_name: 'David Chen',
        sender_email: 'd.chen@cloudscale.io',
        sender_type: 'customer',
        body_text: `Hello API support,

Starting around 02:00 UTC today, your outgoing webhooks for 'message.classified' events began failing with HTTP 500 internal server errors. We verified our receiving endpoint is returning 200 OK. Is there an issue on your webhook dispatch queue?

David`,
        received_at: 'Apr 8',
      },
    ],
    classification: {
      id: 'cls-9',
      conversation_id: 'conv-9',
      topic: 'Technical Support',
      subtopic: 'API / Webhooks',
      urgency: 'high',
      sentiment: 'frustrated',
      assigned_team: 'Technical Support',
      confidence: 0.95,
      risk_flag: 'API infrastructure anomaly',
      explanation: 'Customer reports 500 errors on webhook delivery pipeline.',
      needs_human_review: true,
      provider: 'nvidia',
      model: 'meta/llama-3.3-70b-instruct',
      latency_ms: 175,
      created_at: '2026-04-08T14:10:00Z',
    },
    draft: {
      id: 'drf-9',
      conversation_id: 'conv-9',
      version: 1,
      content: `Hi David,

Thank you for reporting this immediately.

Our infrastructure team resolved a temporary serialization issue in our webhook retry queue earlier this morning. All affected payloads are currently being redelivered with exponential backoff.

Could you confirm if webhook deliveries have stabilized on your end over the past 30 minutes?

Best regards,
Technical Support Team`,
      tone: 'professional',
      is_approved: false,
      provider: 'nvidia',
      model: 'meta/llama-3.3-70b-instruct',
      latency_ms: 280,
      cited_knowledge_ids: ['kb-6'],
      created_at: '2026-04-08T14:15:00Z',
      updated_at: '2026-04-08T14:15:00Z',
    },
  },
  {
    id: 'conv-10',
    workspace_id: 'ws-default',
    subject: 'SAML SSO integration documentation',
    snippet: 'We are setting up Okta for our compa...',
    sender_name: 'Marcus Brody',
    sender_email: 'm.brody@globaltech.com',
    sender_initials: 'MB',
    avatar_color: '#F1F5F9',
    received_at: 'Apr 7',
    status: 'inbox',
    team_id: 'team-security',
    priority: 'medium',
    unread: false,
    starred: false,
    is_demo: true,
    tags: ['Medium Priority', 'Security'],
    messages: [
      {
        id: 'msg-10-1',
        conversation_id: 'conv-10',
        sender_name: 'Marcus Brody',
        sender_email: 'm.brody@globaltech.com',
        sender_type: 'customer',
        body_text: `Hello,

We are configuring Okta SAML 2.0 single sign-on for our 120-person team. What is the ACS URL and Entity ID we should enter in our identity provider app?

Regards,
Marcus Brody
IT Director`,
        received_at: 'Apr 7',
      },
    ],
    classification: {
      id: 'cls-10',
      conversation_id: 'conv-10',
      topic: 'Security',
      subtopic: 'SAML / SSO',
      urgency: 'medium',
      sentiment: 'neutral',
      assigned_team: 'Security',
      confidence: 0.97,
      explanation: 'Customer requests ACS URL and Entity ID metadata for SAML Okta integration.',
      needs_human_review: false,
      provider: 'openrouter',
      model: 'meta-llama/llama-3.3-70b-instruct',
      latency_ms: 160,
      created_at: '2026-04-07T10:00:00Z',
    },
    draft: {
      id: 'drf-10',
      conversation_id: 'conv-10',
      version: 1,
      content: `Hi Marcus,

Here are the SAML 2.0 configuration details for your Okta tenant:

- ACS URL: https://app.postmark.internal/api/auth/saml/callback
- Entity ID / Audience: urn:postmark:sp:prod
- NameID Format: EmailAddress (urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress)

Once entered, you can upload your Okta metadata XML directly under Settings > Security > Single Sign-On to activate domain verification.

Let us know if you'd like our identity specialist to join a testing session!

Best regards,
Security Operations`,
      tone: 'professional',
      is_approved: false,
      provider: 'openrouter',
      model: 'meta-llama/llama-3.3-70b-instruct',
      latency_ms: 295,
      cited_knowledge_ids: ['kb-5'],
      created_at: '2026-04-07T10:05:00Z',
      updated_at: '2026-04-07T10:05:00Z',
    },
  },
  {
    id: 'conv-11',
    workspace_id: 'ws-default',
    subject: 'Request for GDPR Data Processing Agreement (DPA)',
    snippet: 'Could you please send over your sign...',
    sender_name: 'Elena Rostova',
    sender_email: 'elena@berlinventures.de',
    sender_initials: 'ER',
    avatar_color: '#EDE9FE',
    received_at: 'Apr 6',
    status: 'inbox',
    team_id: 'team-security',
    priority: 'low',
    unread: false,
    starred: false,
    is_demo: true,
    tags: ['Low Priority', 'Security'],
    messages: [
      {
        id: 'msg-11-1',
        conversation_id: 'conv-11',
        sender_name: 'Elena Rostova',
        sender_email: 'elena@berlinventures.de',
        sender_type: 'customer',
        body_text: `Hello,

Our legal compliance counsel requires a countersigned DPA with Standard Contractual Clauses (SCCs) for GDPR compliance. Where can we submit our signed copy?

Thanks,
Elena`,
        received_at: 'Apr 6',
      },
    ],
    classification: {
      id: 'cls-11',
      conversation_id: 'conv-11',
      topic: 'Security',
      subtopic: 'Compliance / DPA',
      urgency: 'low',
      sentiment: 'neutral',
      assigned_team: 'Security',
      confidence: 0.98,
      explanation: 'Customer requests countersigned GDPR Data Processing Agreement.',
      needs_human_review: false,
      provider: 'nvidia',
      model: 'meta/llama-3.3-70b-instruct',
      latency_ms: 150,
      created_at: '2026-04-06T15:30:00Z',
    },
    draft: {
      id: 'drf-11',
      conversation_id: 'conv-11',
      version: 1,
      content: `Hi Elena,

You can execute our pre-signed DPA incorporating the latest EU Standard Contractual Clauses (SCCs) directly via our self-serve legal portal at https://trust.postmark.internal/dpa.

Once you enter your company details and sign digitally, an executed PDF copy will automatically be sent to your legal email address for your records.

Please let us know if your counsel has any specific custom annexes!

Best regards,
Security & Compliance Team`,
      tone: 'professional',
      is_approved: false,
      provider: 'nvidia',
      model: 'meta/llama-3.3-70b-instruct',
      latency_ms: 270,
      cited_knowledge_ids: ['kb-7'],
      created_at: '2026-04-06T15:32:00Z',
      updated_at: '2026-04-06T15:32:00Z',
    },
  },
  {
    id: 'conv-12',
    workspace_id: 'ws-default',
    subject: 'Cannot invite new team member',
    snippet: 'Getting an error: Seat limit exceeded...',
    sender_name: 'Lucas Silva',
    sender_email: 'lucas@saasforge.co',
    sender_initials: 'LS',
    avatar_color: '#FEF3C7',
    received_at: 'Apr 5',
    status: 'inbox',
    team_id: 'team-cs',
    priority: 'low',
    unread: false,
    starred: false,
    is_demo: true,
    tags: ['Low Priority', 'Customer Success'],
    messages: [
      {
        id: 'msg-12-1',
        conversation_id: 'conv-12',
        sender_name: 'Lucas Silva',
        sender_email: 'lucas@saasforge.co',
        sender_type: 'customer',
        body_text: `Hi Support,

I am trying to invite a new developer to our workspace, but the dashboard shows "Seat limit reached". We only have 4 active members out of 5 seats. Could you check why the 5th invitation is blocked?

Thanks,
Lucas`,
        received_at: 'Apr 5',
      },
    ],
    classification: {
      id: 'cls-12',
      conversation_id: 'conv-12',
      topic: 'Customer Success',
      subtopic: 'Seat Allocation',
      urgency: 'low',
      sentiment: 'uncertain',
      assigned_team: 'Customer Success',
      confidence: 0.94,
      explanation: 'Customer experiencing seat limit issue with pending unaccepted invitations.',
      needs_human_review: false,
      provider: 'openrouter',
      model: 'meta-llama/llama-3.3-70b-instruct',
      latency_ms: 155,
      created_at: '2026-04-05T12:00:00Z',
    },
    draft: {
      id: 'drf-12',
      conversation_id: 'conv-12',
      version: 1,
      content: `Hi Lucas,

I looked into your workspace seat allocation. You currently have 4 active members and 1 pending invitation sent last week, which reserves the 5th seat.

If that pending invitation is no longer needed, you can revoke it under Settings > Team Members > Pending Invites, which will immediately free up the seat for your new developer!

Let me know if you run into any trouble.

Best regards,
Customer Success Team`,
      tone: 'friendly',
      is_approved: false,
      provider: 'openrouter',
      model: 'meta-llama/llama-3.3-70b-instruct',
      latency_ms: 260,
      cited_knowledge_ids: ['kb-8'],
      created_at: '2026-04-05T12:03:00Z',
      updated_at: '2026-04-05T12:03:00Z',
    },
  },
  {
    id: 'conv-13',
    workspace_id: 'ws-default',
    subject: 'Slow email response generation',
    snippet: 'AI drafting takes over 15 seconds to...',
    sender_name: 'Rachel Zane',
    sender_email: 'rachel@lawcraft.com',
    sender_initials: 'RZ',
    avatar_color: '#E0E7FF',
    received_at: 'Apr 4',
    status: 'inbox',
    team_id: 'team-tech',
    priority: 'medium',
    unread: false,
    starred: false,
    is_demo: true,
    tags: ['Medium Priority', 'Technical Support'],
    messages: [
      {
        id: 'msg-13-1',
        conversation_id: 'conv-13',
        sender_name: 'Rachel Zane',
        sender_email: 'rachel@lawcraft.com',
        sender_type: 'customer',
        body_text: `Hi there,

Normally AI draft response generation takes 1–2 seconds, but this afternoon it has taken upwards of 15 seconds or timed out twice. Is there high traffic or a model degradation today?

Rachel`,
        received_at: 'Apr 4',
      },
    ],
    classification: {
      id: 'cls-13',
      conversation_id: 'conv-13',
      topic: 'Technical Support',
      subtopic: 'Performance & Latency',
      urgency: 'medium',
      sentiment: 'frustrated',
      assigned_team: 'Technical Support',
      confidence: 0.93,
      explanation: 'Customer inquiring about temporary AI inference latency spike.',
      needs_human_review: false,
      provider: 'nvidia',
      model: 'meta/llama-3.3-70b-instruct',
      latency_ms: 160,
      created_at: '2026-04-04T16:15:00Z',
    },
    draft: {
      id: 'drf-13',
      conversation_id: 'conv-13',
      version: 1,
      content: `Hi Rachel,

Thank you for reporting this. One of our upstream inference clusters experienced brief queue congestion earlier today between 14:00 and 15:00 UTC. 

Our dynamic fallback router has redirected traffic to our secondary low-latency cluster, and average response times have returned to under 1.2 seconds.

Please let us know if you notice any further delays!

Best regards,
Technical Support`,
      tone: 'professional',
      is_approved: false,
      provider: 'nvidia',
      model: 'meta/llama-3.3-70b-instruct',
      latency_ms: 275,
      cited_knowledge_ids: ['kb-6'],
      created_at: '2026-04-04T16:18:00Z',
      updated_at: '2026-04-04T16:18:00Z',
    },
  },
  {
    id: 'conv-14',
    workspace_id: 'ws-default',
    subject: 'Partnership & integration request',
    snippet: 'We build an analytics dashboard and...',
    sender_name: 'Tariq Al-Mansoor',
    sender_email: 'tariq@metricsflow.io',
    sender_initials: 'TA',
    avatar_color: '#DCFCE7',
    received_at: 'Apr 3',
    status: 'inbox',
    team_id: 'team-sales',
    priority: 'low',
    unread: false,
    starred: false,
    is_demo: true,
    tags: ['Low Priority', 'Sales'],
    messages: [
      {
        id: 'msg-14-1',
        conversation_id: 'conv-14',
        sender_name: 'Tariq Al-Mansoor',
        sender_email: 'tariq@metricsflow.io',
        sender_type: 'customer',
        body_text: `Hello Partnerships,

We build a CX analytics platform used by 200+ Shopify merchants. We would love to explore building an official Postmark integration to stream ticket sentiment and AI confidence metrics into our client reports. Who is the right person to speak with?

Best,
Tariq`,
        received_at: 'Apr 3',
      },
    ],
    classification: {
      id: 'cls-14',
      conversation_id: 'conv-14',
      topic: 'Sales',
      subtopic: 'Technology Partnership',
      urgency: 'low',
      sentiment: 'positive',
      assigned_team: 'Sales',
      confidence: 0.91,
      explanation: 'Inquiry regarding technology ecosystem partnership and analytics integration.',
      needs_human_review: false,
      provider: 'openrouter',
      model: 'meta-llama/llama-3.3-70b-instruct',
      latency_ms: 170,
      created_at: '2026-04-03T11:00:00Z',
    },
    draft: {
      id: 'drf-14',
      conversation_id: 'conv-14',
      version: 1,
      content: `Hi Tariq,

Thanks for reaching out! We are always excited to collaborate with ecosystem partners that provide value to our mutual customers.

I have connected you with our Technology Partnerships Lead, Sarah Lin (partners@postmark.internal). She will follow up with our developer sandbox credentials and integration guide.

Looking forward to what we can build together!

Warmly,
Partnerships Team`,
      tone: 'friendly',
      is_approved: false,
      provider: 'openrouter',
      model: 'meta-llama/llama-3.3-70b-instruct',
      latency_ms: 250,
      cited_knowledge_ids: ['kb-7'],
      created_at: '2026-04-03T11:04:00Z',
      updated_at: '2026-04-03T11:04:00Z',
    },
  },
  {
    id: 'conv-15',
    workspace_id: 'ws-default',
    subject: 'Request to delete workspace data (GDPR Right to be Forgotten)',
    snippet: 'Please delete all stored email logs an...',
    sender_name: 'Sophie Martin',
    sender_email: 'sophie.m@lumiere.fr',
    sender_initials: 'SM',
    avatar_color: '#FCE7F3',
    received_at: 'Apr 2',
    status: 'needs_review',
    team_id: 'team-security',
    priority: 'high',
    unread: false,
    starred: true,
    is_demo: true,
    tags: ['High Priority', 'Security', 'Needs Review'],
    messages: [
      {
        id: 'msg-15-1',
        conversation_id: 'conv-15',
        sender_name: 'Sophie Martin',
        sender_email: 'sophie.m@lumiere.fr',
        sender_type: 'customer',
        body_text: `Under Article 17 of the General Data Protection Regulation (GDPR), I hereby request the permanent erasure of all personal data, email message history, and customer identifiers associated with our closed workspace 'Lumiere SAS'.

Please confirm once the deletion pipeline has completed.

Sophie Martin`,
        received_at: 'Apr 2',
      },
    ],
    classification: {
      id: 'cls-15',
      conversation_id: 'conv-15',
      topic: 'Security',
      subtopic: 'GDPR Erasure',
      urgency: 'high',
      sentiment: 'neutral',
      assigned_team: 'Security',
      confidence: 0.99,
      risk_flag: 'Formal GDPR erasure request',
      explanation: 'Customer submitting formal Article 17 erasure request requiring human security verification.',
      needs_human_review: true,
      provider: 'nvidia',
      model: 'meta/llama-3.3-70b-instruct',
      latency_ms: 180,
      created_at: '2026-04-02T13:45:00Z',
    },
    draft: {
      id: 'drf-15',
      conversation_id: 'conv-15',
      version: 1,
      content: `Hi Sophie,

We have received your formal request for data erasure under Article 17 of GDPR for workspace 'Lumiere SAS'.

Our data protection team has queued your account for cryptographic hard deletion across our primary database and replica archives. The deletion protocol takes up to 72 hours to propagate across backup retention vaults. 

We will send a formal Certificate of Erasure to this email address once finalized.

Best regards,
Data Protection Officer (DPO)`,
      tone: 'professional',
      is_approved: false,
      provider: 'nvidia',
      model: 'meta/llama-3.3-70b-instruct',
      latency_ms: 310,
      cited_knowledge_ids: ['kb-4', 'kb-7'],
      created_at: '2026-04-02T13:48:00Z',
      updated_at: '2026-04-02T13:48:00Z',
    },
  },
  {
    id: 'conv-16',
    workspace_id: 'ws-default',
    subject: 'Cannot connect Gmail account via OAuth',
    snippet: 'Google shows "This app is blocked" sc...',
    sender_name: 'Benjamin Cole',
    sender_email: 'bencole@nexusgrowth.com',
    sender_initials: 'BC',
    avatar_color: '#E0F2FE',
    received_at: 'Apr 1',
    status: 'inbox',
    team_id: 'team-tech',
    priority: 'high',
    unread: false,
    starred: false,
    is_demo: true,
    tags: ['High Priority', 'Technical Support'],
    messages: [
      {
        id: 'msg-16-1',
        conversation_id: 'conv-16',
        sender_name: 'Benjamin Cole',
        sender_email: 'bencole@nexusgrowth.com',
        sender_type: 'customer',
        body_text: `Hi,

I am trying to connect our Google Workspace inbox under Settings > Integrations. When I click Connect Gmail, Google displays a screen saying "Access blocked: This app's request is invalid". 

Is there an admin permission in Google Workspace Admin Console that I must enable first?

Thanks,
Ben`,
        received_at: 'Apr 1',
      },
    ],
    classification: {
      id: 'cls-16',
      conversation_id: 'conv-16',
      topic: 'Technical Support',
      subtopic: 'OAuth / Gmail Integration',
      urgency: 'high',
      sentiment: 'frustrated',
      assigned_team: 'Technical Support',
      confidence: 0.95,
      explanation: 'Customer encountering Google Workspace OAuth restriction screen during onboarding.',
      needs_human_review: true,
      provider: 'openrouter',
      model: 'meta-llama/llama-3.3-70b-instruct',
      latency_ms: 195,
      created_at: '2026-04-01T10:15:00Z',
    },
    draft: {
      id: 'drf-16',
      conversation_id: 'conv-16',
      version: 1,
      content: `Hi Ben,

Thanks for reaching out! In Google Workspace organizations with strict API controls, third-party apps require admin approval before users can consent to scopes.

To whitelist Postmark in your Google Workspace Admin Console:
1. Navigate to admin.google.com > Security > Access and data control > API controls.
2. Under "App access control", add Postmark's OAuth Client ID and mark it as "Trusted".

Once saved, the OAuth authorization screen will allow you to connect your support inbox smoothly.

Best regards,
Technical Support`,
      tone: 'professional',
      is_approved: false,
      provider: 'openrouter',
      model: 'meta-llama/llama-3.3-70b-instruct',
      latency_ms: 330,
      cited_knowledge_ids: ['kb-6'],
      created_at: '2026-04-01T10:18:00Z',
      updated_at: '2026-04-01T10:18:00Z',
    },
  },
  {
    id: 'conv-17',
    workspace_id: 'ws-default',
    subject: 'High priority bug: Draft response losing formatting',
    snippet: 'Bullet points and line breaks get cl...',
    sender_name: 'Chloe Dubois',
    sender_email: 'chloe@atelier.co',
    sender_initials: 'CD',
    avatar_color: '#FEF3C7',
    received_at: 'Mar 31',
    status: 'inbox',
    team_id: 'team-tech',
    priority: 'medium',
    unread: false,
    starred: false,
    is_demo: true,
    tags: ['Medium Priority', 'Technical Support'],
    messages: [
      {
        id: 'msg-17-1',
        conversation_id: 'conv-17',
        sender_name: 'Chloe Dubois',
        sender_email: 'chloe@atelier.co',
        sender_type: 'customer',
        body_text: `Hello,

When our agents edit an AI draft to add numbered steps or bullet points, after clicking Send, the customer receives plain text with all linebreaks collapsed into one paragraph. Could you fix the MIME multipart encoder?

Chloe`,
        received_at: 'Mar 31',
      },
    ],
    classification: {
      id: 'cls-17',
      conversation_id: 'conv-17',
      topic: 'Technical Support',
      subtopic: 'Email Formatting Bug',
      urgency: 'medium',
      sentiment: 'neutral',
      assigned_team: 'Technical Support',
      confidence: 0.94,
      explanation: 'Customer reporting line break and bullet point formatting issue in dispatched emails.',
      needs_human_review: false,
      provider: 'nvidia',
      model: 'meta/llama-3.3-70b-instruct',
      latency_ms: 155,
      created_at: '2026-03-31T14:00:00Z',
    },
    draft: {
      id: 'drf-17',
      conversation_id: 'conv-17',
      version: 1,
      content: `Hi Chloe,

Thank you for reporting this detailed edge case!

Our email dispatch service now preserves both plaintext \r\n line breaks and automatically formats HTML paragraphs (<p> and <br /> tags) in the MIME multipart body, ensuring numbered lists and spacing render crisp across Gmail, Outlook, and Apple Mail.

A hotfix has been deployed. Please let us know if your team notices any formatting discrepancies!

Best regards,
The Engineering Team`,
      tone: 'professional',
      is_approved: false,
      provider: 'nvidia',
      model: 'meta/llama-3.3-70b-instruct',
      latency_ms: 270,
      cited_knowledge_ids: ['kb-6'],
      created_at: '2026-03-31T14:04:00Z',
      updated_at: '2026-03-31T14:04:00Z',
    },
  },
  {
    id: 'conv-18',
    workspace_id: 'ws-default',
    subject: 'Downgrade to Starter Plan inquiry',
    snippet: 'Will we lose our custom response tem...',
    sender_name: 'Liam Gallagher',
    sender_email: 'liam@manchestercreative.uk',
    sender_initials: 'LG',
    avatar_color: '#E0E7FF',
    received_at: 'Mar 30',
    status: 'inbox',
    team_id: 'team-billing',
    priority: 'low',
    unread: false,
    starred: false,
    is_demo: true,
    tags: ['Low Priority', 'Billing & Payments'],
    messages: [
      {
        id: 'msg-18-1',
        conversation_id: 'conv-18',
        sender_name: 'Liam Gallagher',
        sender_email: 'liam@manchestercreative.uk',
        sender_type: 'customer',
        body_text: `Hello,

We are considering downsizing from Pro to the Starter tier next month. If we downgrade, will our saved response templates and knowledge base articles remain intact?

Cheers,
Liam`,
        received_at: 'Mar 30',
      },
    ],
    classification: {
      id: 'cls-18',
      conversation_id: 'conv-18',
      topic: 'Billing & Payments',
      subtopic: 'Plan Downgrade',
      urgency: 'low',
      sentiment: 'positive',
      assigned_team: 'Billing Team',
      confidence: 0.96,
      explanation: 'Customer asking whether knowledge articles and templates are retained on plan downgrade.',
      needs_human_review: false,
      provider: 'openrouter',
      model: 'meta-llama/llama-3.3-70b-instruct',
      latency_ms: 145,
      created_at: '2026-03-30T16:20:00Z',
    },
    draft: {
      id: 'drf-18',
      conversation_id: 'conv-18',
      version: 1,
      content: `Hi Liam,

Great news: absolutely yes! All of your knowledge base articles, response templates, and historical conversation audits are permanently retained in your workspace. 

When downgrading to Starter, your templates remain accessible, but monthly AI drafting requests will adjust to the Starter tier quota at the beginning of the new billing cycle.

Let us know if you need any assistance managing the change under your Billing tab!

Best regards,
The Support Team`,
      tone: 'friendly',
      is_approved: false,
      provider: 'openrouter',
      model: 'meta-llama/llama-3.3-70b-instruct',
      latency_ms: 260,
      cited_knowledge_ids: ['kb-2'],
      created_at: '2026-03-30T16:23:00Z',
      updated_at: '2026-03-30T16:23:00Z',
    },
  },
  {
    id: 'conv-19',
    workspace_id: 'ws-default',
    subject: 'Compliment: Fantastic AI draft accuracy',
    snippet: 'Just wanted to share some praise for...',
    sender_name: 'Zoe Washington',
    sender_email: 'zoe@hypergrowth.co',
    sender_initials: 'ZW',
    avatar_color: '#DCFCE7',
    received_at: 'Mar 29',
    status: 'inbox',
    team_id: 'team-cs',
    priority: 'low',
    unread: false,
    starred: true,
    is_demo: true,
    tags: ['Low Priority', 'Customer Success'],
    messages: [
      {
        id: 'msg-19-1',
        conversation_id: 'conv-19',
        sender_name: 'Zoe Washington',
        sender_email: 'zoe@hypergrowth.co',
        sender_type: 'customer',
        body_text: `Hey team!

Just wanted to send a quick note of appreciation. We've been using Postmark for two weeks now, and our team response time dropped from 4 hours to 18 minutes. The draft responses grounded in our refund and technical KB articles are remarkably accurate.

Kudos to your product and engineering team!

Zoe`,
        received_at: 'Mar 29',
      },
    ],
    classification: {
      id: 'cls-19',
      conversation_id: 'conv-19',
      topic: 'Customer Success',
      subtopic: 'Customer Praise',
      urgency: 'low',
      sentiment: 'positive',
      assigned_team: 'Customer Success',
      confidence: 0.99,
      explanation: 'Customer sending unsolicited positive feedback regarding product productivity improvements.',
      needs_human_review: false,
      provider: 'nvidia',
      model: 'meta/llama-3.3-70b-instruct',
      latency_ms: 135,
      created_at: '2026-03-29T11:00:00Z',
    },
    draft: {
      id: 'drf-19',
      conversation_id: 'conv-19',
      version: 1,
      content: `Hi Zoe,

Messages like yours genuinely make our entire team's week! 

Hearing that your response time dropped from 4 hours to 18 minutes while keeping accuracy high is the exact reason we built Postmark. We've shared your note with our entire team.

If there's ever anything we can do to make your workflow even smoother, we are always just a message away!

Warmest regards,
The Postmark Team`,
      tone: 'friendly',
      is_approved: false,
      provider: 'nvidia',
      model: 'meta/llama-3.3-70b-instruct',
      latency_ms: 240,
      cited_knowledge_ids: ['kb-8'],
      created_at: '2026-03-29T11:03:00Z',
      updated_at: '2026-03-29T11:03:00Z',
    },
  },
  {
    id: 'conv-20',
    workspace_id: 'ws-default',
    subject: 'Security Audit & Penetration Test Report request',
    snippet: 'Our Chief Information Security Offic...',
    sender_name: 'Hiroshi Tanaka',
    sender_email: 'h.tanaka@tokyofinance.jp',
    sender_initials: 'HT',
    avatar_color: '#F1F5F9',
    received_at: 'Mar 28',
    status: 'inbox',
    team_id: 'team-security',
    priority: 'medium',
    unread: false,
    starred: false,
    is_demo: true,
    tags: ['Medium Priority', 'Security'],
    messages: [
      {
        id: 'msg-20-1',
        conversation_id: 'conv-20',
        sender_name: 'Hiroshi Tanaka',
        sender_email: 'h.tanaka@tokyofinance.jp',
        sender_type: 'customer',
        body_text: `Hello Security Officer,

Before approving our annual procurement renewal, our CISO requires your latest SOC 2 Type II attestation report and third-party penetration test executive summary. 

Could you please share these documents or let us know if an NDA is required first?

Thank you,
Hiroshi Tanaka
Head of Information Security Compliance`,
        received_at: 'Mar 28',
      },
    ],
    classification: {
      id: 'cls-20',
      conversation_id: 'conv-20',
      topic: 'Security',
      subtopic: 'Compliance / SOC 2',
      urgency: 'medium',
      sentiment: 'neutral',
      assigned_team: 'Security',
      confidence: 0.98,
      explanation: 'Customer requests SOC 2 Type II audit report and pen test summary for security compliance review.',
      needs_human_review: false,
      provider: 'nvidia',
      model: 'meta/llama-3.3-70b-instruct',
      latency_ms: 160,
      created_at: '2026-03-28T09:30:00Z',
    },
    draft: {
      id: 'drf-20',
      conversation_id: 'conv-20',
      version: 1,
      content: `Hi Hiroshi,

Thank you for reaching out. We maintain continuous SOC 2 Type II and ISO 27001 compliance with automated monitoring.

You can access our security documentation, latest third-party penetration test summary, and compliance attestations on our Trust Portal:
https://trust.postmark.internal/security-overview

If your organization has not yet executed our digital Mutual Non-Disclosure Agreement (MNDA), the portal will prompt you to complete a brief e-signature before unlocking the unredacted audit report.

Best regards,
Security & Compliance Team`,
      tone: 'professional',
      is_approved: false,
      provider: 'nvidia',
      model: 'meta/llama-3.3-70b-instruct',
      latency_ms: 285,
      cited_knowledge_ids: ['kb-7'],
      created_at: '2026-03-28T09:33:00Z',
      updated_at: '2026-03-28T09:33:00Z',
    },
  },
];
