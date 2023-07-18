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

    // Retrieve Logged In User
    const {
      data: { user },
    } = await supabaseServerClient.auth.getUser()

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
        throw "Shop response is not ok"
      }

      const shopData = await shopResponse.json()

      const storeId = "shopify_" + shopData.shop.id.toString()
      res.redirect(
        `/stores/?status=new&integration=shopify&shopify_domain=${callbackSession.shop}&shopify_access_token=${shopify_access_token}`
      )
    } else {
      res.redirect(
        `/login?status=new&integration=shopify&shopify_domain=${callbackSession.shop}&shopify_access_token=${shopify_access_token}`
      )
    }
  } catch (error: any) {
    console.log(error.message)
    res.status(404).json({ message: error.message })
  }
}
