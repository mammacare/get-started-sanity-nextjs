import { isValidSignature, SIGNATURE_HEADER_NAME } from "@sanity/webhook";

const SANITY_WEBHOOK_SECRET = process.env.SANITY_WEBHOOK_SECRET;

export default async function handler(req, res) {
  const signature = req.headers[SIGNATURE_HEADER_NAME];
  const isValid = isValidSignature(
    JSON.stringify(req.body),
    signature,
    SANITY_WEBHOOK_SECRET
  );

  // Validate signature
  if (!isValid) {
    res.status(401).json({ success: false, message: "Invalid signature" });
    return;
  }

  try {
    const pathToRevalidate = `/post/${req.body.slug}`;

    await res.revalidate(pathToRevalidate);

    return res.json({ revalidated: true });
  } catch (err) {
    // Could not revalidate. The stale page will continue to be shown until
    // this issue is fixed.
    console.log(err);
    return res.status(500).send("Error while revalidating");
  }
}
