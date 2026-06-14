import * as dotenv from "dotenv"
dotenv.config()

import { ChatGroq } from "@langchain/groq"
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts"
import { StringOutputParser } from "@langchain/core/output_parsers"
import { ConversationChain } from "langchain/chains"
import { BufferMemory } from "langchain/memory"
import * as readline from "readline"

// this is the main file - a simple chat app using langchain
// it combines everything: model setup, prompt template, memory, chain

const model = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: "llama-3.3-70b-versatile",
  temperature: 0.7,
})

const memory = new BufferMemory({
  returnMessages: true,
  memoryKey: "chat_history",
})

const prompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    "You are a helpful AI assistant. You remember the full conversation and give helpful answers.",
  ],
  new MessagesPlaceholder("chat_history"),
  ["human", "{input}"],
])

const chain = new ConversationChain({
  llm: model,
  memory: memory,
  prompt: prompt,
})

// simple terminal chat loop
async function main() {
  console.log("=================================")
  console.log("  LangChain AI Assistant")
  console.log("  built with groq + langchain")
  console.log("=================================")
  console.log("type your message. type 'exit' to quit.\n")

  // checking langsmith status
  if (process.env.LANGCHAIN_TRACING_V2 === "true") {
    console.log("langsmith tracing is ON - you can see all runs at smith.langchain.com")
  } else {
    console.log("langsmith tracing is OFF - set LANGCHAIN_TRACING_V2=true to enable")
  }
  console.log()

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  const ask = (q: string) => new Promise<string>((res) => rl.question(q, res))

  while (true) {
    const userInput = (await ask("You: ")).trim()

    if (!userInput) continue
    if (userInput === "exit") {
      console.log("bye!")
      rl.close()
      break
    }

    try {
      const response = await chain.call({ input: userInput })
      console.log("AI:", response.response)
      console.log()
    } catch (err) {
      console.log("something went wrong:", err)
    }
  }
}

main()
