import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body?.form || !Array.isArray(body?.items)) {
    return new NextResponse("Invalid payload", { status: 400 });
  }

  const items = body.items as { productId: string; quantity: number }[];
  if (items.length === 0) return new NextResponse("Cart empty", { status: 400 });

  const productIds = items.map((x) => x.productId);
  const { data: products, error: prodErr } = await supabaseAdmin
    .from("products")
    .select("id,title,price_cents,currency,is_published")
    .in("id", productIds)
    .eq("is_published", true);

  if (prodErr || !products?.length) {
    return new NextResponse("Products not found", { status: 400 });
  }

  const map = new Map(products.map((p) => [p.id, p]));
  let total = 0;

  const orderItems = items.map((x) => {
    const p = map.get(x.productId);
    if (!p) throw new Error("Invalid product in cart");
    total += p.price_cents * x.quantity;
    return {
      product_id: p.id,
      title_snapshot: p.title,
      price_cents_snapshot: p.price_cents,
      quantity: x.quantity,
    };
  });

  const order = {
    customer_name: String(body.form.customer_name || ""),
    email: String(body.form.email || ""),
    phone: String(body.form.phone || ""),
    shipping_address: {
      line1: body.form.address_line1,
      city: body.form.city,
      zip: body.form.zip,
      country: body.form.country,
    },
    total_cents: total,
    currency: "EUR",
  };

  if (!order.customer_name || !order.email || !order.shipping_address.line1) {
    return new NextResponse("Missing customer info", { status: 400 });
  }

  const { data: insertedOrder, error: orderErr } = await supabaseAdmin
    .from("orders")
    .insert(order)
    .select("id")
    .single();

  if (orderErr || !insertedOrder) {
    return new NextResponse("Failed to create order", { status: 500 });
  }

  const { error: itemsErr } = await supabaseAdmin
    .from("order_items")
    .insert(orderItems.map((x) => ({ ...x, order_id: insertedOrder.id })));

  if (itemsErr) {
    return new NextResponse("Failed to create order items", { status: 500 });
  }

  return NextResponse.json({ orderId: insertedOrder.id });
}
