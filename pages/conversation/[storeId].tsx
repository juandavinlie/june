import { Box, InputAdornment, TextField, Typography } from "@mui/material"
import { useRouter } from "next/router"
import { useEffect, useRef, useState } from "react"
import { Store } from "../../models/Store"
import SendIcon from "@mui/icons-material/Send"
import { Configuration, OpenAIApi } from "openai"
import { useDispatch, useSelector } from "react-redux"
import { RootState } from "@/redux/config"
import { addProducts } from "@/redux/ProductsSlice"
import LoadingChatStripe from "../components/conversation/LoadingChatStripe"
import NormalChatStripe from "../components/conversation/NormalChatStripe"
import RichChatStripe, {
  MessageWithProducts,
} from "../components/conversation/RichChatStripe"
import { ProductDescriptionPair } from "../../models/ProductDescriptionPair"
import { Product } from "@/models/Product"
import { objectifyProduct } from "@/utils"
import LoadingWidget from "../components/common/LoadingWidget"

const configuration = new Configuration({
  apiKey: process.env.NEXT_PUBLIC_OPEN_AI_KEY,
})
delete configuration.baseOptions.headers["User-Agent"]
const openai = new OpenAIApi(configuration)
const model = "gpt-3.5-turbo"

const LATEST_FACTOR = 2
const NEED_TO_SUMMARISE = false

