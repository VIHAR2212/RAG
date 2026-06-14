import * as dotenv from "dotenv"
dotenv.config()

import { ChatGroq } from "@langchain/groq"
import { DynamicTool } from "@langchain/core/tools"
import { createReactAgent, AgentExecutor } from "langchain/agents"
import { ChatPromptTemplate } from "@langchain/core/prompts"

// agents are different from chains
// in a chain the steps are fixed - it always goes prompt -> model -> output
// in an agent the model itself decides what to do
// it looks at your question, thinks about it, and picks which tool to use

const model = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: "llama-3.3-70b-versatile",
  temperature: 0,  // 0 because agents need to be consistent
})

// tools are basically functions the agent can call
// you describe what the tool does and the model decides when to use it

const calculatorTool = new DynamicTool({
  name: "calculator",
  description: "useful for doing math. give it a math expression like 5*8 or 100/4",
  func: async (input: string) => {
    try {
      // yeah eval is not great for production but this is a demo
      const result = eval(input)
      return String(result)
    } catch (e) {
      return "could not calculate that"
    }
  },
})

const topicInfoTool = new DynamicTool({
  name: "topic_info",
  description: "gives info about langchain topics like: chain, agent, memory, langsmith, tools",
  func: async (input: string) => {
    const info: Record<string, string> = {
      chain: "A chain in langchain connects a prompt, a model, and an output parser together. You call it with invoke() and it handles everything. Good for fixed workflows.",
      agent: "An agent uses the LLM to decide what to do. It picks tools based on your question. Unlike chains, agents are flexible and can handle different situations.",
      memory: "Memory stores the conversation history so the model doesn't forget what you said. BufferMemory keeps everything. BufferWindowMemory keeps last K messages only.",
      langsmith: "LangSmith is for debugging. It records every step of your chain or agent - what went in, what came out, how long it took. Very useful when things break.",
      tools: "Tools are functions you give to an agent. The agent reads their description and decides when to call them. You can make tools for anything - search, calculator, database, etc.",
    }

    const key = input.toLowerCase().trim()
    return info[key] ?? `no info found for "${input}". try: chain, agent, memory, langsmith, tools`
  },
})

const tools = [calculatorTool, topicInfoTool]

// the agent prompt - {agent_scratchpad} is where the agent writes its thinking
const prompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are a helpful assistant for learning about LangChain.
You have tools available. Use them when needed.
Think step by step before answering.

{agent_scratchpad}`,
  ],
  ["human", "{input}"],
])

async function runAgentDemo() {
  console.log("agent demo - watch the agent decide which tool to use\n")

  const agent = await createReactAgent({ llm: model, tools, prompt })

  const executor = new AgentExecutor({
    agent,
    tools,
    verbose: true,  // set to true so you can see the agent thinking
    maxIterations: 4,
    handleParsingErrors: true,
  })

  console.log("--- question 1 ---")
  const r1 = await executor.invoke({ input: "what is 25 multiplied by 8?" })
  console.log("Answer:", r1.output)
  console.log()

  console.log("--- question 2 ---")
  const r2 = await executor.invoke({ input: "explain what langsmith is" })
  console.log("Answer:", r2.output)
  console.log()

  console.log("--- question 3 ---")
  const r3 = await executor.invoke({ input: "what is 144 divided by 12 and also tell me what memory does in langchain" })
  console.log("Answer:", r3.output)
}

runAgentDemo()
