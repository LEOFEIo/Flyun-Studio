import { verifySupabaseConnection } from "../../../lib/supabase-public";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return Response.json(await verifySupabaseConnection());
  } catch (error) {
    return Response.json(
      {
        connected: false,
        error: error instanceof Error ? error.message : "Supabase 连接失败",
      },
      { status: 503 },
    );
  }
}
