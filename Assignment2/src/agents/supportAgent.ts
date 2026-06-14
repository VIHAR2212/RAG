import * as dotenv from "dotenv";
dotenv.config();

import { pull } from "langchain/hub";
import { createReactAgent } from "langchain/agents";
import { AgentExecutor } from "langchain/agents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { getModel } from "../utils/llm";
import { allTools } from "../tools/customTools";

// ── Build the agent ─────────────────────────────────────────────────────────
export async function buildSupportAgent() {
  const model = getModel(0.3); // lower temp → more reliable tool use

  // ReAct prompt: instructs the model to reason step-by-step before acting
  const prompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      `You are a helpful AI study assistant for developers learning LangChain and TypeScript.
      
You have access to the following tools:
- calculator: for math problems
- topic_explainer: to explain LangChain/AI concepts
- study_planner: to create study plans
- code_snippet: to provide TypeScript code examples

Think step-by-step before acting. Use tools when they can give a better answer.
If you can answer directly without a tool, do so concisely.
Always be educational and encouraging.

{agent_scratchpad}`,
    ],
    ["human", "{input}"],
  ]);

  const agent = await createReactAgent({
    llm: model,
    tools: allTools,
    prompt,
  });

  return new AgentExecutor({
    agent,
    tools: allTools,
    verbose: true,        // shows ReAct reasoning steps (great for learning!)
    maxIterations: 5,
    handleParsingErrors: true,
  });
}

// ── Demo runner ─────────────────────────────────────────────────────────────
async function runAgentDemo() {
  console.log("\n═══════════════════════════════════════");
  console.log("  🤖 LANGCHAIN AGENT DEMO");
  console.log("═══════════════════════════════════════");
  console.log("Agent will reason about which tool(s) to use for each query.\n");

  const executor = await buildSupportAgent();

  const queries = [
    "What is 144 divided by 12, and then multiplied by 7?",
    "Explain what LangSmith does and why a developer would need it.",
    "Give me a code snippet showing how to use memory in LangChain.",
    "Create a study plan for learning LangChain.",
  ];

  for (const [i, query] of queries.entries()) {
    console.log(`\n${"═".repeat(60)}`);
    console.log(`🎯 Query ${i + 1}: "${query}"`);
    console.log("─".repeat(60));

    try {
      const result = await executor.invoke({ input: query });
      console.log("\n✅ Final Answer:", result.output);
    } catch (err) {
      console.error("Agent error:", err);
    }
  }

  console.log("\n✅ Agent demo complete.\n");
}

if (require.main === module) {
  runAgentDemo().catch(console.error);
}
