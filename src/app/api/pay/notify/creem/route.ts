import { updateOrder } from "@/services/order";
import { findOrderByOrderNo } from "@/models/order";
import { addCreditTransaction, findTransactionByTransNo, TransType } from "@/models/credit";
import { PaymentStatus } from "@/integrations/payment/types";
import { respOk } from "@/lib/resp";
import { resetPreviewCredits } from "@/services/preview-credit";

export async function POST(req: Request) {
  try {
    const creemWebhookSecret = process.env.CREEM_WEBHOOK_SECRET;

    if (!creemWebhookSecret) {
      throw new Error("invalid creem config");
    }

    const sign = req.headers.get("creem-signature") as string;
    const body = await req.text();
    if (!sign || !body) {
      throw new Error("invalid notify data");
    }

    const computedSignature = await generateSignature(body, creemWebhookSecret);

    if (computedSignature !== sign) {
      throw new Error("invalid signature");
    }

    const event = JSON.parse(body);

    const session = event.object;
    const isPaid = session?.order?.status === PaymentStatus.Paid;

    // Ignore test events or incomplete payloads (Creem test webhook)
    if (!session || !isPaid || !session.metadata) {
      return respOk();
    }

    const order_no = session.metadata.order_no;
    const paid_email = session.customer?.email || "";
    const paid_detail = JSON.stringify(session);
    const user_uuid = session.metadata.user_uuid;
    const planKey = session.metadata?.plan_key || "";
    const productId = session.metadata?.product_id || "";
    const subscriptionId = session.subscription?.id || session.subscription_id;

    if (!order_no || !user_uuid) {
      return respOk();
    }

    const order = await findOrderByOrderNo(order_no);
    if (!order) {
      return respOk();
    }

    const basicId = process.env.CREEM_PRODUCT_BASIC_ID || "";
    const proId = process.env.CREEM_PRODUCT_PRO_ID || "";
    let planTier: "basic" | "pro" | null = null;
    if (planKey === "pro_monthly" || productId === proId || order.product_id === proId) {
      planTier = "pro";
    } else if (planKey === "basic_monthly" || productId === basicId || order.product_id === basicId) {
      planTier = "basic";
    }

    if (order.status !== "paid") {
      await updateOrder({ order_no, paid_email, paid_detail });
    } else if (subscriptionId) {
      // Renewal payment: grant credits again (idempotent)
      const transNo = `SUB_RENEW_${subscriptionId}_${session.order.id}`;
      const existing = await findTransactionByTransNo(transNo);
      if (!existing) {
        await addCreditTransaction({
          trans_no: transNo,
          user_uuid: user_uuid,
          trans_type: TransType.Charge,
          credits: 0,
          order_no: order_no,
        });
      }
    }

    if (planTier === "pro") {
      await resetPreviewCredits({
        user_uuid,
        period_end: order.expired_at || null,
      });
    } else if (planTier === "basic") {
      await resetPreviewCredits({
        user_uuid,
        period_end: order.expired_at || null,
        amount: 0,
      });
    }

    return respOk();
  } catch (e: any) {
    console.log("creem notify failed: ", e);
    return Response.json(
      { error: `handle creem notify failed: ${e.message}` },
      { status: 500 }
    );
  }
}

async function generateSignature(
  payload: string,
  secret: string
): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const messageData = encoder.encode(payload);

    const key = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const signature = await crypto.subtle.sign("HMAC", key, messageData);

    const signatureArray = new Uint8Array(signature);
    return Array.from(signatureArray)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  } catch (error: any) {
    throw new Error(`Failed to generate signature: ${error.message}`);
  }
}
