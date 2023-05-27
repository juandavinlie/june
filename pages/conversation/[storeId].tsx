import { Box, InputAdornment, TextField, Typography } from "@mui/material"
import { useRouter } from "next/router"
import { useEffect, useRef, useState } from "react"
import { Store } from "../models/Store"
import SendIcon from "@mui/icons-material/Send"
import PersonIcon from "@mui/icons-material/Person"
import SmartToyIcon from "@mui/icons-material/SmartToy"
import { Configuration, OpenAIApi } from "openai"
import { useDispatch, useSelector } from "react-redux"
import { RootState } from "@/redux/config"
import { ShopifyProduct } from "../models/ShopifyProduct"
import { addProducts } from "@/redux/ProductsSlice"
import ConversationShopifyProductCard from "../components/ConversationShopifyProductCard"
import { Product } from "../models/Product"

const configuration = new Configuration({
  apiKey: "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",
})
delete configuration.baseOptions.headers["User-Agent"]
const openai = new OpenAIApi(configuration)
const model = "gpt-3.5-turbo-0301"

interface Message {
  role: string
  content: string
}

interface MessageWithProducts {
  message: Message
  products: [Product]
}

interface RichChatStripeProps {
  messageWithProducts: MessageWithProducts
}

const RichChatStripe = ({ messageWithProducts }: RichChatStripeProps) => {
  const isBot = messageWithProducts.message.role === "assistant"
  return (
    <Box
      borderBottom="0.1px solid #D3D3D3"
      width="auto"
      bgcolor={isBot ? "#f7f7f8" : "#ffffff"}
      p="36px 70px"
      display="flex"
      flexDirection="row"
      gap="15px"
    >
      {isBot ? <SmartToyIcon /> : <PersonIcon />}
      <Box display="flex" flexDirection="column" gap="20px">
        <>
          <Typography>{messageWithProducts.message.content}</Typography>
          {messageWithProducts.products &&
            messageWithProducts.products.map((product: Product) => {
              const shopifyProduct = product as ShopifyProduct
              return (
                <ConversationShopifyProductCard
                  product={shopifyProduct}
                  key={shopifyProduct.productId}
                />
              )
            })}
        </>
      </Box>
    </Box>
  )
}

interface NormalChatStripeProps {
  content: string
  isBot: boolean
}

const NormalChatStripe = ({ content, isBot }: NormalChatStripeProps) => {
  return (
    <Box
      borderBottom="0.1px solid #D3D3D3"
      width="auto"
      bgcolor={isBot ? "#f7f7f8" : "#ffffff"}
      p="36px 70px"
      display="flex"
      flexDirection="row"
      gap="15px"
    >
      {isBot ? <SmartToyIcon /> : <PersonIcon />}
      <Typography>{content}</Typography>
    </Box>
  )
}

const LoadingChatStripe = ({ isError }: { isError: boolean }) => {
  return (
    <Box
      borderBottom="0.1px solid #D3D3D3"
      width="auto"
      bgcolor="#f7f7f8"
      p="36px 70px"
      display="flex"
      flexDirection="row"
      gap="15px"
    >
      <SmartToyIcon />
      <Typography color={!isError ? "black" : "red"}>
        {!isError ? "..." : "Something went wrong, please try again."}
      </Typography>
    </Box>
  )
}

const LATEST_FACTOR = 2

