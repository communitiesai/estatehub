import {
  Users, TrendingUp, Sparkles, Check, Calendar, BarChart3, Target, Zap,
  Building2, Mail, Phone, Star, Quote, Search, FileText, Bell,
  Layout, ShieldCheck, Clock, MapPin, MessageSquare,
  ArrowRight, ChevronRight, ChevronDown,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export { Users, TrendingUp, Sparkles, Check, Calendar, BarChart3, Target, Zap, Building2, Mail, Phone, Star, Quote, Search, FileText, Bell, Layout, ShieldCheck, Clock, MapPin, MessageSquare, ArrowRight, ChevronRight, ChevronDown };
export type { LucideIcon };

export const images = {
  hero: 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=1600',
  nightHome: 'https://images.pexels.com/photos/31737859/pexels-photo-31737859.jpeg?auto=compress&cs=tinysrgb&w=1200',
  twoStory: 'https://images.pexels.com/photos/8134821/pexels-photo-8134821.jpeg?auto=compress&cs=tinysrgb&w=800',
  cottage: 'https://images.pexels.com/photos/7031406/pexels-photo-7031406.jpeg?auto=compress&cs=tinysrgb&w=800',
  agentMeeting: 'https://images.pexels.com/photos/8559989/pexels-photo-8559989.jpeg?auto=compress&cs=tinysrgb&w=1200',
  apartments: 'https://images.pexels.com/photos/18153132/pexels-photo-18153132.jpeg?auto=compress&cs=tinysrgb&w=800',
  teamMeeting: 'https://images.pexels.com/photos/10375937/pexels-photo-10375937.jpeg?auto=compress&cs=tinysrgb&w=1200',
  teamPlanning: 'https://images.pexels.com/photos/10375945/pexels-photo-10375945.jpeg?auto=compress&cs=tinysrgb&w=1200',
  agentPortrait1: 'https://images.pexels.com/photos/28442318/pexels-photo-28442318.jpeg?auto=compress&cs=tinysrgb&w=400',
  agentPortrait2: 'https://images.pexels.com/photos/33680700/pexels-photo-33680700.jpeg?auto=compress&cs=tinysrgb&w=400',
  agentPortrait3: 'https://images.pexels.com/photos/8312669/pexels-photo-8312669.jpeg?auto=compress&cs=tinysrgb&w=400',
  agentPortrait4: 'https://images.pexels.com/photos/5308640/pexels-photo-5308640.jpeg?auto=compress&cs=tinysrgb&w=400',
  dealHandshake: 'https://images.pexels.com/photos/8815826/pexels-photo-8815826.jpeg?auto=compress&cs=tinysrgb&w=1200',
  agentsDiscussion: 'https://images.pexels.com/photos/8292780/pexels-photo-8292780.jpeg?auto=compress&cs=tinysrgb&w=1200',
};

export const stats = [
  { value: '12K+', label: 'Active Agents' },
  { value: '4.2M', label: 'Leads Managed' },
  { value: '98%', label: 'Customer Satisfaction' },
  { value: '340K', label: 'Deals Closed' },
];

export const features = [
  { icon: Users, title: 'Lead Management', desc: 'Capture, score, and nurture leads from every channel — portals, social, forms, chatbots, and referrals — in one unified inbox.', longDesc: 'Every lead that enters your system is automatically scored based on engagement, budget, and timeline. Route hot leads to your best closers instantly. No lead ever falls through the cracks.' },
  { icon: Building2, title: 'Listing Inventory', desc: 'Showcase your full property portfolio with rich media, smart search, and automated availability tracking.', longDesc: 'Upload photos, floor plans, and virtual tours. Buyers can search by location, budget, and amenities. Availability updates automatically as deals progress.' },
  { icon: TrendingUp, title: 'Deal Pipeline', desc: 'Visualize every deal from inquiry to close. Drag-and-drop stages, forecast revenue, and never let a deal slip.', longDesc: 'A visual kanban pipeline shows every deal at a glance. Forecast revenue by stage, spot bottlenecks, and receive alerts when deals go cold. Drag-and-drop to move deals forward.' },
  { icon: Calendar, title: 'Appointments', desc: 'Schedule viewings, calls, and meetings with automated reminders synced to your team\'s calendar.', longDesc: 'Book property viewings in seconds. Send clients automatic SMS and email reminders. Sync with Google and Outlook calendars so your team is never double-booked.' },
  { icon: Target, title: 'Task Automation', desc: 'Assign follow-ups, set priorities, and track deadlines so every lead gets the attention it deserves.', longDesc: 'Create recurring task templates for common workflows. Auto-assign tasks based on lead source or stage. Track completion rates across your team to identify who needs support.' },
  { icon: BarChart3, title: 'Analytics & Reports', desc: 'Real-time dashboards on lead conversion, deal velocity, agent performance, and revenue trends.', longDesc: 'Pre-built dashboards show conversion rates, deal velocity, revenue by agent, and lead source ROI. Export custom reports for stakeholders in one click.' },
];

export const detailedFeatures = [
  {
    icon: Search,
    title: 'Smart Lead Scoring',
    desc: 'AI-driven scoring ranks every lead by likelihood to close. Factors include engagement frequency, budget match, response time, and property view history.',
    points: ['Automated 0-100 score on every lead', 'Custom scoring rules per agency', 'Hot lead alerts via SMS and email', 'Score history timeline'],
  },
  {
    icon: FileText,
    title: 'Document Management',
    desc: 'Store agreements, KYC documents, and property papers securely. Generate quotes and agreements with pre-filled templates in one click.',
    points: ['Secure cloud storage with audit trail', 'E-signature integration', 'Template library for common documents', 'Version control on every file'],
  },
  {
    icon: Bell,
    title: 'Automated Workflows',
    desc: 'Trigger follow-ups, status updates, and notifications based on lead behavior. Set rules once and let EstateHub handle the rest.',
    points: ['Visual workflow builder', 'Trigger on stage change, activity, or score', 'Multi-step drip campaigns', 'SMS, email, and WhatsApp actions'],
  },
  {
    icon: Layout,
    title: 'Custom Dashboards',
    desc: 'Build personalized views for each agent, team lead, or broker. Drag widgets, set filters, and save layouts for your daily routine.',
    points: ['Drag-and-drop widget builder', '20+ pre-built chart types', 'Role-based dashboard access', 'Daily digest email summaries'],
  },
  {
    icon: ShieldCheck,
    title: 'Enterprise Security',
    desc: 'Bank-grade encryption, role-based access control, and full audit logs keep your data protected at every layer.',
    points: ['256-bit AES encryption at rest', 'Granular role permissions', 'Complete activity audit trail', 'SOC 2 Type II compliant'],
  },
  {
    icon: MessageSquare,
    title: 'Omnichannel Messaging',
    desc: 'Email, SMS, WhatsApp, and portal messages — all in one shared inbox. Your team sees every conversation in context.',
    points: ['Unified inbox across all channels', 'Context-aware message templates', 'Auto-log every conversation to the lead', 'Team handoff with one click'],
  },
];

export const steps = [
  { icon: Zap, step: '01', title: 'Capture Leads', desc: 'Connect your portals, forms, and social channels. Every inquiry flows into EstateHub automatically — scored and ready for action.', points: ['Connect MagicBricks, 99acres, Housing.com', 'Embed lead capture forms on your site', 'Import CSV lists in one click', 'Social media lead ads integration'] },
  { icon: Users, step: '02', title: 'Nurture Relationships', desc: 'Track every interaction with timestamped notes, automated follow-ups, and AI-driven property recommendations matched to each buyer.', points: ['Timestamped notes on every lead', 'Automated drip campaigns', 'AI property matching by budget & needs', 'Omnichannel messaging in one inbox'] },
  { icon: TrendingUp, step: '03', title: 'Close More Deals', desc: 'Move deals through your pipeline, schedule viewings, and watch your conversion climb — all from one command center.', points: ['Visual drag-and-drop pipeline', 'E-signature for agreements', 'Revenue forecasting by stage', 'Automated post-close follow-ups'] },
];

export const testimonials = [
  { name: 'Priya Sharma', role: 'Founder, Sharma Realty', avatar: 'PS', color: 'bg-blue-500', quote: 'EstateHub transformed how our team operates. We closed 40% more deals in the first quarter — the pipeline visibility alone is worth it.', img: 'https://images.pexels.com/photos/33680700/pexels-photo-33680700.jpeg?auto=compress&cs=tinysrgb&w=200', metric: '+40%', metricLabel: 'More deals closed' },
  { name: 'James Chen', role: 'Senior Agent, Horizon Properties', avatar: 'JC', color: 'bg-emerald-500', quote: 'The lead scoring is scarily accurate. I know exactly who to call first every morning. My conversion rate has nearly doubled.', img: 'https://images.pexels.com/photos/28442318/pexels-photo-28442318.jpeg?auto=compress&cs=tinysrgb&w=200', metric: '2x', metricLabel: 'Conversion rate' },
  { name: 'Aisha Patel', role: 'Broker, Patel & Associates', avatar: 'AP', color: 'bg-amber-500', quote: 'Managing 15 agents used to be chaos. Now everyone has clear tasks, shared listings, and real-time updates. It just works.', img: 'https://images.pexels.com/photos/8312669/pexels-photo-8312669.jpeg?auto=compress&cs=tinysrgb&w=200', metric: '15', metricLabel: 'Agents managed' },
  { name: 'Rohan Mehta', role: 'Director, Mehta Realty Group', avatar: 'RM', color: 'bg-sky-500', quote: 'The analytics dashboards give me real-time visibility into team performance. I can spot bottlenecks before they cost us deals.', img: 'https://images.pexels.com/photos/5308640/pexels-photo-5308640.jpeg?auto=compress&cs=tinysrgb&w=200', metric: '35%', metricLabel: 'Faster sales cycle' },
  { name: 'Neha Gupta', role: 'Independent Agent', avatar: 'NG', color: 'bg-rose-500', quote: 'As a solo agent, EstateHub is like having a full back-office team. The automation handles follow-ups so I can focus on clients.', img: '', metric: '3hrs', metricLabel: 'Saved daily' },
  { name: 'Vikram Singh', role: 'CEO, Singh Estates', avatar: 'VS', color: 'bg-teal-500', quote: 'We switched from spreadsheets to EstateHub and never looked back. The ROI was visible within the first month.', img: '', metric: '200+', metricLabel: 'Deals per year' },
];

export const caseStudies = [
  { agency: 'Sharma Realty', location: 'Mumbai', agents: '8', challenge: 'Leads were scattered across portals, spreadsheets, and WhatsApp. No one knew which leads were hot.', solution: 'Unified all lead sources into EstateHub with automated scoring and routing.', result: '40% more closed deals in Q1', stat: '40%', statLabel: 'More deals', img: 'https://images.pexels.com/photos/33680700/pexels-photo-33680700.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { agency: 'Horizon Properties', location: 'Bangalore', agents: '12', challenge: 'Conversion rates were stagnant. Agents spent hours manually prioritizing leads each morning.', solution: 'Implemented AI lead scoring and automated hot-lead alerts via SMS.', result: 'Conversion rate nearly doubled in 3 months', stat: '2x', statLabel: 'Conversion rate', img: 'https://images.pexels.com/photos/28442318/pexels-photo-28442318.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { agency: 'Patel & Associates', location: 'Ahmedabad', agents: '15', challenge: 'Managing 15 agents with no shared system. Tasks overlapped, listings were duplicated, communication was fragmented.', solution: 'Rolled out EstateHub team workspace with shared listings, tasks, and omnichannel messaging.', result: 'Team productivity up 60%, zero duplicated effort', stat: '60%', statLabel: 'Productivity boost', img: 'https://images.pexels.com/photos/8312669/pexels-photo-8312669.jpeg?auto=compress&cs=tinysrgb&w=600' },
];

export const pricingPlans = [
  { name: 'Starter', price: '₹1,499', period: '/mo', desc: 'For solo agents getting started', features: ['Up to 500 leads', '1 agent seat', 'Lead management', 'Basic analytics', 'Email support', 'Mobile app'], cta: 'Start free trial', highlight: false },
  { name: 'Professional', price: '₹3,999', period: '/mo', desc: 'For growing teams', features: ['Unlimited leads', 'Up to 10 agent seats', 'Full deal pipeline', 'Advanced analytics', 'Campaign automation', 'Priority support', 'Omnichannel messaging', 'Custom dashboards'], cta: 'Start free trial', highlight: true },
  { name: 'Enterprise', price: 'Custom', period: '', desc: 'For large brokerages', features: ['Everything in Professional', 'Unlimited seats', 'Custom integrations', 'Dedicated account manager', 'SLA guarantee', 'Onboarding training', 'SSO & advanced security', 'Custom workflow builder'], cta: 'Contact sales', highlight: false },
];

export const pricingComparison = [
  { feature: 'Lead limit', starter: '500', pro: 'Unlimited', enterprise: 'Unlimited' },
  { feature: 'Agent seats', starter: '1', pro: '10', enterprise: 'Unlimited' },
  { feature: 'Deal pipeline', starter: '—', pro: '✓', enterprise: '✓' },
  { feature: 'Lead scoring', starter: 'Basic', pro: 'AI-powered', enterprise: 'AI + custom rules' },
  { feature: 'Analytics', starter: 'Basic', pro: 'Advanced', enterprise: 'Advanced + custom' },
  { feature: 'Campaign automation', starter: '—', pro: '✓', enterprise: '✓' },
  { feature: 'Omnichannel messaging', starter: '—', pro: '✓', enterprise: '✓' },
  { feature: 'Custom dashboards', starter: '—', pro: '✓', enterprise: '✓' },
  { feature: 'Document management', starter: '—', pro: '✓', enterprise: '✓' },
  { feature: 'API access', starter: '—', pro: '—', enterprise: '✓' },
  { feature: 'SSO', starter: '—', pro: '—', enterprise: '✓' },
  { feature: 'Dedicated manager', starter: '—', pro: '—', enterprise: '✓' },
  { feature: 'Support', starter: 'Email', pro: 'Priority', enterprise: '24/7 + SLA' },
];

export const pricingFaq = [
  { q: 'Can I try EstateHub before paying?', a: 'Yes! Every plan starts with a 14-day free trial. No credit card required. You get full access to all features during the trial.' },
  { q: 'Can I change plans later?', a: 'Absolutely. You can upgrade, downgrade, or cancel at any time from your account settings. Changes take effect immediately with prorated billing.' },
  { q: 'Do you offer annual billing discounts?', a: 'Yes, annual billing saves you 20% compared to monthly. Switch to annual anytime from your billing settings.' },
  { q: 'What happens after my trial ends?', a: 'Your account pauses until you choose a plan. Your data is preserved for 30 days, so you can pick up right where you left off.' },
  { q: 'Is my data secure?', a: 'Yes. We use 256-bit AES encryption, role-based access control, and are SOC 2 Type II compliant. Your data is never shared with third parties.' },
  { q: 'Do you charge per lead?', a: 'No. We charge per agent seat, not per lead. You can manage unlimited leads on Professional and Enterprise plans.' },
];

export const howFaq = [
  { q: 'How long does it take to set up EstateHub?', a: 'Most teams are up and running in under 30 minutes. Import your existing leads via CSV, connect your portals, and you\'re ready to go.' },
  { q: 'Do I need technical knowledge to use it?', a: 'Not at all. EstateHub is designed for real estate professionals, not tech experts. If you can use email, you can use EstateHub.' },
  { q: 'Can I import my existing leads?', a: 'Yes. Upload a CSV or Excel file and we\'ll map the fields automatically. You can also connect MagicBricks, 99acres, and Housing.com for automatic lead sync.' },
  { q: 'Does it work on mobile?', a: 'Yes. EstateHub has a fully responsive web app plus native iOS and Android apps. Manage leads, update deals, and call clients from anywhere.' },
];
