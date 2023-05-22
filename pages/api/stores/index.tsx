import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs"
import { NextApiRequest, NextApiResponse } from "next"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  if (req.method === "GET") {
    const supabaseServerClient = createServerSupabaseClient({ req, res })

    const {
      data: { user },
    } = await supabaseServerClient.auth.getUser()

    const { data, error } = await supabaseServerClient
      .from("store")
      .select()
      .eq("user_id", user!.id)
    if (!error) {
      res.status(200).json(data)
    } else {
      res.status(404).json({ message: error.message })
    }
  }
}
