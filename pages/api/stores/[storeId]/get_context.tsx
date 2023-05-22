import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs"
import { NextApiRequest, NextApiResponse } from "next"
import { openai } from "../../config/openai"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  try {
    if (req.method === "POST") {
      console.log("Called get context api")
      const { storeId } = req.query
      const storeIdString = storeId as string
      const integration = storeIdString.split("_")[0]

      const { prompt } = req.body

      const embeddingResponse = await openai.createEmbedding({
        model: "text-embedding-ada-002",
        input: prompt,
      })
      console.log("done embedding prompt")
      const [{ embedding }] = embeddingResponse.data.data
      console.log(embedding)
      const supabaseServerClient = createServerSupabaseClient({ req, res })
      console.log("calling rpc")
      const { data: similarContext, error: getSimilarContextError } =
        await supabaseServerClient.rpc(`match_${integration}_store_data`, {
          query_embedding: embedding,
          match_threshold: 0,
          match_count: 5,
          store_id: storeId,
        })

      if (getSimilarContextError) {
        throw "Getting similar context resulted in error"
      }
      console.log("finished calling rpc")

      let productsString = ""
      for (let i = 0; i < similarContext.length; i++) {
        const curContext = similarContext[i]
        productsString += curContext.content
        if (i < similarContext.length - 1) {
          productsString += ", \n"
        }
      }

      const productsStringWithInstruction = `${productsString}. Products are separated by commas and details are defined as key value pairs.`
      res.status(201).json({ context: productsStringWithInstruction })
    }
  } catch (error) {
    res.status(404).json({ message: error })
  }
}
