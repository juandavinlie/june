import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs"
import type { NextApiRequest, NextApiResponse } from "next"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  if (req.method === "POST") {
    console.log(req.body)
    const { user_id, name, integration, shopify_access_token } = req.body

    const supabaseServerClient = createServerSupabaseClient({ req, res })

    const { data, error } = await supabaseServerClient
      .from("store")
      .insert({
        user_id,
        name,
        integration,
        shopify_access_token,
      })
      .select()

    if (data) {
      res.status(201).json({ data })
    } else {
      res.status(409).json({ message: error.message })
    }
  }
}
