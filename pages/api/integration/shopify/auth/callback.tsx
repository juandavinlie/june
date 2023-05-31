import { LATEST_API_VERSION } from "@shopify/shopify-api"
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs"
import type { NextApiRequest, NextApiResponse } from "next"
import shopify from "../../../config/shopify"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  try {
    console.log("Called callback")

    const callback = await shopify.auth.callback({
      rawRequest: req,
      rawResponse: res,
    })
    const callbackSession = callback.session
    const shopify_access_token = callbackSession.accessToken

    console.log("Callback Session:")
    console.log(callbackSession)

    // Create a Server Supabase Client Instance
    const supabaseServerClient = createServerSupabaseClient({
      req,
      res,
    })

    // Retrieved Logged In User
    const {
      data: { user },
    } = await supabaseServerClient.auth.getUser()

    console.log("Retrieved Supabase Auth Session")
    console.log(user)

    // If user exists and Shopify accessToken is valid, insert a new store
    if (user && callbackSession.accessToken) {
      console.log("Supabase Auth Session is valid, proceeding")

      // Fetch Shop Data
      const shopResponse = await fetch(
        `https://${callbackSession.shop}/admin/api/${LATEST_API_VERSION}/shop.json`,
        {
          method: "GET",
          headers: { "X-Shopify-Access-Token": shopify_access_token! },
        }
      )

      if (!shopResponse.ok) {
        throw "Shop response not ok"
      }

      console.log("shopResponse is ok")

      // Fetch Products Data
      const productsResponse = await fetch(
        `https://${callbackSession.shop}/admin/api/${LATEST_API_VERSION}/products.json`,
        {
          method: "GET",
          headers: { "X-Shopify-Access-Token": shopify_access_token! },
        }
      )

      if (!productsResponse.ok) {
        throw "Products response not ok"
      }

      console.log("productResponse is ok")

      // Create Store
      const shopData = await shopResponse.json()

      const storeId = "shopify_" + shopData.shop.id.toString()
      const { data, error } = await supabaseServerClient
        .from("store")
        .upsert(
          {
            id: storeId,
            user_id: user.id,
            name: shopData.shop.name,
            integration: "shopify",
            shopify_access_token,
            shopify_domain: callbackSession.shop,
          },
          { onConflict: "id" }
        )
        .select()

      if (error) {
        throw "Error upserting store"
      }
      console.log("createStore is ok")

      // Sync Products
      const productsData = await productsResponse.json()
      const productsList: [] = productsData.products

      for (let i = 0; i < productsList.length; i++) {
        console.log("product " + i)
        const product: any = productsList[i]
        const { data, error } = await supabaseServerClient
          .from("shopify_product")
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
          console.log(error.message)
        }
      }
      console.log("getting products is ok")

      res.redirect(`/store/${storeId}`)
    } else {
      throw "Error"
    }
  } catch (error: any) {
    console.log(error.message)
    res.status(404).json({ message: error.message })
  }
}
