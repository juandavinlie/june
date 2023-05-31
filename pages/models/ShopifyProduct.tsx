import { Product } from "./Product"

export class ShopifyProduct extends Product {
  productId: string
  createdAt: Date
  name: string
  description: string
  properties: [any]
  productVariants: [any]
  image: string | null
  productTags: string
  storeId: string
  productLink: string

  constructor(product: any) {
    super()
    this.productId = product.id
    this.createdAt = product.created_at
    this.name = product.name
    this.description = product.description
    this.properties = product.properties
    this.productVariants = product.product_variants
    this.image = product.image ? product.image : null
    this.productTags = product.product_tags
    this.storeId = product.store_id
    this.productLink = product.id
  }
}
