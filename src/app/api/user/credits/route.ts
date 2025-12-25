import { getUserUuid } from "@/services/user-session";
import { getUserCredits } from "@/services/credit";
import { respData, respErr } from "@/lib/resp";

export async function GET() {
  try {
    const user_uuid = await getUserUuid();

    if (!user_uuid) {
      return respErr("Not authenticated");
    }

    const credits = await getUserCredits(user_uuid);

    return respData(credits);
  } catch (error: any) {
    console.error("Failed to get user credits:", error);
    return respErr("Failed to get user credits");
  }
}