const StoreConversationPage = () => {
  const router = useRouter()

  const [store, setStore] = useState<Store | null>(null)
  const storeProducts = useSelector(
    (state: RootState) =>
      state.productsSliceReducer.products[router.query.storeId as string]
  )

  const [prompt, setPrompt] = useState<string>("")
  const [submittedPrompt, setSubmittedPrompt] = useState<string>("")

  const categories = ["snowboards", "wax", "gift card"]

  const storeInitMessages = [
    {
      role: "user",
      content: `You are a store assistant with the main objective of persuading me to buy products from your store which sells ${categories.join(
        ", "
      )}. Don't justify your answers. Don't apologize for mistakes. Jump straight to the answers. Be confident in your answers. Always provide the product id in the format <ID>{id}</ID>. Talk to me like a human.`,
    },
    {
      role: "assistant",
      content:
        "Sure! I will jump straight to the answer. I will be confident in my answers. I will always provide the product id in the format <ID>{id}</ID> I will talk like a human.",
    },
  ]

  const [messages, setMessages] = useState<any>([])

  const [isError, setIsError] = useState<boolean>(false)
  const [isWaitingResponse, setIsWaitingResponse] = useState<boolean>(false)
  const conversationIsNotEmpty =
    (messages && messages.length > 0) || isWaitingResponse

  const bottomPageRef = useRef<HTMLInputElement>(null)

  const dispatch = useDispatch()

  const getStore = async (storeId: string) => {
    setStore(null)
  }

  const getStoreProducts = async (storeId: string) => {
    const response = await fetch(`/api/stores/${storeId}/products`, {
      method: "GET",
    })
    const integration = storeId.split("_")[0]
    if (response.ok) {
      const data = await response.json()
      let products = {}
      if (integration === "shopify") {
        products = Object.assign(
          {},
          ...data.map((product: any) => ({
            [product.id]: new ShopifyProduct(product),
          }))
        )
      }
      dispatch(addProducts({ storeId, products }))
    }
  }

  const getLatestMessages = () => {
    const numMessages = LATEST_FACTOR * 2
    let latestMessages = []
    if (messages.length <= numMessages) {
      latestMessages = messages
    } else {
      latestMessages = messages.slice(-1 * numMessages)
    }

    return latestMessages.map((messageWithProducts: MessageWithProducts) => {
      return messageWithProducts.message
    })
  }

  const getConversationString = () => {
    let conversation = ""
    for (let i = 0; i < storeInitMessages.length; i++) {
      const message = storeInitMessages[i]
      conversation += message.role + ": " + message.content + ". "
    }
    const latestMessages = getLatestMessages()
    for (let i = 0; i < latestMessages.length; i++) {
      const message = latestMessages[i]
      conversation += message.role + ": " + message.content + ". "
    }
    return conversation
  }

  const getMentionedProducts = (paragraph: string) => {
    const mentionedProducts = []
    let startIdx = 0
    while (true) {
      const openIdTagIdx = paragraph.indexOf("<ID>", startIdx)
      if (openIdTagIdx === -1) {
        break
      }
      const closeIdTagIdx = paragraph.indexOf("</ID>", openIdTagIdx)

      const productId = parseInt(
        paragraph.substring(openIdTagIdx + 4, closeIdTagIdx)
      )
      if (storeProducts && storeProducts[productId]) {
        mentionedProducts.push(storeProducts[productId])
      }
      startIdx = closeIdTagIdx
    }
    return mentionedProducts
  }

  const handleSubmit = async (prompt: string) => {
    try {
      setIsError(false)

      if (prompt.length === 0) {
        throw "Prompt is empty"
      }

      setSubmittedPrompt(prompt)
      setIsWaitingResponse(true)
      setPrompt("")

      let conversation = getConversationString()
      conversation += `last_prompt: ${prompt}`

      const keys = [
        "name_of_product_in_reference_by_last_prompt",
        "last_prompt",
      ]
      const contextualisedPromptResponse = await openai.createChatCompletion({
        model,
        messages: [
          {
            role: "user",
            content: `Conversation: ${conversation}. From the conversation only, pick the appropriate values for only the keys: (${keys}) and nothing more. Base your answer only on the conversation given and nothing more. Format it in JSON.`,
          },
        ],
      })

      let contextualisedPrompt = prompt
      if (
        contextualisedPromptResponse &&
        contextualisedPromptResponse.data &&
        contextualisedPromptResponse.data.choices &&
        contextualisedPromptResponse.data.choices[0].message
      ) {
        contextualisedPrompt =
          contextualisedPromptResponse.data.choices[0].message.content
        console.log(contextualisedPrompt)
      } else {
        console.log(contextualisedPromptResponse)
      }

      // Get similar embeddings to the contextualised prompt
      const embeddingsResponse = await fetch(
        `/api/stores/${router.query.storeId}/get_context`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: contextualisedPrompt }),
        }
      )

      if (embeddingsResponse.ok) {
        const data = await embeddingsResponse.json()
        const context = data.context
        console.log(context)

        const latestMessages = getLatestMessages()
        console.log(latestMessages)
        const messagesWithPromptWithContext = [
          ...storeInitMessages,
          ...latestMessages,
          ...[
            {
              role: "user",
              content: `Your store only has the following products available for sale and nothing else: ${context}. Always provide the id of the product in the format <ID>{id}</ID> in your response.`,
            },
          ],
          ...[
            {
              role: "user",
              content: `${prompt}.`,
            },
          ],
        ]
        console.log(messagesWithPromptWithContext)
        const chatResponse = await openai.createChatCompletion({
          model,
          messages: messagesWithPromptWithContext,
          temperature: 0,
        })

        if (
          chatResponse &&
          chatResponse.data &&
          chatResponse.data.choices &&
          chatResponse.data.choices[0].message
        ) {
          const reply = chatResponse.data.choices[0].message
          const messagesWithPromptAndReply = [
            ...messages,
            ...[{ message: { role: "user", content: prompt }, productIds: [] }],
            ...[
              {
                message: reply,
                products: getMentionedProducts(reply.content),
              },
            ],
          ]
          console.log(messagesWithPromptAndReply)
          setMessages(messagesWithPromptAndReply)
          setIsWaitingResponse(false)
        } else {
          throw "No reply received from June"
        }
      } else {
        throw "Embeddings Response is not ok"
      }
    } catch (error) {
      console.log(error)
      if (prompt.length > 0) {
        setIsError(true)
      }
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") {
      handleSubmit(prompt)
    }
  }

  const autoScrollToBottom = () => {
    if (bottomPageRef.current !== null) {
      bottomPageRef.current.scrollIntoView({ behavior: "auto" })
    }
  }

  const smoothScrollToBottom = () => {
    if (bottomPageRef.current !== null) {
      bottomPageRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }

  useEffect(() => {
    autoScrollToBottom()

    if (!router.isReady) return

    const storeId = router.query.storeId
    getStore(storeId as string)
    if (storeProducts === null) getStoreProducts(storeId as string)
  }, [router.isReady])

  useEffect(() => {
    smoothScrollToBottom()
  }, [isWaitingResponse])

  return true ? (
    <Box width="100%" height="100vh">
      <Box
        width="100%"
        position="absolute"
        top="0"
        bottom="150px"
        bgcolor="#ffffff"
        sx={{
          overflowX: "hidden",
          overflowY: "hidden",
          "&:hover": { overflowY: "overlay" },
        }}
      >
        <>
          {conversationIsNotEmpty ? (
            messages.map(
              (messageWithProducts: MessageWithProducts, idx: any) => (
                <RichChatStripe
                  messageWithProducts={messageWithProducts}
                  key={idx}
                />
              )
            )
          ) : (
            <Box
              width="100%"
              height="100%"
              display="flex"
              justifyContent="center"
              alignItems="center"
              bgcolor="#ffffff"
            >
              <Box
                width="80%"
                height="60%"
                display="flex"
                flexDirection="column"
                justifyContent="space-around"
                alignItems="center"
              >
                <Typography variant="h2">Powered by June</Typography>
                <Typography variant="h3">Hello!</Typography>
                <Typography variant="h4">
                  Get started by typing a prompt below
                </Typography>
              </Box>
            </Box>
          )}
          {isWaitingResponse && (
            <>
              <NormalChatStripe content={submittedPrompt!} isBot={false} />
              <LoadingChatStripe isError={isError} />
            </>
          )}
          <Box ref={bottomPageRef} />
        </>
      </Box>
      <Box
        position="absolute"
        left="0"
        right="0"
        bottom="0"
        height="150px"
        display="flex"
        justifyContent="center"
        bgcolor="white"
      >
        {isError ? (
          <Box display="flex" alignItems="center">
            <Box
              onClick={() => {
                handleSubmit(submittedPrompt!)
              }}
              sx={{ textTransform: "none" }}
              style={{ backgroundColor: "transparent" }}
            >
              Regenerate Response
            </Box>
          </Box>
        ) : (
          <TextField
            margin="dense"
            id="input"
            placeholder={
              isWaitingResponse ? "Generating response..." : "Ask Bot"
            }
            type="string"
            variant="outlined"
            fullWidth
            value={prompt}
            onKeyDown={handleKeyPress}
            disabled={isWaitingResponse}
            autoComplete="off"
            style={{
              maxWidth: "770px",
              marginLeft: "1rem",
              marginRight: "1rem",
              marginTop: "2rem",
            }}
            onChange={(e: any) => {
              setPrompt(e.currentTarget.value)
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <SendIcon
                    onClick={() => {
                      handleSubmit(prompt)
                    }}
                    sx={{ "&:hover": { cursor: "pointer" } }}
                  />
                </InputAdornment>
              ),
            }}
          />
        )}
      </Box>
    </Box>
  ) : (
    <Box>Loading</Box>
  )
}

export default StoreConversationPage
