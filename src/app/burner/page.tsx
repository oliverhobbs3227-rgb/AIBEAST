import type { Metadata } from 'next';
import BurnerApp from '@/components/burner/BurnerApp';

export const metadata: Metadata = {
  title: 'Burner Chat — AIBEAST',
  description: 'Anonymous ephemeral chat with auto-destruct identity.',
};

export default function BurnerPage() {
  return (
    <main className="min-h-screen bg-black py-8 px-4">
      <BurnerApp />
    </main>
  );
}
