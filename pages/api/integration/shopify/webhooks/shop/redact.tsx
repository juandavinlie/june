import getRawBody from "raw-body"
import { createHmac } from "crypto"
import { NextApiRequest, NextApiResponse } from "next"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  if (req.method === "POST") {
    const secretKey = process.env.NEXT_PUBLIC_SHOPIFY_API_SECRET as string

    const hmac = req.headers["X-Shopify-Hmac-Sha256"]

    const rawBody = (await getRawBody(req)) as Buffer

    const hash = createHmac("sha256", secretKey)
      .update(rawBody)
      .digest("base64")

    if (hash !== hmac) {
      res.status(401).json({ message: "Invalid request" })
    } else {
      res.status(200).json({ message: "Received shop/redact webhook" })
    }
  }
}
