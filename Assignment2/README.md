# LangChain TypeScript AI Assistant

built this for the edquest AI agent engineer roadmap assignment.

the goal was to learn how langchain works by actually building something with it — chains, memory, agents, and langsmith tracing.

---

## what is langchain and why does it exist

without langchain if you want to build an AI app you have to manually:
- format every prompt yourself
- call the API
- parse the output
- remember to pass chat history on every call
- figure out how to make the model use tools

langchain just handles all of that. you set up your chain or agent once and then just call it.

---

## what i built

a simple AI assistant that runs in the terminal. it has:
- memory so it remembers the conversation
- a Q&A chain for answering questions from context
- an agent that can use tools (calculator + topic explainer)
- langsmith integration for debugging

---

## file structure

```
src/
├── index.ts      main chat app with memory
├── chain.ts      basic chain demo (prompt → model → output)
├── memory.ts     shows how memory works across turns
└── agent.ts      agent with tools - model decides what to call
```

---

## how to run

**step 1 - install**
```
npm install
```

**step 2 - set up .env**

copy `.env.example` to `.env` and fill in your keys:
- GROQ_API_KEY → get it free from console.groq.com
- LANGCHAIN_API_KEY → get it from smith.langchain.com (optional but useful)

**step 3 - run**

```bash
# main chat app
npm start

# just the chain demo
npm run chain

# memory demo
npm run memory

# agent demo
npm run agent
```

---

## what i learned from each file

### chain.ts — how chains work

a chain is just: prompt → model → output parser connected together with `.pipe()`

```typescript
const chain = prompt.pipe(model).pipe(outputParser)
const result = await chain.invoke({ topic: "langchain" })
```

instead of calling the model directly every time, you build a chain once and reuse it. you can also pass variables into the prompt which is really useful.

### memory.ts — how memory works

LLMs are stateless by default. every call starts fresh. `BufferMemory` fixes this by storing all messages and injecting them into the prompt automatically.

```typescript
const memory = new BufferMemory({ returnMessages: true, memoryKey: "chat_history" })
```

i tested it by telling the model my name in turn 1 and asking it what my name was in turn 3. it remembered correctly which means memory is working.

### agent.ts — how agents work

this was the hardest to understand. the difference between chain and agent:

| chain | agent |
|---|---|
| steps are fixed | model decides the steps |
| always goes A → B → C | might go A → C → A again |
| good for predictable tasks | good for flexible tasks |

the agent reads your question, looks at the tool descriptions, picks a tool, runs it, reads the result, and decides if it needs to do more.

i gave it two tools - a calculator and a topic explainer. if you ask it a math question it uses calculator. if you ask about langchain concepts it uses topic_explainer. if you ask both in one question it uses both.

### langsmith tracing

this was actually really helpful. you just set two env variables:

```
LANGCHAIN_TRACING_V2=true
LANGCHAIN_API_KEY=your_key
```

and then every time you run your chain or agent, it gets recorded on smith.langchain.com. you can see exactly what prompt was sent, what the model replied, how long each step took, and if any tool call failed.

i used it to debug my agent when it kept calling the wrong tool - i could see the exact reasoning the model was doing and fix the tool description.

without langsmith you're basically debugging blind.

---

## tech used

- langchain + @langchain/core
- @langchain/groq (using llama-3.3-70b - it's free)
- langsmith for tracing
- typescript + ts-node
- dotenv
