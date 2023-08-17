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

    const { storeId } = req.body

    // Get Store Data
    const { data, error } = await supabaseServerClient
      .from("store")
      .select()
      .eq("id", storeId)

    if (error) {
      throw "Getting Store Data failed"
    }

    if (data.length === 0) {
      res
        .status(404)
        .json({ message: `No store with store id ${storeId} found` })
    }

    const store = new Store(data[0])

    const currenciesResponse = await fetch(
      `https://${
        store!.shopifyDomain
      }/admin/api/${LATEST_API_VERSION}/currencies.json`,
      {
        method: "GET",
        headers: { "X-Shopify-Access-Token": store!.shopifyAccessToken! },
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
