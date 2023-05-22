import { Box, InputAdornment, TextField, Typography } from "@mui/material"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { Store } from "../models/Store"
import SendIcon from "@mui/icons-material/Send"
import PersonIcon from "@mui/icons-material/Person"
import SmartToyIcon from "@mui/icons-material/SmartToy"
import { Configuration, OpenAIApi } from "openai"

const configuration = new Configuration({
  apiKey: "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",
})
delete configuration.baseOptions.headers["User-Agent"]
const openai = new OpenAIApi(configuration)

interface ChatStripeProps {
  message: string
  isBot: boolean
  picSrc: string
}

const ChatStripe = ({ message, isBot }: ChatStripeProps) => {
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
      <Typography>{message}</Typography>
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

  const [prompt, setPrompt] = useState<string>("")
  const [submittedPrompt, setSubmittedPrompt] = useState(undefined)

  const categories = ["snowboards", "wax", "gift card"]

  const storeInitMessages = [
    {
      role: "user",
      content: `You are a store assistant with the main objective of persuading me to buy products from your store which sells ${categories.join(", ")}. Don't justify your answers. Don't apologize for mistakes. Jump straight to the answers. At all times, only talk about products explicitly mentioned in the CONTEXT provided. Be confident in your answers. Always provide the product link in the format <LINK>{product_link}</LINK>. Talk to me like a human.`,
    },
    {
      role: "assistant",
      content:
        "Sure! I will only talk about products explicitly mentioned in the CONTEXT provided. I will jump straight to the answer. I will be confident in my answers. I will always provide the product link for every product discussed in the format <LINK>{product_link}</LINK>. I will talk like a human.",
    },
  ]

  const [messages, setMessages] = useState<any>([])

  const [isError, setIsError] = useState<boolean>(false)
  const [isWaitingResponse, setIsWaitingResponse] = useState<boolean>(false)
  const conversationIsNotEmpty =
    (messages && messages.length > 0) || isWaitingResponse

  const getStore = async (storeId: string) => {
    setStore(null)
  }

  const getLatestMessages = () => {
    const numMessages = LATEST_FACTOR * 2
    if (messages.length <= numMessages) {
      return messages
    } else {
      return messages.slice(-1 * numMessages)
    }
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

  const handleSubmit = async (prompt: string) => {
    try {
      let conversation = getConversationString()
      conversation += `last_prompt: ${prompt}`

      const keys = [
        "name_of_product_in_reference_by_last_prompt",
        "last_prompt",
      ]
      const contextualisedPromptResponse = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
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
        console.log(conversation)
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
          ...[
            {
              role: "user",
              content: `CONTEXT: ${context}`,
            },
          ],
          ...latestMessages,
          ...[{ role: "user", content: prompt }],
        ]
        console.log(messagesWithPromptWithContext)
        const chatResponse = await openai.createChatCompletion({
          model: "gpt-3.5-turbo",
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
            ...[{ role: "user", content: prompt }],
            ...[reply],
          ]
          setMessages(messagesWithPromptAndReply)
        } else {
          console.log(chatResponse)
        }
      } else {
        console.log("Response is not ok")
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    if (!router.isReady) return

    const storeId = router.query.storeId
    getStore(storeId as string)
  }, [router.isReady])

  function handleKeyPress(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Enter") {
      handleSubmit(prompt)
    }
  }

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
            messages.map((message: any, idx: any) => (
              <ChatStripe
                message={message.content}
                isBot={message.role === "assistant"}
                picSrc=""
                key={idx}
              />
            ))
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
              <ChatStripe message={submittedPrompt!} isBot={false} picSrc="" />
              <LoadingChatStripe isError={isError} />
            </>
          )}
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
              marginLeft: "0.5rem",
              marginRight: "0.5rem",
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
