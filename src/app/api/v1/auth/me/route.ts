import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json(
      {
        authenticated: false,
        user: null,
        googleConnected: false,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  }

  return NextResponse.json(
    {
      authenticated: true,
      user: {
        userId: session.user.userId,
        email: session.user.email,
        name: session.user.name,
        picture: session.user.picture,
        isMockUser: Boolean(session.user.isMockUser),
      },
      googleConnected: !session.user.isMockUser,
    },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    }
  );
}
