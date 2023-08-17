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

export const currencyLocale = (currency: string | null): string => {
  switch (currency) {
    case "IDR":
      return "id-ID"
    case "SGD":
      return "en-SG"
    default: {
      return "en-US"
    }
  }
}

export const currencyTicker = (currency: string | null): string => {
  switch (currency) {
    case "IDR":
      return "IDR"
    case "SGD)":
      return "SGD"
    default: {
      return "USD"
    }
  }
}
