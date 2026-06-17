import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const BUCKET = "posts";

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { files }: { files: { name: string }[] } = await req.json();
  const admin = createSupabaseAdminClient();

  // Create bucket if it doesn't exist yet
  await admin.storage.createBucket(BUCKET, { public: true }).catch(() => {});

  const results = await Promise.all(
    files.map(async (file, i) => {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
      const path = `${user.id}/${Date.now()}-${i}.${ext}`;

      const { data, error } = await admin.storage.from(BUCKET).createSignedUploadUrl(path);
      if (error) throw new Error(error.message);

      const { data: { publicUrl } } = admin.storage.from(BUCKET).getPublicUrl(path);
      return { signedUrl: data.signedUrl, publicUrl };
    })
  );

  return NextResponse.json({ results });
}
