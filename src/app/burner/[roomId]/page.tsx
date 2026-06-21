import type { Metadata } from 'next';
import BurnerApp from '@/components/burner/BurnerApp';

export const metadata: Metadata = {
  title: 'Burner Chat',
  description: 'Anonymous ephemeral chat with auto-destruct identity.',
};

export default function BurnerRoomPage({ params }: { params: { roomId: string } }) {
  return (
    <main className="bg-black min-h-[100dvh]">
      <BurnerApp roomId={params.roomId} />
    </main>
  );
}
