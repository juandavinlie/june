import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs"
import { NextApiRequest, NextApiResponse } from "next"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  if (req.method === "POST") {
    const updateParams = req.body
    const { storeId } = req.query
    console.log(updateParams)
    const supabaseServerClient = createServerSupabaseClient({ req, res })

    const { data, error } = await supabaseServerClient
      .from("store")
      .update(updateParams)
      .eq("id", storeId)

    if (error) {
      res.status(404).json({ message: error })
    }

    res.status(204).json({ message: "Success updating currency" })
  }
}
