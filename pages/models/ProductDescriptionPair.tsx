import { Product } from "./Product"

export class ProductDescriptionPair {
  description: string
  product: Product | null

  constructor(description: string, product: Product | null) {
    this.description = description
    this.product = product
  }
}
