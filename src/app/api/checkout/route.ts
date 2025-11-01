import { getUserEmail, getUserUuid } from "@/services/user";
import { insertOrder, OrderStatus, updateOrderSession } from "@/models/order";
import { respData, respErr } from "@/lib/resp";
import { findUserByUuid } from "@/models/user";
import { getSnowId } from "@/lib/hash";
import { getPaymentClient } from "@/integrations/payment";

export async function POST(req: Request) {
  try {
    let { product_id, currency, locale } = await req.json();

    let cancel_url = `${
      process.env.NEXT_PUBLIC_PAY_CANCEL_URL || process.env.NEXT_PUBLIC_WEB_URL
    }`;

    if (!product_id) {
      return respErr("invalid params");
    }

    // TODO: validate product_id against pricing config
    // For now, hardcode pricing
    const pricingConfig: Record<string, any> = {
      starter_monthly: {
        amount: 1800, // $18.00
        credits: 120000, // 120,000 credits (~31 videos @ 3,855 credits/video)
        interval: "month",
        valid_months: 1,
        currency: "usd",
        product_name: "Starter Plan"
      },
      pro_monthly: {
        amount: 3000, // $30.00
        credits: 240000, // 240,000 credits (~62 videos @ 3,855 credits/video)
        interval: "month",
        valid_months: 1,
        currency: "usd",
        product_name: "Pro Plan"
      },
      business_monthly: {
        amount: 8800, // $88.00
        credits: 720000, // 720,000 credits (~186 videos @ 3,855 credits/video)
        interval: "month",
        valid_months: 1,
        currency: "usd",
        product_name: "Business Plan"
      }
    };

    const item = pricingConfig[product_id];
    if (!item) {
      return respErr("invalid product_id");
    }

    let { amount, interval, valid_months, credits, product_name } = item;

    if (!["year", "month", "one-time"].includes(interval)) {
      return respErr("invalid interval");
    }

    if (interval === "year" && valid_months !== 12) {
      return respErr("invalid valid_months");
    }

    if (interval === "month" && valid_months !== 1) {
      return respErr("invalid valid_months");
    }

    if (currency) {
      // Use provided currency
    } else {
      currency = item.currency;
    }

    const is_subscription = interval === "month" || interval === "year";

    // get signed user
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

    // generate order_no
    const order_no = getSnowId();

    const currentDate = new Date();
    const created_at = currentDate.toISOString();

    // calculate expired_at
    let expired_at = "";
    if (valid_months && valid_months > 0) {
      const timePeriod = new Date(currentDate);
      timePeriod.setMonth(currentDate.getMonth() + valid_months);

      const timePeriodMillis = timePeriod.getTime();
      let delayTimeMillis = 0;

      // subscription
      if (is_subscription) {
        delayTimeMillis = 24 * 60 * 60 * 1000; // delay 24 hours expired
      }

      const newTimeMillis = timePeriodMillis + delayTimeMillis;
      const newDate = new Date(newTimeMillis);

      expired_at = newDate.toISOString();
    }

    // create order
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
      product_id: product_id,
      product_name: product_name,
      valid_months: valid_months,
    };
    await insertOrder(order);

    // Use payment factory to get the appropriate client
    const paymentClient = getPaymentClient();

    const success_url = `${process.env.NEXT_PUBLIC_WEB_URL}/api/pay/callback?locale=${locale}&order_no=${order_no}`;

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
        project: process.env.NEXT_PUBLIC_PROJECT_NAME || "",
      },
    });

    // Update order with session information
    await updateOrderSession(order.order_no, result.session_id, JSON.stringify(result));

    return respData(result);
  } catch (e: any) {
    console.log("checkout failed: ", e);
    return respErr("checkout failed: " + e.message);
  }
}
