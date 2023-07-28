import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs"
import { NextApiRequest, NextApiResponse } from "next"

const getProductTableName = (integration: string) => {
  if (integration === "shopify") {
    return "shopify_product"
  } else if (integration === "manual") {
    return "manual_product"
  }
  return ""
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  if (req.method === "GET") {
    const { storeId } = req.query
    const supabaseServerClient = createServerSupabaseClient({ req, res })

    const integration = storeId!.toString().split("_")[0]

    const { data, error } = await supabaseServerClient
      .from(getProductTableName(integration))
      .select()
      .eq("store_id", storeId)
    console.log(data)
    if (!error) {
      res.status(200).json(data)
    } else {
      res.status(404).json({ message: error.message })
    }
  }
}
