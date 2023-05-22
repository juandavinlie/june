import "@shopify/shopify-api/adapters/node"
import { shopifyApi, LATEST_API_VERSION } from "@shopify/shopify-api"

const shopify = shopifyApi({
  apiKey: "eb655cbc69233c10c68716efdac5d3be",
  apiSecretKey: "c38dba027c55d7fdee67ba59bf9d06ab",
  scopes: ["read_products"],
  hostName: "localhost:3000",
  hostScheme: "http",
  apiVersion: LATEST_API_VERSION,
  isEmbeddedApp: false,
  isCustomStoreApp: false,
})

export default shopify