const StoreConversationPage = () => {
  const router = useRouter()

  const [store, setStore] = useState<Store | null>(null)
  const storeProducts: { [id: string]: Product } = useSelector(
    (state: RootState) =>
      state.productsSliceReducer.products[router.query.storeId as string]
  )

  const [prompt, setPrompt] = useState<string>("")
  const [submittedPrompt, setSubmittedPrompt] = useState<string>("")

  const categories = ["snowboards", "wax", "gift card"]
  const samplePrompts = [
    "Give me product recommendations",
    "What is your best-selling product?",
    "I am buying a gift",
  ]

  const getSystemMessage = (context: string) => {
    //that sells ${categories.join(", ")}
    return [
      {
        role: "user",
        content: `You are a store assistant with the main objective of persuading me to buy products from your store. Your store ONLY sells the following products: ${context}. Your response must ONLY be STRICTLY based on these products and NOTHING MORE. When asked about products you don't have information on or do not sell, simply say "I don't have the relevant information". Don't justify your answers. Talk to me like a human.
              
      When talking about multiple products, you always end a product's description with its product id, use the following format:

      1. {product1_name} - {product1_description}
      
      <ID>{product1_id}</ID>

      2. {product2_name} - {product2_description}
      
      <ID>{product2_id}</ID>

      Note that product_description is optional, however product_name and product_id are compulsory EVERYTIME. You ALWAYS PROVIDE the product id whenever talking about a particular product so that the user understands which product you are referring to.

      `,
      },
    ]
  }

  const reminderMessages = [
    {
      role: "user",
      content:
        "Remember to always accompany a product name with its product id in the format: <ID>{product_id}</ID>.",
    },
    {
      role: "assistant",
      content:
        "I will always accompany a product name with its product id in the format: <ID>{product_id}</ID>.",
    },
  ]

  const storeInitMessages = [
    {
      role: "user",
      content: `You are a store assistant with the main objective of persuading me to buy products from your store which sells ${categories.join(
        ", "
      )}. Don't justify your answers. Jump straight to the answers. Talk to me like a human.
              
      When talking about multiple products, always end a product's description with its product id, use the following format:

      1. {product1_name} - {product1_description}
      
      <ID>{product1_id}</ID>

      2. {product2_name} - {product2_description}
      
      <ID>{product2_id}</ID>

      Note that product_description is optional, however product_name and product_id are COMPULSORY EVERYTIME.

      `,
    },
    {
      role: "assistant",
      content:
        "Sure! I will jump straight to the answer. I will always provide the product id in the format <ID>{id}</ID> I will talk like a human.",
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
    const response = await fetch(`/api/stores/${storeId}`, {
      method: "GET",
    })
    if (response.ok) {
      const data = await response.json()
      const store = new Store(data)
      setStore(store)
    }
  }

  const getStoreProducts = async (storeId: string) => {
    const response = await fetch(`/api/stores/${storeId}/products`, {
      method: "GET",
    })
    const integration = storeId.split("_")[0]
    if (response.ok) {
      const data = await response.json()
      let productsMap = Object.assign(
        {},
        ...data.map((product: any) => ({
          [product.id]: objectifyProduct(product, integration),
        }))
      )

      dispatch(addProducts({ storeId, productsMap }))
    }
  }

  const getLatestMessages = (summarise: boolean) => {
    const numMessages = LATEST_FACTOR * 2
    let latestMessages = []
    if (messages.length <= numMessages) {
      latestMessages = messages
    } else {
      latestMessages = messages.slice(-1 * numMessages)
    }

    return latestMessages.map((messageWithProducts: MessageWithProducts) => {
      const message = messageWithProducts.message

      if (message.role === "user" || !summarise) {
        return message
      }

      const sentences = message.content.split(/[.?!:\n]/)
      let summarisedMessage = ""
      let sentenceIdx = 0

      while (sentenceIdx < sentences.length) {
        const sentence = sentences[sentenceIdx].trim()
        if (sentence.length === 0) {
          sentenceIdx += 1
          continue
        }

        const words = sentence.split(" ")

        let wordIdx = 0
        let summarisedSentence = ""

        while (wordIdx < words.length) {
          const word = words[wordIdx]
          summarisedSentence += word + " "
          if (word === "and" || word[word.length - 1] === ",") {
            wordIdx += 1
          } else {
            wordIdx += 2
          }
        }

        summarisedMessage += summarisedSentence + ". "
        sentenceIdx += 1
      }
      message.content = summarisedMessage

      return message
    })
  }

  const getConversationString = () => {
    let conversation = ""
    const latestMessages = getLatestMessages(NEED_TO_SUMMARISE)

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
      let product: Product | null = null

      if (storeProducts && storeProducts[productId]) {
        product = storeProducts[productId]
      }

      productDescriptionPairs.push(
        new ProductDescriptionPair(description.replace(/\n/g, "<br/>"), product)
      )

      startIdx = closeIdTagIdx + 5

      if (paragraph[startIdx] === ".") {
        startIdx += 2
      }
    }

    const remainingText = paragraph.substring(startIdx)

    if (remainingText.length > 0) {
      productDescriptionPairs.push(
        new ProductDescriptionPair(
          remainingText.replace(/\n/g, "<br/>"),
          null
        )
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
      // let conversation = getConversationString()
      // conversation += `last_prompt: ${prompt}`

      // const keys = [
      //   "name_of_product_in_reference_by_last_prompt",
      //   "last_prompt",
      // ]

      // const contextualisedPromptResponse = await openai.createChatCompletion({
      //   model,
      //   messages: [
      //     {
      //       role: "user",
      //       content: `Conversation: ${conversation}. From the conversation only, pick the appropriate values for only the keys: (${keys}) and nothing more. Base your answer only on the conversation given and nothing more. Format it in JSON.`,
      //     },
      //   ],
      // })

      // let contextualisedPrompt = prompt
      // try {
      //   contextualisedPrompt =
      //     contextualisedPromptResponse.data.choices[0].message!.content
      //   console.log(contextualisedPrompt)
      // } catch (error) {
      //   console.log(
      //     "Contextualised Prompt Response invalid, continuing without Contextualised Prompt"
      //   )
      // }

      // Get context for the contextualised prompt
      const embeddingsResponse = await fetch(
        `/api/stores/${router.query.storeId}/get_context`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
        }
      )

      if (embeddingsResponse.ok) {
        const data = await embeddingsResponse.json()
        const context = data.context

        const latestMessages = getLatestMessages(NEED_TO_SUMMARISE)

        const contextualisedMessages = [
          ...getSystemMessage(context),
          ...latestMessages,
          ...reminderMessages,
          ...[
            {
              role: "user",
              content: `${prompt}.`,
            },
          ],
        ]

        const chatResponse = await openai.createChatCompletion({
          model,
          messages: contextualisedMessages,
          temperature: 0,
        })
        const reply = chatResponse.data.choices[0].message

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

        setMessages(messagesWithPromptAndReply)
        setIsWaitingResponse(false)
      } else {
        const errorMessage = await embeddingsResponse.json()
        throw errorMessage
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

  return store && router.isReady ? (
    <Box width="100%" height="100vh">
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        width="100%"
        height="50px"
        borderBottom="0.5px solid #D3D3D3"
        bgcolor="#1c1c1c"
        color="white"
        p="0 20px"
      >
        <Typography>{store!.name}</Typography>
        <Typography>Powered by June</Typography>
      </Box>
      <Box
        width="100%"
        position="absolute"
        top="50px"
        bottom="150px"
        bgcolor="#ffffff"
        sx={{
          overflowX: "hidden",
          overflowY: "overlay",
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
                alignItems="center"
                gap="50px"
              >
                <Typography variant="h2">{store!.name}</Typography>
                <Box display="flex" flexDirection="column" gap="20px">
                  {samplePrompts.map((prompt: string, idx) => {
                    return (
                      <Box
                        display="flex"
                        width="230px"
                        justifyContent="center"
                        alignItems="center"
                        textAlign="center"
                        border="0.5px solid #D3D3D3"
                        borderRadius="10px"
                        p="10px"
                        sx={{
                          "&:hover": {
                            cursor: "pointer",
                            bgcolor: "#D3D3D3",
                          },
                        }}
                        onClick={() => {
                          setPrompt(prompt)
                        }}
                        key={idx}
                      >
                        {prompt}
                      </Box>
                    )
                  })}
                </Box>
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
              isWaitingResponse ? "Generating response..." : "Ask June"
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
    <LoadingWidget color="black" text="Preparing June..." />
  )
}

export default StoreConversationPage
