import { ManualProduct } from "@/models/ManualProduct"
import { ShopifyProduct } from "@/models/ShopifyProduct"

export const objectifyProduct = (product: any, integration: string) => {
  switch (integration) {
    case "shopify":
      return new ShopifyProduct(product)
    case "manual":
      return new ManualProduct(product)
    default:
      return null
  }
}

export const openInNewTab = (url: string) => {
  const newWindow = window.open(url, "_blank", "noopener,noreferrer")
  if (newWindow) newWindow.opener = null
}
