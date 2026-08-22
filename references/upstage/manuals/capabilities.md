# Capabilities

> Source: /docs/capabilities/search/file-search

## File Search

> File Search is currently in **Beta**. Features and API specifications may change without prior notice.
> During the beta period, please avoid uploading sensitive or confidential data.
> When the service officially launches, data from users who have not agreed to the terms of service may be deleted.

File Search enables you to search across your documents using natural language queries. Upload files, build a vector store, and retrieve relevant information — or get AI-generated answers grounded in your documents using the Responses API.

### Concepts

#### Vector Stores

A **vector store** is a container that holds your indexed documents. When you upload a file to a vector store, the system automatically parses, chunks, and embeds the content so it can be searched.

Each vector store is isolated — files in one vector store are not searchable from another. Vector stores are scoped per user (identified by API key). You can only access vector stores that you created, and other users cannot see or search your data.

#### File Indexing

When you add a file to a vector store, the system processes it through an asynchronous pipeline:

1. **Parse** — Extract text content from the file (supports images, PDFs, Microsoft Office documents, and more).
2. **Chunk** — Split the extracted text into optimized segments.
3. **Embed** — Generate vector embeddings for each chunk.
4. **Store** — Save the embeddings for search.

File processing is asynchronous. After adding a file, its status starts as `in_progress` and transitions to `completed` when indexing finishes, or `failed` if an error occurs.

#### Search

Search takes a natural language query, embeds it, and finds the most relevant document chunks in the vector store. Results include the matched text, relevance score, and source file information.

#### Responses (RAG)

The Responses API combines search with an LLM. It retrieves relevant document chunks, then generates an AI answer grounded in the retrieved context. This is also known as Retrieval-Augmented Generation (RAG).

### Quick Start

This guide walks you through creating a vector store, uploading a file, and performing your first search.

#### Prerequisites

