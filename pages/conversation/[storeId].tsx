import { Box, InputAdornment, TextField, Typography } from "@mui/material"
import { useRouter } from "next/router"
import { useEffect, useRef, useState } from "react"
import { Store } from "../models/Store"
import SendIcon from "@mui/icons-material/Send"
import { Configuration, OpenAIApi } from "openai"
import { useDispatch, useSelector } from "react-redux"
import { RootState } from "@/redux/config"
import { ShopifyProduct } from "../models/ShopifyProduct"
import { addProducts } from "@/redux/ProductsSlice"
import LoadingChatStripe from "../components/conversation/LoadingChatStripe"
import NormalChatStripe from "../components/conversation/NormalChatStripe"
import RichChatStripe, {
  MessageWithProducts,
} from "../components/conversation/RichChatStripe"
import { ProductDescriptionPair } from "../models/ProductDescriptionPair"

const configuration = new Configuration({
  apiKey: "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",
})
delete configuration.baseOptions.headers["User-Agent"]
const openai = new OpenAIApi(configuration)
const model = "gpt-3.5-turbo-0301"

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
      )}. Don't justify your answers. Jump straight to the answers. Always provide the product id in the format <ID>{id}</ID>. Talk to me like a human. Respond in markdown format.`,
    },
    {
      role: "assistant",
      content:
        "Sure! I will jump straight to the answer. I will always provide the product id in the format <ID>{id}</ID> I will talk like a human. I will respond in markdown format.",
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
    const latestMessages = getLatestMessages()

    const messages =
      latestMessages.length === 0 ? storeInitMessages : latestMessages

    for (let i = 0; i < messages.length; i++) {
      const message = messages[i]
      conversation += message.role + ": " + message.content + ". "
    }

    return conversation
  }

  const getMentionedProductDescriptionPairs = (paragraph: string) => {
    const productDescriptionPairs = []
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

      const description = paragraph.substring(startIdx, openIdTagIdx)
      let product = null

      if (storeProducts && storeProducts[productId]) {
        product = storeProducts[productId]
      }

      productDescriptionPairs.push(
        new ProductDescriptionPair(description, product)
      )

      startIdx = closeIdTagIdx + 5
    }

    const remainingText = paragraph.substring(startIdx)

    if (remainingText.length > 0) {
      productDescriptionPairs.push(
        new ProductDescriptionPair(remainingText, null)
      )
    }

    return productDescriptionPairs
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

      // Contextualise Prompt
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
      try {
        contextualisedPrompt =
          contextualisedPromptResponse.data.choices[0].message!.content
        console.log(contextualisedPrompt)
      } catch (error) {
        console.log(
          "Contextualised Prompt Response invalid, continuing without Contextualised Prompt"
        )
      }

      // Get context for the contextualised prompt
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
              role: "assistant",
              content: `Our store only has the following products available for sale and nothing else: ${context}. I ALWAYS provide the product name and id in the format <ID>{id}</ID> in my response. I ALWAYS respond with product recommendations.`,
            },
          ],
          ...[
            {
              role: "user",
              content: `${prompt}. 
              
              When talking about a particular product, use the following format:
              
              1. {product1_name} - {product1_description}
              
              {product1_id}
        
              2. {product2_name} - {product2_description}
              
              {product2_id}

              Please note that in the case of unknown product_id, you can use the format:
              
              1. {product1_name} - {product1_description}
              
              `,
            },
          ],
        ]
        console.log(messagesWithPromptWithContext)
        const chatResponse = await openai.createChatCompletion({
          model,
          messages: messagesWithPromptWithContext,
          temperature: 0,
        })
        const reply = chatResponse.data.choices[0].message
        console.log(reply)
        if (!reply) {
          throw "No reply received from June"
        }
        const messagesWithPromptAndReply = [
          ...messages,
          ...[
            {
              message: { role: "user", content: prompt },
              productDescriptionPairs:
                getMentionedProductDescriptionPairs(prompt),
            },
          ],
          ...[
            {
              message: reply,
              productDescriptionPairs: getMentionedProductDescriptionPairs(
                reply!.content
              ),
            },
          ],
        ]
        console.log(messagesWithPromptAndReply)
        setMessages(messagesWithPromptAndReply)
        setIsWaitingResponse(false)
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
    getStoreProducts(storeId as string)
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
              <NormalChatStripe content={submittedPrompt!} />
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
