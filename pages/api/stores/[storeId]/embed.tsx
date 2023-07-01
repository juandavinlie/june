import {
  createServerSupabaseClient,
  SupabaseClient,
} from "@supabase/auth-helpers-nextjs"
import { NextApiRequest, NextApiResponse } from "next"
import { openai } from "../../config/openai"

const getProductTableName = (integration: string) => {
  if (integration === "shopify") {
    return "shopify_product"
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

const constructProductEmbeddedString = (product: any, integration: string) => {
  if (integration === "shopify") {
    const properties = product.properties
    let propertiesStringified = ""

    for (let i = 0; i < properties.length; i++) {
      const property = properties[i]
      const valuesStr = property.values.join(", ")
      const propertyStr = `(property_name: ${property.name}, values: ${valuesStr})`
      propertiesStringified += propertyStr
      if (i < properties.length - 1) {
        propertiesStringified += ", "
      }
    }

    const variants = product.product_variants
    let variantsStringified = ""

    for (let i = 0; i < variants.length; i++) {
      const variant = variants[i]
      const variantStr = `(id: ${product.id}, title: ${variant.title}, price: ${variant.price}, quantity: ${variant.inventory_quantity})`
      variantsStringified += variantStr
      if (i < variants.length - 1) {
        variantsStringified += ", "
      }
    }

    return `(id: ${product.id}, name: ${product.name}, description: ${product.description}, properties: (${propertiesStringified}), variants: (${variantsStringified}).)`
  }
  return ""
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
        const product = products[i]
        const embeddedProductString = constructProductEmbeddedString(
          product,
          integration
        )
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
          .eq("id", product.id)

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
