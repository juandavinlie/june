import { NextApiRequest, NextApiResponse } from "next"
import { LATEST_API_VERSION } from "@shopify/shopify-api"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  if (req.method === "GET") {
    const { shopify_domain, shopify_access_token } = req.query

    // Fetch Shop Data
    const shopResponse = await fetch(
      `https://${shopify_domain}/admin/api/${LATEST_API_VERSION}/shop.json`,
      {
        method: "GET",
        headers: {
          "X-Shopify-Access-Token": shopify_access_token!,
        } as HeadersInit,
      }
    )

    if (!shopResponse.ok) {
      res.status(404).json({ message: "Shop response is not ok" })
    }

    console.log("shopResponse is ok")
    const shopData = await shopResponse.json()
    res.status(200).json(shopData)
  }
}
