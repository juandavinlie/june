import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs"
import type { NextApiRequest, NextApiResponse } from "next"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  if (req.method === "POST") {
    const { storeId } = req.query
    const { name, description, properties, variants, image, link } = req.body
    
    const supabaseServerClient = createServerSupabaseClient({ req, res })
    const { data, error } = await supabaseServerClient
      .from("manual_product")
      .insert({
        name,
        description,
        properties,
        product_variants: variants,
        image,
        product_link: link,
        store_id: storeId,
      })
      .select()

    if (!error) {
      res.status(201).json(data[0])
    } else {
      console.log(error)
      res.status(409).json({ message: error.message })
    }
  }
}
