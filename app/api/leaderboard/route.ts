import { NextResponse } from 'next/server';
import { getTopTen } from '@/lib/db/actions';
import { handleApiError } from '@/lib/errors';

export async function GET() {
  try {
    const leaderboard = await getTopTen();
    return NextResponse.json(leaderboard);
  } catch (error) {
    return handleApiError(error);
  }
}
