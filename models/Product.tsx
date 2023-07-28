export abstract class Product {
    abstract productId: string
    abstract createdAt: Date
    abstract name: string
    abstract description: string
    abstract properties: any[]
    abstract productVariants: any[]
    abstract image: string | null
    abstract productTags: string
    abstract storeId: string
    abstract productLink: string
    abstract constructEmbeddedString(): string
}
