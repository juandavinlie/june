import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs"
import { NextApiRequest, NextApiResponse } from "next"
import { openai } from "../../config/openai"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  try {
    if (req.method === "POST") {
      const { storeId } = req.query
      const storeIdString = storeId as string
      const integration = storeIdString.split("_")[0]

      const { prompt, messages } = req.body
      
      
    }
  } catch (error) {
    res.status(404).json({ message: error })
  }
}