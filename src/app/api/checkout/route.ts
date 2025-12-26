import { getUserEmail, getUserUuid } from "@/services/user-session";
import { insertOrder, OrderStatus, updateOrderSession } from "@/models/order";
import { respData, respErr } from "@/lib/resp";
import { findUserByUuid } from "@/models/user";
import { getSnowId } from "@/lib/hash";
import { getPaymentClient } from "@/integrations/payment";

export async function POST(req: Request) {
  try {
    const { product_id, currency: requestedCurrency, locale } = await req.json();

    if (!product_id) {
      return respErr("invalid params");
    }

    // For now, hardcode pricing (Basic/Pro monthly)
    const pricingConfig: Record<string, any> = {
      basic_monthly: {
        amount: 490, // $4.90
        credits: 0,
        interval: "month",
        valid_months: 1,
        currency: "usd",
        product_name: "Basic Monthly",
        creem_product_id: process.env.CREEM_PRODUCT_BASIC_ID || "",
      },
      pro_monthly: {
        amount: 990, // $9.90
        credits: 0,
        interval: "month",
        valid_months: 1,
        currency: "usd",
        product_name: "Pro Monthly",
        creem_product_id: process.env.CREEM_PRODUCT_PRO_ID || "",
      },
    };

    const item = pricingConfig[product_id];
    if (!item) {
      return respErr("invalid product_id");
    }

    const { amount, interval, valid_months, credits, product_name, creem_product_id } = item;

    if (!creem_product_id) {
      return respErr("invalid creem product id");
    }

    if (!["year", "month", "one-time"].includes(interval)) {
      return respErr("invalid interval");
    }

    if (interval === "year" && valid_months !== 12) {
      return respErr("invalid valid_months");
    }

    if (interval === "month" && valid_months !== 1) {
      return respErr("invalid valid_months");
    }

    const currency = requestedCurrency || item.currency;
    const is_subscription = interval === "month" || interval === "year";

    const user_uuid = await getUserUuid();
    if (!user_uuid) {
      return respErr("no auth, please sign-in");
    }

    let user_email = await getUserEmail();
    if (!user_email) {
      const user = await findUserByUuid(user_uuid);
      if (user) {
        user_email = user.email;
      }
    }
    if (!user_email) {
      return respErr("invalid user");
    }

    const order_no = getSnowId();
    const currentDate = new Date();
    const created_at = currentDate.toISOString();

    let expired_at = "";
    if (valid_months && valid_months > 0) {
      const timePeriod = new Date(currentDate);
      timePeriod.setMonth(currentDate.getMonth() + valid_months);

      let delayTimeMillis = 0;
      if (is_subscription) {
        delayTimeMillis = 24 * 60 * 60 * 1000;
      }

      const newDate = new Date(timePeriod.getTime() + delayTimeMillis);
      expired_at = newDate.toISOString();
    }

    const order = {
      order_no: order_no,
      created_at: new Date(created_at),
      user_uuid: user_uuid,
      user_email: user_email,
      amount: amount,
      interval: interval,
      expired_at: expired_at ? new Date(expired_at) : null,
      status: OrderStatus.Created,
      credits: credits || 0,
      currency: currency,
      product_id: creem_product_id,
      product_name: product_name,
      valid_months: valid_months,
    };
    await insertOrder(order);

    const paymentClient = getPaymentClient();
    const success_url = `${process.env.NEXT_PUBLIC_WEB_URL}/api/pay/callback/creem?locale=${locale}&request_id=${order_no}`;
    const cancel_url = `${process.env.NEXT_PUBLIC_PAY_CANCEL_URL || process.env.NEXT_PUBLIC_WEB_URL}`;

    const result = await paymentClient.createCheckout({
      amount: order.amount,
      currency: order.currency,
      product_id: order.product_id,
      product_name: order.product_name,
      credits: order.credits || 0,
      order_no: order.order_no,
      user_email: order.user_email,
      user_uuid: order.user_uuid,
      interval: order.interval,
      valid_months: order.valid_months,
      success_url: success_url,
      cancel_url: cancel_url,
      metadata: {
        plan_key: product_id,
        project: process.env.NEXT_PUBLIC_PROJECT_NAME || "",
      },
    });

    await updateOrderSession(order.order_no, result.session_id, JSON.stringify(result));

    return respData(result);
  } catch (e: any) {
    console.log("checkout failed: ", e);
    return respErr("checkout failed: " + e.message);
  }
}
