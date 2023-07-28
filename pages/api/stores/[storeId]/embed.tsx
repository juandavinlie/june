import {
  createServerSupabaseClient,
  SupabaseClient,
} from "@supabase/auth-helpers-nextjs"
import { NextApiRequest, NextApiResponse } from "next"
import { openai } from "../../config/openai"
import { ShopifyProduct } from "@/models/ShopifyProduct"
import { ManualProduct } from "@/models/ManualProduct"

const getProductTableName = (integration: string) => {
  if (integration === "shopify") {
    return "shopify_product"
  } else if (integration === "manual") {
    return "manual_product"
  }
  return ""
}

const updateIsEmbeddingStatus = async (
  supabase: SupabaseClient,
  storeId: string,
  boolValue: boolean
) => {
  const { error } = await supabase
    .from("store")
    .update({ is_embedding: boolValue })
    .eq("id", storeId)

  if (error) {
    throw `Failed updating is_embedding status to ${boolValue}`
  }
}

const updateHasEmbeddingStatus = async (
  supabase: SupabaseClient,
  storeId: string,
  boolValue: boolean
) => {
  const { error } = await supabase
    .from("store")
    .update({
      has_embeddings: boolValue,
      last_embeddings_timestamp: new Date().toISOString().toLocaleString(),
    })
    .eq("id", storeId)

  if (error) {
    console.log(error)
    throw `Failed updating has_embedding status to ${boolValue}`
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  try {
    if (req.method === "POST") {
      const { storeId } = req.query

      const supabaseServerClient = createServerSupabaseClient({ req, res })
      await updateIsEmbeddingStatus(
        supabaseServerClient,
        storeId as string,
        true
      )

      const integration = storeId!.toString().split("_")[0]
      const { data: products, error: productsError } =
        await supabaseServerClient
          .from(getProductTableName(integration))
          .select()
          .eq("store_id", storeId)

      if (productsError) {
        throw "Error fetching products"
      }
      // TODO: Embed store data

      // Embed products data
      for (let i = 0; i < products.length; i++) {
        let product = null

        if (integration === "shopify") {
          product = new ShopifyProduct(products[i])
        } else if (integration === "manual") {
          product = new ManualProduct(products[i])
        }

        // const product = products[i]
        const embeddedProductString = product!.constructEmbeddedString()

        const embeddingResponse = await openai.createEmbedding({
          model: "text-embedding-ada-002",
          input: embeddedProductString,
        })
        const [{ embedding }] = embeddingResponse.data.data
        const { error: updateEmbeddingError } = await supabaseServerClient
          .from(getProductTableName(integration))
          .update({
            embedded_string: embeddedProductString,
            embedding,
          })
          .eq("id", product!.productId)

        if (updateEmbeddingError) {
          throw "Updating of Embedding went wrong"
        }
      }

      // TODO: Embed orders data

      await updateHasEmbeddingStatus(
        supabaseServerClient,
        storeId as string,
        true
      )

      await updateIsEmbeddingStatus(
        supabaseServerClient,
        storeId as string,
        false
      )

      res.status(200).json({ status: "Success embedding store data" })
    }
  } catch (error) {
    console.log(error)
    res.status(404).json({ message: error })
  }
}
