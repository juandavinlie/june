import { Store } from "@/models/Store"
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs"
import { NextApiRequest, NextApiResponse } from "next"
import { LATEST_API_VERSION } from "@shopify/shopify-api"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  try {
    const supabaseServerClient = createServerSupabaseClient({ req, res })

    const { shopify_domain, shopify_access_token } = req.query

    const currenciesResponse = await fetch(
      `https://${shopify_domain}/admin/api/${LATEST_API_VERSION}/currencies.json`,
      {
        method: "GET",
        headers: { "X-Shopify-Access-Token": shopify_access_token as string },
      }
    )

    if (!currenciesResponse.ok) {
      throw "Currencies response is not ok"
    }

    const currenciesJson = await currenciesResponse.json()
    const currencies = currenciesJson["currencies"]
    const mainCurrency = currencies[0]["currency"]

    res.status(200).json({ mainCurrency })
  } catch (error) {
    res.status(404).json({ message: error })
  }
}
