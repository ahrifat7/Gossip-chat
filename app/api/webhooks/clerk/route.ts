import { Webhook } from "svix/dist/webhook";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { fetchMutation } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { serverClient } from "@/lib/streamServer";

export async function POST(req: Request) {
  const SIGNING_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!SIGNING_SECRET) {
    throw new Error(
      "Error: Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local"
    );
  }

  // Create new Svix instance with secret
  const wh = new Webhook(SIGNING_SECRET);

  // Get headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: Missing Svix headers", {
      status: 400,
    });
  }

  // Get body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  let evt: WebhookEvent;

  // Verify payload with headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error: Could not verify webhook:", err);
    return new Response("Error: Verification error", {
      status: 400,
    });
  }

  const eventType = evt.type;

  if (eventType === "user.deleted") {
    const { id } = evt.data;

    if (id) {
      try {
        // 1. Delete user from Stream Chat
        // We use 'soft' deletion so their old messages are preserved, 
        // but their user is marked deleted. If hard_delete is true, it wipes them out entirely.
        await serverClient.deleteUser(id, {
          hard_delete: true,
          mark_messages_deleted: true,
        });

        // 2. Mark user as deleted in Convex DB
        await fetchMutation(api.users.markUserDeleted, { userId: id });

        console.log(`Successfully deleted user ${id}`);
      } catch (error) {
        console.error(`Error deleting user ${id}:`, error);
        return new Response("Error executing deletion", { status: 500 });
      }
    }
  }

  return new Response("Webhook received", { status: 200 });
}
