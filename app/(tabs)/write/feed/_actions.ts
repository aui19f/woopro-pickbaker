"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { MediaType } from "@/generated/prisma";

interface MediaInput {
  url: string;
  type: "IMAGE" | "VIDEO";
  order: number;
}

export async function createPost({
  content,
  tags,
  media,
}: {
  content: string;
  tags: string[];
  media: MediaInput[];
}) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const dbUser = await prisma.user.findUnique({ where: { auth_id: user.id } });
  if (!dbUser) throw new Error("User not found");

  await prisma.post.create({
    data: {
      author_id: dbUser.id,
      content,
      media: {
        create: media.map((m) => ({
          url: m.url,
          type: m.type === "VIDEO" ? MediaType.VIDEO : MediaType.IMAGE,
          order: m.order,
        })),
      },
      tags: {
        create: tags.map((name) => ({ name })),
      },
    },
  });

  revalidatePath("/feed");
}
