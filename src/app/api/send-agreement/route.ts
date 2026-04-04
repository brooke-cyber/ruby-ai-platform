import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, draft, agreements, tier } = await request.json();

    if (!email || !draft) {
      return NextResponse.json(
        { error: "Email and draft are required" },
        { status: 400 }
      );
    }

    // In production, this would integrate with a transactional email service
    // (e.g., Resend, SendGrid, AWS SES) to deliver the agreement.
    // For now, we log the delivery and return success.
    console.log(`[Agreement Delivery] Sending to: ${email}`);
    console.log(`[Agreement Delivery] Tier: ${tier}`);
    console.log(`[Agreement Delivery] Agreements: ${agreements?.join(", ")}`);
    console.log(`[Agreement Delivery] Draft length: ${draft.length} chars`);

    // TODO: Replace with actual email service integration
    // Example with Resend:
    // await resend.emails.send({
    //   from: 'Ruby Law <agreements@rubylegal.ai>',
    //   to: email,
    //   subject: `Your ${tier === 'counsel' ? 'Counsel-Reviewed' : ''} Agreement — Ruby Law`,
    //   text: draft,
    //   attachments: [{
    //     filename: 'agreement-draft.txt',
    //     content: Buffer.from(draft),
    //   }],
    // });

    return NextResponse.json({
      success: true,
      message: `Agreement delivery queued for ${email}`,
    });
  } catch (err) {
    console.error("Send agreement error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
