import { NextRequest, NextResponse } from 'next/server';
import { registerAndSyncUser, saveScore } from '@/lib/db/actions';
import { adminAuth } from '@/lib/firebase-admin';
import { handleApiError, apiError, ErrorCode } from '@/lib/errors';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return apiError('Missing authorization header', ErrorCode.UNAUTHORIZED, 401);
    }

    const idToken = authHeader.split('Bearer ')[1];
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(idToken);
    } catch (e) {
      return apiError('Invalid or expired token', ErrorCode.UNAUTHORIZED, 401);
    }

    const { uid, name, picture, email } = decodedToken;
    const body = await req.json();
    const { score, phone, idCard } = body;

    // Production-Grade: Atomically sync PII and save score
    await registerAndSyncUser(uid, {
      displayName: name || null,
      photoUrl: picture || null,
      email: email || null,
      phone: phone || null,
      idCard: idCard || null
    });

    if (typeof score === 'number') {
      await saveScore(uid, score);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
