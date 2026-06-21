import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

function generateRoomId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export default function BurnerPage() {
  redirect(`/burner/${generateRoomId()}`);
}
