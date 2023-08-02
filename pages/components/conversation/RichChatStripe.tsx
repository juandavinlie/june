import { Product } from "@/models/Product"
import { ShopifyProduct } from "@/models/ShopifyProduct"
import { Box, Typography } from "@mui/material"
import ConversationProductCard from "./ConversationProductCard"
import PersonIcon from "@mui/icons-material/Person"
import SmartToyIcon from "@mui/icons-material/SmartToy"
import { ProductDescriptionPair } from "@/models/ProductDescriptionPair"

export interface Message {
  role: string
  content: string
}

export interface MessageWithProducts {
  message: Message
  productDescriptionPairs: ProductDescriptionPair[]
}

interface RichChatStripeProps {
  messageWithProducts: MessageWithProducts
}

const RichChatStripe = ({ messageWithProducts }: RichChatStripeProps) => {
  const isBot = messageWithProducts.message.role === "assistant"
  return (
    <Box
      borderBottom="0.1px solid #D3D3D3"
      width="100%"
      bgcolor={isBot ? "#f7f7f8" : "#ffffff"}
      p="36px 70px"
      display="flex"
      flexDirection="row"
      gap="15px"
    >
      {isBot ? <SmartToyIcon /> : <PersonIcon />}
      <Box display="flex" flexDirection="column" gap="20px">
        {messageWithProducts.productDescriptionPairs &&
          messageWithProducts.productDescriptionPairs.map(
            (productDescriptionPair: ProductDescriptionPair, idx) => {
              const product = productDescriptionPair.product
              return (
                <Box
                  display="flex"
                  flexDirection="column"
                  width="auto"
                  gap="20px"
                  key={idx}
                >
                  <Typography
                    dangerouslySetInnerHTML={{
                      __html: productDescriptionPair.description,
                    }}
                  />
                  {product && (
                    <ConversationProductCard
                      product={product}
                      key={product.productId}
                    />
                  )}
                </Box>
              )
            }
          )}
      </Box>
    </Box>
  )
}

export default RichChatStripe
