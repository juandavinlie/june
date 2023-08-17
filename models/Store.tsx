export class Store {
  storeId: string
  name: string
  userId: string
  integration: string
  shopifyAccessToken: string | null
  shopifyDomain: string | null
  currency: string | null
  currencySymbol: string

  constructor(store: any) {
    this.storeId = store.id
    this.name = store.name
    this.userId = store.user_id
    this.integration = store.integration
    this.shopifyAccessToken = store.shopify_access_token
    this.shopifyDomain = store.shopify_domain
    this.currency = store.currency

    switch (this.currency) {
      case "Indonesian Rupiah (IDR)":
        this.currencySymbol = "Rp"
      case "Singapore Dollars (SGD)":
        this.currencySymbol = "S$"
      default: {
        this.currencySymbol = ""
      }
    }
  }
}
