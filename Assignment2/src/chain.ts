import * as dotenv from "dotenv"
dotenv.config()

import { ChatGroq } from "@langchain/groq"
import { ChatPromptTemplate } from "@langchain/core/prompts"
import { StringOutputParser } from "@langchain/core/output_parsers"

// this is a basic chain
// a chain in langchain is basically: prompt -> model -> output
// instead of calling the model directly every time, you make a chain and reuse it

const model = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: "llama-3.3-70b-versatile",
  temperature: 0.7,
})

// prompt template lets you reuse the same prompt with different inputs
// the {topic} part gets replaced when you call the chain
const prompt = ChatPromptTemplate.fromMessages([
  ["system", "You are a helpful assistant that explains tech concepts simply."],
  ["human", "Explain {topic} in 3-4 lines like I am a beginner."],
])

const outputParser = new StringOutputParser()

// this is the chain - using pipe() to connect everything
// prompt -> model -> parse the output to string
const chain = prompt.pipe(model).pipe(outputParser)

async function runChain() {
  console.log("running basic chain demo...\n")

  // example 1
  const result1 = await chain.invoke({ topic: "what is langchain" })
  console.log("Q: what is langchain")
  console.log("A:", result1)
  console.log()

  // example 2 - document Q&A type chain
  const qaPrompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      `You are a Q&A bot. Answer only based on the context given below.
If answer is not in context just say "not found in context".

Context: {context}`,
    ],
    ["human", "{question}"],
  ])

  const qaChain = qaPrompt.pipe(model).pipe(outputParser)

  const myContext = `
    LangChain is a framework for building LLM applications.
    It has components like chains, agents, memory and tools.
    LangSmith is used for debugging and tracing LangChain apps.
  `

  const result2 = await qaChain.invoke({
    context: myContext,
    question: "what is langsmith used for?",
  })

  console.log("Q: what is langsmith used for?")
  console.log("A:", result2)
}

runChain()
