import type { Metadata } from 'next';
import BusinessLineDashboard from '@/components/business-line/BusinessLineDashboard';

export const metadata: Metadata = {
  title: 'Business Line — AI Beast Automation',
  description: 'Virtual phone system for AI Beast Automation — (682) 399-3238',
};

export default function BusinessLinePage() {
  return <BusinessLineDashboard />;
}
