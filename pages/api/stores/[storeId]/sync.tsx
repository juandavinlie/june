import { Store } from "@/models/Store"
import { LATEST_API_VERSION } from "@shopify/shopify-api"
import {
  createServerSupabaseClient,
  SupabaseClient,
} from "@supabase/auth-helpers-nextjs"
import { NextApiRequest, NextApiResponse } from "next"

const getProductTableName = (integration: string) => {
  if (integration === "shopify") {
    return "shopify_product"
  }
  return ""
}

const updateIsSyncingStatus = async (
  supabase: SupabaseClient,
  storeId: string,
  boolValue: boolean
) => {
  const { error } = await supabase
    .from("store")
    .update({ is_syncing: boolValue })
    .eq("id", storeId)

  if (error) {
    throw `Failed updating is_syncing status to ${boolValue}`
  }
}

const updateSyncTimestamp = async (
  supabase: SupabaseClient,
  storeId: string
) => {
  const { error } = await supabase
    .from("store")
    .update({ last_sync_timestamp: new Date().toISOString().toLocaleString() })
    .eq("id", storeId)

  if (error) {
    throw `Failed updating last_sync_timestamp`
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  try {
    if (req.method === "POST") {
      const { storeId } = req.query
      const integration = (storeId as string).split("_")[0]

      const supabaseServerClient = createServerSupabaseClient({ req, res })

      await updateIsSyncingStatus(supabaseServerClient, storeId as string, true)

      // Get Store Data
      const { data, error } = await supabaseServerClient
        .from("store")
        .select()
        .eq("id", storeId)

      if (error) {
        throw "Getting Store Data failed"
      }

      if (data.length === 0) {
        res
          .status(404)
          .json({ message: `No store with store id ${storeId} found` })
      }

      const store = new Store(data[0])

      // Fetch Products Data
      const productsResponse = await fetch(
        `https://${
          store!.shopifyDomain
        }/admin/api/${LATEST_API_VERSION}/products.json`,
        {
          method: "GET",
          headers: { "X-Shopify-Access-Token": store!.shopifyAccessToken! },
        }
      )

      if (!productsResponse.ok) {
        throw "Products response not ok"
      }

      console.log("productResponse is ok")

      // Delete Old Products
      const { error: deleteError } = await supabaseServerClient
        .from(getProductTableName(integration))
        .delete()
        .eq("store_id", store.storeId)

      if (deleteError) {
        throw "Error Deleting Old Products"
      }

      // Sync New Products
      const productsData = await productsResponse.json()
      const productsList: [] = productsData.products

      for (let i = 0; i < productsList.length; i++) {
        console.log("syncing product " + i)
        const product: any = productsList[i]
        const { data, error } = await supabaseServerClient
          .from(getProductTableName(integration))
          .upsert(
            {
              id: product.id,
              created_at: product.created_at,
              name: product.title,
              description: product.body_html,
              properties: product.options,
              product_variants: product.variants,
              image: product.image ? product.image.src : null,
              product_tags: product.tags,
              product_link:
                i % 2 === 0 ? "www.boarder.com/p/" + product.id : null,
              store_id: storeId,
            },
            { onConflict: "id" }
          )
          .select()
        if (error) {
          console.log(
            `Failed upserting product ${product.id} with message: ${error.message}`
          )
        }
      }
      console.log("finished syncing all products")
      await updateSyncTimestamp(supabaseServerClient, storeId as string)

      await updateIsSyncingStatus(
        supabaseServerClient,
        storeId as string,
        false
      )

      res.status(200).json({ status: "Success syncing store data" })
    }
  } catch (error) {
    console.log(error)
    res.status(404).json({ message: error })
  }
}
