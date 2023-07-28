import { Product } from "./Product"

export class ShopifyProduct extends Product {
  productId: string
  createdAt: Date
  name: string
  description: string
  properties: any[]
  productVariants: any[]
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

  constructEmbeddedString(): string {
    const properties = this.properties
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

    const variants = this.productVariants
    let variantsStringified = ""

    for (let i = 0; i < variants.length; i++) {
      const variant = variants[i]
      const variantStr = `(id: ${this.productId}, title: ${variant.title}, price: ${variant.price}, quantity: ${variant.inventory_quantity})`
      variantsStringified += variantStr
      if (i < variants.length - 1) {
        variantsStringified += ", "
      }
    }

    return `(id: ${this.productId}, name: ${this.name}, description: ${this.description}, properties: (${propertiesStringified}), variants: (${variantsStringified}).)`
  }
}
