import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs"
import { NextApiRequest, NextApiResponse } from "next"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  if (req.method === "GET") {
    const { storeId } = req.query
    const supabaseServerClient = createServerSupabaseClient({ req, res })

    const { data, error } = await supabaseServerClient
      .from("store")
      .select("is_syncing, last_sync_timestamp")
      .eq("id", storeId)

    if (!error) {
      if (data.length === 0) {
        res
          .status(200)
          .json({ message: `No store with store id ${storeId} found` })
      } else {
        res.status(200).json(data[0])
      }
    } else {
      res.status(404).json({ message: error.message })
    }
  }
}
