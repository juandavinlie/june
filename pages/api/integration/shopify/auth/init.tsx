import type { NextApiRequest, NextApiResponse } from "next"
import shopify from "../../../config/shopify"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  console.log("Called /auth/begin")
  await shopify.auth.begin({
    shop: shopify.utils.sanitizeShop(req.query.shop as string, true)!,
    callbackPath: "/api/integration/shopify/auth/callback",
    isOnline: false,
    rawRequest: req,
    rawResponse: res,
  })
}
