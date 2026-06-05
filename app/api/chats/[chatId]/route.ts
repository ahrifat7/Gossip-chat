import { auth } from "@clerk/nextjs/server";
import { verifyAdmin } from "@/actions/groups";
import { v2 as cloudinary } from "cloudinary";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ chatId: string }> | { chatId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    // Resolve params properly across Next.js versions
    const resolvedParams = await Promise.resolve(context.params);
    const chatId = resolvedParams.chatId;

    if (!chatId) {
      return new Response(JSON.stringify({ error: "Missing chat ID" }), { status: 400 });
    }

    // Verify admin
    let channel;
    try {
      const result = await verifyAdmin(chatId, userId);
      channel = result.channel;
    } catch (error: any) {
      return new Response(JSON.stringify({ error: error.message }), { status: 403 });
    }

    const body = await request.json();
    const { groupName, groupImage } = body;

    const updates: { name?: string; image?: string } = {};

    if (groupName) {
      updates.name = groupName.trim();
    }

    if (groupImage) {
      // Upload base64 image to Cloudinary
      // groupImage should be a base64 string like "data:image/jpeg;base64,..."
      try {
        const uploadResponse = await cloudinary.uploader.upload(groupImage, {
          folder: "gossip_groups",
        });
        updates.image = uploadResponse.secure_url;
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError);
        return new Response(JSON.stringify({ error: "Failed to upload image" }), { status: 500 });
      }
    }

    if (Object.keys(updates).length > 0) {
      await channel.updatePartial({ set: updates as any });
    }

    return new Response(JSON.stringify({ success: true, updates }), { status: 200 });
  } catch (error: any) {
    console.error("PATCH /api/chats/[chatId] error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}