- An Upstage API key (obtain from [Upstage Console](https://console.upstage.ai))
- A file uploaded via the [Files API](/docs/agents/files) — you'll need the returned `file_id` to add it to a vector store

#### Create a Vector Store

##### curl

```bash
curl -X POST https://api.upstage.ai/v2/vector_stores \
  -H "Authorization: Bearer $UPSTAGE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "my-knowledge-base"
  }'
```

##### Python

```python
import os
from openai import OpenAI

client = OpenAI(
    api_key=os.environ["UPSTAGE_API_KEY"],
    base_url="https://api.upstage.ai/v2",
)

## Create a vector store
vector_store = client.vector_stores.create(name="my-knowledge-base")
print(vector_store.id)  # e.g., "vs_abc123..."
```

Response:

```json
{
  "id": "vs_abc123def456",
  "object": "vector_store",
  "created_at": 1711644800,
  "name": "my-knowledge-base",
  "usage_bytes": 0,
  "file_counts": {
    "in_progress": 0,
    "completed": 0,
    "failed": 0,
    "cancelled": 0,
    "total": 0
  },
  "status": "completed",
  "last_active_at": 1711644800,
  "expires_after": null,
  "expires_at": null,
  "metadata": {}
}
```

#### Add a File

To add a file to a vector store, you need a `file_id` from the [Upstage Files API](/docs/agents/files). First upload your file, then add it to the vector store.

##### curl

```bash
curl -X POST https://api.upstage.ai/v2/vector_stores/vs_abc123def456/files \
  -H "Authorization: Bearer $UPSTAGE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "file_id": "file_xyz789"
  }'
```

##### Python

```python
file_obj = client.vector_stores.files.create(
    vector_store_id=vector_store.id,
    file_id="file_xyz789",
)
print(file_obj.status)  # "in_progress"
```

Response:

```json
{
  "id": "file_xyz789",
  "object": "vector_store.file",
  "created_at": 1711644900,
  "vector_store_id": "vs_abc123def456",
  "status": "in_progress",
  "last_error": null,
  "usage_bytes": 0,
  "chunking_strategy": {"type": "auto"},
  "attributes": null
}
```

#### Wait for Indexing

File indexing is asynchronous. Poll the file status until it becomes `completed`.

##### curl

```bash
## Poll until status is "completed" or "failed"
curl -s https://api.upstage.ai/v2/vector_stores/vs_abc123def456/files/file_xyz789 \
  -H "Authorization: Bearer $UPSTAGE_API_KEY" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['status'])"
```

##### Python

```python
import time

while True:
    f = client.vector_stores.files.retrieve(
        vector_store_id=vector_store.id,
        file_id=file_obj.id,
    )
    if f.status == "completed":
        print("File indexed successfully!")
        break
    elif f.status == "failed":
        print("Indexing failed:", f.last_error)
        break
    time.sleep(2)
```

#### Search

##### curl

```bash
curl -X POST https://api.upstage.ai/v2/vector_stores/vs_abc123def456/search \
  -H "Authorization: Bearer $UPSTAGE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What is the main topic of the document?",
    "max_num_results": 5
  }'
```

##### Python

```python
results = client.vector_stores.search(
    vector_store_id=vector_store.id,
    query="What is the main topic of the document?",
    max_num_results=5,
)
for item in results.data:
    text = "".join(block.text for block in item.content if block.type == "text")
    print(f"[{item.score:.3f}] {item.filename}: {text[:100]}...")
```

#### Get an AI-Generated Answer (RAG)

##### curl

```bash
curl -X POST https://api.upstage.ai/v2/responses \
  -H "Authorization: Bearer $UPSTAGE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "solar-pro3",
    "input": "Summarize the key points of my document.",
    "tools": [
      {
        "type": "file_search",
        "vector_store_ids": ["vs_abc123def456"]
      }
    ]
  }'
```

##### Python

```python
result = client.responses.create(
    model="solar-pro3",
    input="Summarize the key points of my document.",
    tools=[
        {
            "type": "file_search",
            "vector_store_ids": [vector_store.id],
        }
    ],
)
print(result.output)
```

---

### Supported File Types

| Extension       | Format                |
| --------------- | --------------------- |
| `.pdf`          | PDF documents         |
| `.docx`         | Microsoft Word        |
| `.pptx`         | Microsoft PowerPoint  |
| `.xlsx`         | Microsoft Excel       |
| `.hwp`, `.hwpx` | Hangul Word Processor |
| `.md`           | Markdown              |
| `.txt`          | Plain text            |
| `.jpeg`, `.jpg` | JPEG images           |
| `.png`          | PNG images            |
| `.bmp`          | BMP images            |
| `.tiff`, `.tif` | TIFF images           |
| `.heic`         | HEIC images           |

All file types are processed using document parsing to extract text content before indexing.

---

### Error Handling

All errors follow a consistent format:

```json
{
  "error": {
    "message": "Description of the error.",
    "type": "error_type",
    "code": null
  }
}
```

#### Common Errors

| HTTP Status | Type                    | Cause                                                                                                     |
| ----------- | ----------------------- | --------------------------------------------------------------------------------------------------------- |
| 400         | `invalid_request_error` | Unsupported file type, missing required fields, or service limit exceeded (`code: "max_limit_exceeded"`). |
| 401         | —                       | Missing or invalid API key in the `Authorization` header.                                                 |
| 404         | —                       | Vector store or file not found.                                                                           |
| 422         | `invalid_request_error` | Invalid `chunking_strategy` (only `auto` is supported), invalid metadata or attributes (exceeds limits).  |

---

### File Batches

File batches allow you to add multiple files to a vector store in a single request. This is useful when you need to index many files at once.

#### curl

```bash
curl -X POST https://api.upstage.ai/v2/vector_stores/vs_abc123def456/file_batches \
  -H "Authorization: Bearer $UPSTAGE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "file_ids": ["file_001", "file_002", "file_003"]
  }'
```

#### Python

```python
batch = client.vector_stores.file_batches.create(
    vector_store_id=vector_store.id,
    file_ids=["file_001", "file_002", "file_003"],
)
print(batch.status)  # "in_progress"
```

You can check the batch status and list the files in a batch:

```python
## Check batch status
batch = client.vector_stores.file_batches.retrieve(
    vector_store_id=vector_store.id,
    batch_id=batch.id,
)
print(batch.file_counts)

## List files in a batch
files = client.vector_stores.file_batches.list_files(
    vector_store_id=vector_store.id,
    batch_id=batch.id,
)
for f in files:
    print(f.id, f.status)
```

To cancel an in-progress batch:

```python
batch = client.vector_stores.file_batches.cancel(
    vector_store_id=vector_store.id,
    batch_id=batch.id,
)
```

#### Batch Status and Completion

A batch's `status` field reflects whether the batch was cancelled, not whether indexing finished. It can be either of:

- `in_progress` — set on creation. Remains `in_progress` even after every file in the batch reaches a terminal state.
- `cancelled` — set when `POST .../cancel` is called on an `in_progress` batch. Already-cancelled batches return as-is (no-op).

**To detect when batch indexing is done, poll `file_counts` rather than `status`.** A batch is functionally complete when `file_counts.in_progress` reaches `0`:

```python
import time

while True:
    batch = client.vector_stores.file_batches.retrieve(
        vector_store_id=vector_store.id,
        batch_id=batch.id,
    )
    counts = batch.file_counts
    if counts.in_progress == 0:
        break
    time.sleep(2)

## Inspect terminal counts
if counts.failed > 0:
    # Some files failed indexing — list files with filter=failed to inspect last_error
    failed_files = client.vector_stores.file_batches.list_files(
        vector_store_id=vector_store.id,
        batch_id=batch.id,
        filter="failed",
    )
```

**Per-file failures do not change the batch status.** They are aggregated into `file_counts.failed`.

---

### Limitations and Constraints

#### Service Limits

| Resource               | Limit |
| ---------------------- | ----- |
| Vector stores per user | 50    |
| Files per vector store | 500   |
| Files per batch        | 50    |

These limits are enforced at creation time. Exceeding a limit returns a `400` error with `code: "max_limit_exceeded"`.

#### Data Constraints

| Constraint                    | Value                    |
| ----------------------------- | ------------------------ |
| Metadata keys per object      | 16                       |
| Metadata key length           | 64 characters            |
| Metadata value length         | 512 characters           |
| Attributes keys per file      | 16                       |
| Attribute key length          | 64 characters            |
| Attribute string value length | 512 characters           |
| `max_num_results` range       | 1-20 (default: 5)        |
| `expires_after.days` range    | 1-365                    |
| Pagination `limit` range      | 1-100 (default: 20)      |
| Chunking strategy             | Only `auto` is supported |

---

> Source: /docs/capabilities/generate

## Generate with Solar

Solar is a lightweight model family specialized for agentic work.

This page is the starting point for building with Solar. Follow the sections
below in order, or jump straight to what you need.

<figure>![Solar product introduction animation](/assets/images/docs/solar.gif)</figure>

### Quick Start

Make your first call and see Solar respond.

[API Quickstart](/docs/capabilities/generate/chat) — Send your first request to the Solar API and read the response.

[Playground](/playground/chat) — Try prompts and compare outputs in the browser, no code required.

[Integrations](/docs/for-agents) — Connect AI coding assistants and other tools to Solar.

### Choose a model

Find the model that fits your task and your budget.

[Compare Models](/docs/models/compare/generative-intelligence) — Compare Solar models side by side and pick the right one.

[Pricing](https://www.upstage.ai/pricing) — Check per-token pricing before you commit to a model.

### Build

Add the capabilities your application needs.

[Reasoning](/docs/capabilities/generate/reasoning) — Let the model think through multi-step problems before answering.

[Structured Outputs](/docs/capabilities/generate/structured-outputs) — Constrain responses to a JSON schema your application can parse.

[Tool Calling](/docs/capabilities/generate/tool-calling) — Let the model call your own tools and APIs.

### Manage and operate

Monitor usage, control costs, and keep your application reliable.

[Counting Tokens](/docs/guides/counting-tokens) — Estimate token usage before sending a request.

[Dashboard](/billing/usage) — Track actual usage and spending for your account.

[Rate Limits](/docs/guides/rate-limits) — Know your request and token limits, and how to handle them.

[Error Codes](/docs/resources/error-codes) — Look up API error codes and what to do about them.

[FAQ](/docs/capabilities/generate/faq) — Find answers to common questions about building with Solar.

---

> Source: /docs/capabilities/generate/chat

## API Quickstart

Make your first Solar API call, understand the response, and learn how to continue a conversation.

### Before you begin

You need an Upstage account and API key. If you do not have them yet, follow [Getting Started](/docs/getting-started).

### Install an OpenAI SDK

Solar is compatible with the OpenAI API. Before using the Solar API, install the official [OpenAI SDK](https://developers.openai.com/api/docs/libraries) for your language.

#### Python

```bash copy
pip install --upgrade openai
```

#### JavaScript

```bash copy
npm install openai
```

### Make your first request

Start using the Solar API by sending a simple greeting.

**Request**

_Request/response examples: chat / request / quickstart_

### Understand the response

The generated answer is in `choices[0].message.content`. Solar Pro 4 performs reasoning by default, so the response also carries the reasoning trace—see [Reasoning](/docs/capabilities/generate/reasoning).

_Example: chat / response-200 / quickstart / default_

| Field                                              | Description                                                           |
| -------------------------------------------------- | --------------------------------------------------------------------- |
| `choices[0].message.content`                       | The generated answer text.                                            |
| `choices[0].message.reasoning`                     | The reasoning trace the model produced before answering.              |
| `choices[0].finish_reason`                         | Why generation stopped. `stop` means the model finished on its own.   |
| `model`                                            | The exact model version that handled the request.                     |
| `usage.prompt_tokens`                              | Number of tokens in the request.                                      |
| `usage.completion_tokens`                          | Number of tokens in the generated answer, including reasoning tokens. |
| `usage.completion_tokens_details.reasoning_tokens` | Number of tokens spent on reasoning.                                  |
| `usage.total_tokens`                               | Sum of prompt and completion tokens.                                  |

For the complete response schema, see the [Chat Completions API reference](/api/chat#response).

### What models does Upstage provide?

The table below describes the models currently available as an API. Upstage provides stable _aliases_ that point to specific model versions. These aliases let you integrate once and automatically benefit from future updates without needing to modify your code whenever a model is improved or replaced.

We recommend using aliases instead of hardcoding specific model names, as models are frequently updated. However, please note that model behavior may change slightly when an alias is updated—for example, in how prompts are handled or how outputs are structured. While we strive to ensure smooth transitions, we recommend validating key prompts and responses when using aliases in production.

<table><thead><tr><th align="left" width="150px">Alias</th><th>Currently points to</th><th>RPM / TPM <a href="/docs/guides/rate-limits#solar-pro4">(Learn more)</a></th></tr></thead><tbody><tr><td>solar-pro4 InformationCircleIcon (rendered on the docs page)</td><td>[solar-pro4-260806](/docs/models/history#solar-pro4-260806)</td><td>100 / 50,000</td></tr><tr><td>solar-pro3 InformationCircleIcon (rendered on the docs page)</td><td>[solar-pro3-260323](/docs/models/history#solar-pro3-260323)</td><td>100 / 50,000</td></tr><tr><td>solar-pro2</td><td>[solar-pro2-251215](/docs/models/history#solar-pro2-251215)</td><td>100 / 50,000</td></tr><tr><td>solar-mini</td><td>[solar-mini-250422](/docs/models/history#solar-mini-250422)</td><td>100 / 50,000</td></tr><tr><td>syn-pro</td><td>[syn-pro-251021](/docs/models/history#syn-pro-251021)</td><td>100 / 50,000</td></tr></tbody></table>

### Continue the conversation

Chat Completions is stateless: it does not store your conversation history. Each request is handled on its own, so the model only knows what you send in `messages`.

To keep context across turns, resend the previous user and assistant messages together with the new user message.

Every resent message counts toward your input tokens, so a long conversation costs more with each turn. As the conversation approaches the model's context limit, trim or summarize older turns.

_Request/response examples: chat / request / multi-turn_

### Stream the response

Streaming lets your application display text as it is generated, instead of waiting for the complete response. Each chunk carries a piece of the answer, so the first words appear within a moment.

_Request/response examples: chat / request / streaming_

With the OpenAI SDK, each chunk exposes its text at `choices[0].delta.content`. Because Solar Pro 4 reasons by default, the reasoning trace streams first in `choices[0].delta.reasoning`, before the answer chunks arrive. LangChain and LlamaIndex use their own chunk interfaces, as shown above. Raw SSE streams, including the cURL example, finish with `data: [DONE]`.

### Next steps

Now that your first request works, explore the capabilities you can build on top of it.

[Reasoning](/docs/capabilities/generate/reasoning) — Let the model think through multi-step problems before answering.

[Structured Outputs](/docs/capabilities/generate/structured-outputs) — Constrain responses to a JSON schema your application can parse.

[Tool Calling](/docs/capabilities/generate/tool-calling) — Let the model call your own tools and APIs.

---

> Source: /docs/capabilities/generate/reasoning

## Reasoning

### What is reasoning?

Reasoning lets Solar spend additional reasoning tokens before producing the final answer. Those extra tokens give the model room to work through a problem in stages, which can help on tasks that require multiple dependent steps, where each step builds on the result of the previous one.

### When to use reasoning

| Use reasoning                                         | Use standard Chat                                                                   |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Multi-step logic or math problems                     | Simple question answering                                                           |
| Planning and analysis                                 | Summarization and rewriting                                                         |
| Code debugging where intermediate dependencies matter | Straightforward classification or extraction that does not need multi-step analysis |

Reasoning generally uses more output tokens and can increase latency and cost; the section below covers how to control it.

### Controlling reasoning

The `reasoning_effort` parameter controls whether the model spends a reasoning budget before answering, and roughly how much. A higher effort can use more output tokens and increase latency and cost, but it does not guarantee a better answer, so start with reasoning off or at a low effort and raise it only when the task actually needs multi-step work.

Which values turn reasoning on differs by model, and the mapping can change as models are updated. Check the response fields described below rather than assuming a fixed behavior.

| Model        | Omitted       | Turns reasoning off | Turns reasoning on                      | Visible `message.reasoning` |
| ------------ | ------------- | ------------------- | --------------------------------------- | --------------------------- |
| `solar-pro4` | ✅ ON          | `none`, `minimal`   | `low`, `medium`, `high`, `xhigh`, `max` | ✅ Yes                       |
| `solar-pro3` | ❌ OFF         | `minimal`, `low`    | `medium`, `high`                        | ✅ Yes                       |
| `solar-pro2` | ❌ OFF         | `minimal`, `low`    | `medium`, `high`                        | ❌ No                        |
| `solar-mini` | Standard Chat | Not supported       | Not supported                           | ❌ No                        |

`solar-pro4` reasons unless you turn it off: omitting `reasoning_effort` — or sending it as `null` — leaves reasoning on, and only `none` or `minimal` turns it off. When reasoning is on, the thought process is returned in `choices[].message.reasoning`, and in `choices[].delta.reasoning` when streaming.

`solar-mini` does not support reasoning and does not accept `reasoning_effort`. Sending any value returns an HTTP 400 error, so omit the parameter entirely for that model.

#### Response behavior

- Read the final answer from `message.content`, whether or not reasoning is on.
- Whether the thought process itself is returned in `message.reasoning` is model-specific — see the table above.
- The number of tokens spent on reasoning is reported in `usage.completion_tokens_details.reasoning_tokens` whenever reasoning is on.

> Reasoning tokens count toward your completion (output) tokens. If you set `max_tokens`, leave enough room for the final answer — otherwise the budget can be consumed by reasoning alone, and the response comes back with `message.content` set to `null` and a `finish_reason` of `length`.

### Make a reasoning request

Send a problem that takes more than one step with `reasoning_effort` set to `medium`, so `solar-pro4` works through it before answering.

_Request/response examples: chat-reasoning / request_

### Understand the response

This `solar-pro4` response carries the final answer in `message.content`, the visible thought process in `message.reasoning`, and the number of tokens spent on reasoning in `usage.completion_tokens_details.reasoning_tokens`.

_Example: chat-reasoning / response-200 / default_

### Stream the response

Set `stream` to `true` to receive the answer as it is produced. Reasoning and the final answer arrive in separate stream deltas: the visible thought process comes in `delta.reasoning`, and the final answer comes in `delta.content`. Handle and accumulate the two separately so your application can render the reasoning — or hide it — independently of the answer.

Only expose or log visible reasoning in a controlled debugging environment. It can contain user input or sensitive intermediate details, so do not persist it in production logs by default.

If you read the raw SSE stream instead of using an SDK, the stream ends with a `data: [DONE]` line.

_Request/response examples: chat-reasoning / request / streaming_

---

> Source: /docs/capabilities/generate/structured-outputs

## Structured outputs

### What is structured outputs?

Structured outputs constrain a model-generated response to a JSON Schema that you provide. Instead of describing the desired shape in the prompt and hoping the model complies, you pass the schema in `response_format`, and the reply comes back as valid JSON that matches it — the same field names, the same types, and only the values the schema allows. The result is safe to parse, but schema validity does not make its values trusted. Validate domain rules, escape content for its destination, and enforce authorization before using the values in UI, storage, or external actions.

### Choose an output mode

|                                     | JSON mode                 | Structured outputs             |
| ----------------------------------- | ------------------------- | ------------------------------ |
| `response_format`                   | `{"type": "json_object"}` | `{"type": "json_schema", ...}` |
| Output is valid JSON                | ✅ Yes                     | ✅ Yes                          |
| Output follows your schema          | ❌ No                      | ✅ Yes                          |
| Schema required                     | ❌ No                      | ✅ Yes                          |
| Prompt must contain the word `JSON` | ✅ Yes                     | ❌ No                           |

Use structured outputs whenever your application depends on fixed fields, types, or enum values. JSON mode only guarantees that the output parses as JSON — the field names, types, and nesting can differ from one call to the next, so you still have to validate what comes back.

JSON mode also requires the word `JSON` to appear somewhere in the conversation. If it does not, the request returns an HTTP 400 error.

### Defining schemas

Structured outputs support a subset of the [JSON Schema](https://json-schema.org/overview/what-is-jsonschema) specification, matching the subset used by OpenAI Structured Outputs.

**Requirements**

- The supported types are `string`, `number`, `integer`, `boolean`, `object`, and `array`.
- The root of the schema must be an `object`.
- Every property must be listed in the `required` array.
- To represent an optional value, keep the key in `required` and add `null` to its type — for example, `"type": ["string", "null"]`. The key is always present in the response; its value can be `null`.
- `strict` must be set to `true`.
- `additionalProperties` must be set to `false` on every object.
- Objects can nest up to 10 levels deep.
- `$defs` and `$ref` are supported across all current aliases, and are the recommended way to reuse a subschema. Only local references of the form `#/$defs/<name>` are accepted.

**Not supported**

- The composition keywords outside the OpenAI subset — `allOf`, `oneOf`, `not`, `dependentRequired`, `dependentSchemas`, and `if`/`then`/`else`.
- `patternProperties`.
- Recursive `$ref`, including a self-reference to the schema root (`{"$ref": "#"}`). Any reference other than a local `#/$defs/<name>` is rejected with an HTTP 400 error, so flatten recursive structures to a fixed depth instead.

**Avoid for cross-model compatibility**

Nested `anyOf` is not reliable across all current aliases, so avoid it if your application has to work on more than one model. Express alternatives with an `enum` or a set of nullable fields instead of composition keywords.

### Make a structured request

Classify a support ticket and draft a reply in a single `solar-pro4` call. Because the schema pins `category` to three known values, the response is always one of `billing`, `technical`, or `account` — never a synonym the model chose on its own.

_Request/response examples: structured-outputs / request_

### Understand the response

The raw Chat Completions response carries the generated JSON as a **string** in `choices[0].message.content`, not as an already-parsed object. Anything that speaks the OpenAI-compatible API sees that string: the Python OpenAI, JavaScript, cURL, and LlamaIndex examples above parse it themselves — `json.loads` in Python, `JSON.parse` in JavaScript. LangChain is the exception, because `with_structured_output` parses the string for you and hands back an object.

Check `choices[0].finish_reason` before parsing. A value of `stop` means the model finished the object and the content is complete JSON. A value of `length` means generation hit the token limit and the content is cut off mid-object, so parsing it will fail. Handle that case by raising `max_tokens` or retrying, rather than by parsing the truncated text.

_Example: structured-outputs / response-200 / default_

### Stream structured output

Set `stream` to `true` to receive the JSON as it is generated. The response arrives as fragments of JSON **text** in `choices[0].delta.content`, not as partial objects — each fragment is a piece of the string, so an individual delta is usually not valid JSON on its own. Accumulate every delta into a single string and parse it only after the stream finishes.

If you read the raw SSE stream instead of using an SDK, the stream ends with a `data: [DONE]` line.

---

> Source: /docs/capabilities/generate/tool-calling

## Tool calling

### What is tool calling?

Tool calling enables your system to seamlessly interact with external services such as APIs, databases, or custom functions, transforming static models into dynamic, real-world tools.
Developers can define custom tools within the tools array, specifying their purpose, inputs, and outputs. The model then dynamically generates tool call signatures in JSON format, unlocking a wide range of capabilities, including:

- **API calls**: LLMs can call APIs to retrieve real-time data, such as weather updates, stock prices, news, etc.
- **Database queries**: The model can interact with databases to pull specific data.
- **Automation tasks**: LLMs can trigger workflows or automation tools (like Zapier or other RPA platforms).
- **Code execution**: The model can generate code and trigger it using a tool call for immediate execution.

### Examples

#### Example 1: Request for weather data

**Request**

```python
from openai import OpenAI  # openai==1.52.2
import json

client = OpenAI(
    api_key="UPSTAGE_API_KEY_INJECT",
    base_url="https://api.upstage.ai/v1"
)

## Step 1: Setup and define the function
## This is an example dummy function hard coded to return the same weather
## In production, this could be your backend API or an external API
def get_current_weather(location, unit="fahrenheit"):
    """Get the current weather in a given location"""
    if unit is None:
        unit = "fahrenheit"

    if "seoul" in location.lower():
        return json.dumps({"location": "Seoul", "temperature": "10", "unit": unit})
    elif "san francisco" in location.lower():
        return json.dumps(
            {"location": "San Francisco", "temperature": "72", "unit": unit}
        )
    elif "paris" in location.lower():
        return json.dumps({"location": "Paris", "temperature": "22", "unit": unit})
    else:
        return json.dumps({"location": location, "temperature": "unknown"})

## Step 2: Send the query and available tools to the model
def run_conversation():
    messages = [
        {
            "role": "user",
            "content": "What's the weather like in Seoul?",
        }
    ]

    tools = [
        {
            "type": "function",
            "function": {
                "name": "get_current_weather",
                "description": "Get the current weather in a given location",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "location": {
                            "type": "string",
                            "description": "The city and state, e.g. San Francisco, CA",
                        },
                        "unit": {"type": "string", "enum": ["celsius", "fahrenheit"]},
                    },
                    "required": ["location"],
                    "additionalProperties": False,
                },
            },
        }
    ]

    # Step 3: Check if the model has requested a tool call
    # The model identifies that the query requires external data (e.g., real-time weather) and decides to call a relevant tool, such as a weather API.
    response = client.chat.completions.create(
        model="solar-pro4",
        messages=messages,
        tools=tools,
        tool_choice="auto",
        parallel_tool_calls=False
    )
    response_message = response.choices[0].message
    tool_calls = response_message.tool_calls

    if not tool_calls:
        return response

    # Step 4: Execute the tool call
    # The JSON response from the model may not always be valid, so handle errors appropriately
    if tool_calls:
        available_functions = {
            "get_current_weather": get_current_weather,
        }  # You can define multiple functions here as needed
        messages.append(response_message)  # Add the assistant's reply to the conversation history

        # Step 5: Process each tool call and provide the results to the model
        for tool_call in tool_calls:
            function_name = tool_call.function.name
            function_to_call = available_functions.get(function_name)
            if function_to_call is None:
                raise ValueError(f"Tool not allowed: {function_name}")

            try:
                function_args = json.loads(tool_call.function.arguments)
            except json.JSONDecodeError as exc:
                raise ValueError("Tool arguments must be valid JSON") from exc

            if not isinstance(function_args, dict):
                raise ValueError("Tool arguments must be a JSON object")
            unexpected = set(function_args) - {"location", "unit"}
            if unexpected:
                raise ValueError(f"Unexpected tool arguments: {sorted(unexpected)}")

            location = function_args.get("location")
            unit = function_args.get("unit", "fahrenheit")
            if not isinstance(location, str) or not location.strip():
                raise ValueError("location must be a non-empty string")
            if unit not in {"celsius", "fahrenheit"}:
                raise ValueError("unit must be celsius or fahrenheit")

            function_response = function_to_call(
                location=location,
                unit=unit,
            )  # Call the function with the provided arguments
            messages.append(
                {
                    "tool_call_id": tool_call.id,
                    "role": "tool",
                    "name": function_name,
                    "content": function_response,
                }
            )  # Append the function response to the conversation history

        # Step 6: Generate a new response from the model using the updated conversation history
        second_response = client.chat.completions.create(
            model="solar-pro4",
            messages=messages,
        )
        return second_response  # Return the final response from the model

response = run_conversation()
print(response.choices[0].message.content)
```

**Response**

```
The current weather in Seoul is 10 degrees Celsius.
```

#### Example 2: Retrieving information from structured data

**Request**

```python
import json
import os
from typing import List

from openai import OpenAI  # openai==1.52.2
import pandas as pd


client = OpenAI(
    api_key="UPSTAGE_API_KEY_INJECT",
    base_url="https://api.upstage.ai/v1"
)


## Step 1. Setup and create structured data
## This is a hard coded dummy data to demonstrate the tool call capability
## In production, this could be your internal database

## Create data(MAU and revenue)
mau_data = [
    {"Month": 1, "Service": "LLM", "MAU": 100},
    {"Month": 1, "Service": "Embedding", "MAU": 50},
    {"Month": 2, "Service": "LLM", "MAU": 150},
    {"Month": 2, "Service": "Embedding", "MAU": 70},
    {"Month": 3, "Service": "LLM", "MAU": 300},
    {"Month": 3, "Service": "Embedding", "MAU": 80},
    {"Month": 4, "Service": "LLM", "MAU": 350},
    {"Month": 4, "Service": "Embedding", "MAU": 150},
]
mau = pd.DataFrame(mau_data)

revenue_data = [
    {"Month": 1, "Service": "LLM", "Revenue": 1000},
    {"Month": 1, "Service": "Embedding", "Revenue": 500},
    {"Month": 2, "Service": "LLM", "Revenue": 1500},
    {"Month": 2, "Service": "Embedding", "Revenue": 700},
    {"Month": 3, "Service": "LLM", "Revenue": 3000},
    {"Month": 3, "Service": "Embedding", "Revenue": 800},
    {"Month": 4, "Service": "LLM", "Revenue": 3500},
    {"Month": 4, "Service": "Embedding", "Revenue": 1500},
]
revenue = pd.DataFrame(revenue_data)


## Step 2. Define the function
## This function query_data is designed to filter data from either the MAU or Revenue tables based on the months and service specified.
## It returns a filtered DataFrame based on these criteria.
## This function will be later utilized by the LLM as part of the tool call mechanism to dynamically answer queries.

## Example question
question = "Use the query_data tool to find Revenue for service LLM in months 1, 2, and 3."

def query_data(table_name: str, month: List[int], service: str) -> pd.DataFrame:
    """
    Query data from the given table based on month and service.
    """
    if table_name == "MAU":
        data = mau
    elif table_name == "Revenue":
        data = revenue
    else:
        raise ValueError(f"Table name {table_name} not found.")

    return data[(data["Month"].isin(month)) & (data["Service"] == service)]


## Step 3. Define tools for tool calling
## This block defines a tools array that registers the query_data function as an available option for the LLM.
## It provides the model with information about the available functions and its expected parameters, enabling the model to dynamically call the functions during conversations.
tools = [
    {
        "type": "function",
        "function": {
            "name": "query_data",
            "description": "Query MAU or Revenue data for specified months and service.",
            "parameters": {
                "type": "object",
                "properties": {
                    "table_name": {
                        "type": "string",
                        "description": "The table name to query.",
                        "enum": ["MAU", "Revenue"],
                    },
                    "month": {
                        "type": "array",
                        "items": {"type": "integer"},
                        "description": "The list of months to query.",
                    },
                    "service": {
                        "type": "string",
                        "description": "Which service to query.",
                        "enum": ["LLM", "Embedding"],
                    },
                },
                "required": ["table_name", "month", "service"],
                "additionalProperties": False,
            },
        },
    }
]


## Step 4. User message and initial LLM response
## The LLM receives a user message inquiring about the revenue in the 1st quarter for LLM. Along with this, the tools list (including query_data) provided, enabling the model to decide whether a tool call is needed.
## If the model determines that the query_data function should be used, it will generate a request, which will be handled in the next step.

messages = [
    {
        "role": "user",
        "content": question,
    }
]

response = client.chat.completions.create(
    model="solar-pro4",
    messages=messages,
    tools=tools,
    tool_choice={"type": "function", "function": {"name": "query_data"}},
    parallel_tool_calls=True,  # Enable parallel tool calls
)


## Step 5. Function execution and tool call handling
## The LLM’s response includes a tool call (tool_call), indicating the model has chosen to call the query_data function.
## The tool call contains the function name and arguments, which are extracted and parsed.
## The query_data function is executed using the extracted arguments.

response_message = response.choices[0].message
tool_calls = response_message.tool_calls
if not tool_calls:
    raise RuntimeError("The model did not return the required tool call")
tool_call = tool_calls[0]

## Define the available functions
available_functions = {
    "query_data": query_data,
}

messages.append(response_message)

## Retrieve the function name and corresponding callable function
function_name = tool_call.function.name
function_to_call = available_functions.get(function_name)
if function_to_call is None:
    raise ValueError(f"Tool not allowed: {function_name}")

## Parse the function arguments from the tool call
try:
    function_args = json.loads(tool_call.function.arguments)
except json.JSONDecodeError as exc:
    raise ValueError("Tool arguments must be valid JSON") from exc

if not isinstance(function_args, dict):
    raise ValueError("Tool arguments must be a JSON object")
unexpected = set(function_args) - {"table_name", "month", "service"}
if unexpected:
    raise ValueError(f"Unexpected tool arguments: {sorted(unexpected)}")

table_name = function_args.get("table_name")
month = function_args.get("month")
service = function_args.get("service")
if table_name not in {"MAU", "Revenue"}:
    raise ValueError("table_name must be MAU or Revenue")
if (
    not isinstance(month, list)
    or not month
    or not all(type(value) is int for value in month)
):
    raise ValueError("month must be a non-empty array of integers")
if service not in {"LLM", "Embedding"}:
    raise ValueError("service must be LLM or Embedding")

## Execute the function with the parsed arguments
function_response = function_to_call(
    table_name=table_name,
    month=month,
    service=service,
)
function_response = json.dumps(function_response.to_dict(orient="records"))


## Step 6. Extend the conversation with function output
## The function’s output is appended to the conversation as a message.
## The model is then prompted to continue the conversation, now informed by the function's results.

## Append the function's response to the conversation history
messages.append(
    {
        "tool_call_id": tool_call.id,
        "role": "tool",
        "name": function_name,
        "content": function_response,
    }
)

## Continue the conversation by sending the updated message history to the LLM
second_response = client.chat.completions.create(
    model="solar-pro4",
    messages=messages,
)

print(second_response.choices[0].message.content)
```

**Response**

```
The revenue for LLM in the 1st quarter was $1000 in January, $1500 in February, and $3000 in March.
```

### Parallel tool calls

Parallel tool calling allows the model to generate multiple tool calls in a single response, enabling concurrent execution of independent tool calls. This is especially useful when you need to retrieve data from multiple sources simultaneously.

#### How to enable parallel tool calls

Set `parallel_tool_calls=True` in your API request:

```python
response = client.chat.completions.create(
    model="solar-pro4",
    messages=messages,
    tools=tools,
    tool_choice="auto",
    parallel_tool_calls=True  # [!code highlight]
)
```

When the model determines that multiple independent tool calls are needed (e.g., fetching weather for three different cities), it will return multiple `tool_calls` in a single response. You should process all tool calls and append their results to the conversation before making the next API call.

---

> Source: /docs/capabilities/generate/faq

## Generate FAQ

Answers to the questions we hear most often about building with Solar — for everything else, see the [full FAQ](/docs/resources/faq).

_Accordions (rendered on the docs page)_

---

