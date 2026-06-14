import * as dotenv from "dotenv"
dotenv.config()

import { ChatGroq } from "@langchain/groq"
import { ConversationChain } from "langchain/chains"
import { BufferMemory } from "langchain/memory"
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts"

// memory is one of the coolest things in langchain
// normally LLMs dont remember anything - every call is fresh
// BufferMemory stores the chat history and injects it into the prompt each time
// so the model "remembers" what you said earlier

const model = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: "llama-3.3-70b-versatile",
  temperature: 0.7,
})

// BufferMemory stores all messages
// if you want to limit it (so it doesnt get too long) use BufferWindowMemory with k=5 or whatever
const memory = new BufferMemory({
  returnMessages: true,
  memoryKey: "chat_history",
})

const prompt = ChatPromptTemplate.fromMessages([
  ["system", "You are a helpful assistant. You remember the conversation."],
  new MessagesPlaceholder("chat_history"),
  ["human", "{input}"],
])

const chain = new ConversationChain({
  llm: model,
  memory: memory,
  prompt: prompt,
})

async function runMemoryDemo() {
  console.log("memory demo - watch how it remembers stuff\n")

  const msg1 = await chain.call({ input: "hey my name is vihar and i am learning langchain" })
  console.log("Me:", "hey my name is vihar and i am learning langchain")
  console.log("AI:", msg1.response)
  console.log()

  const msg2 = await chain.call({ input: "what was the first thing i told you?" })
  console.log("Me:", "what was the first thing i told you?")
  console.log("AI:", msg2.response)
  console.log()

  const msg3 = await chain.call({ input: "what topic am i learning?" })
  console.log("Me:", "what topic am i learning?")
  console.log("AI:", msg3.response)
  console.log()

  // this proves memory works - it remembers "vihar" and "langchain" from turn 1
}

runMemoryDemo()
