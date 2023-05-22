import { Configuration, OpenAIApi } from "openai"

const configuration = new Configuration({
  apiKey: "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",
})
export const openai = new OpenAIApi(configuration)
