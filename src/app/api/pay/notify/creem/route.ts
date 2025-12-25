import { updateOrder } from "@/services/order";
import { findOrderByOrderNo } from "@/models/order";
import { addCreditTransaction, findTransactionByTransNo, TransType } from "@/models/credit";
import { PaymentStatus } from "@/integrations/payment/types";
import { respOk } from "@/lib/resp";

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
    const credits = Number(session.metadata.credits || 0);
    const subscriptionId = session.subscription?.id || session.subscription_id;

    if (!order_no || !user_uuid || !credits) {
      return respOk();
    }

    const order = await findOrderByOrderNo(order_no);
    if (!order) {
      return respOk();
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
          credits: credits,
          order_no: order_no,
        });
      }
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
