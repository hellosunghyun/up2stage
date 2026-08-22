# Studio

> Source: /docs/studio/create

## Create an agent

Hand it to Grace, build it yourself, or start from the Library — whichever fits you. All three produce the
same kind of agent, and you can edit it freely afterwards.

### The Studio workspace

You navigate with the left sidebar and work in the main area. The three menus you will use most are
**Home**, **Agents**, and **Library**.

_HomeLayout (rendered on the docs page)_

| Menu              | Role                     | What it's for                                                                                        |
| ----------------- | ------------------------ | ---------------------------------------------------------------------------------------------------- |
| **Home**          | Starting point           | Create an agent from the Grace prompt box; jump back to recently edited agents                       |
| **Agents**        | Manage your agents       | Full list, favorites, renaming, and per-agent monitoring                                             |
| **Library**       | Browse templates         | Explore ready-made agents and copy one into your workspace                                           |
| **Recent chats**  | Grace history            | Every conversation you had with Grace — pick any of them back up                                     |
| **Monitoring**    | Performance metrics      | Open from the case panel or the agent list — see [Monitoring](/docs/studio/monitoring)               |
| **Grace**         | Conversational assistant | Builds and edits agents for you in chat — from the Home box (below) or the Grace tab inside an agent |
| **Notifications** | Updates                  | Quick Tune results, Library publication, and more, with an unread badge                              |

#### Managing the agent list

- **Favorites** — Star an agent card to pin it to the top of the list.
- **Rename** — Change the name from the card menu or from the header inside the agent.
- **Delete** — The confirmation dialog lets you choose whether to delete the attached files too. An agent that is
  currently link-shared must have sharing turned off before it can be deleted.

#### Personal settings

Open settings from the account menu at the bottom of the sidebar.

- **Profile** — Account details such as name and email. Account deletion also lives here (everything is permanently erased, so be careful).
- **Preferences** — Theme (light/dark) and language (한국어 · English · 日本語).
- **Confidence score** — Whether and how to flag results that need a second look. See [Reviewing results](/docs/studio/feedback-loop#reading-confidence-indicators).
- **API keys** — The keys connected to your account.

"Build on Home, manage under Agents, borrow from the Library — three menus cover the entire life cycle of an agent."

---

### Three ways to start

[Let Grace do it](#building-with-grace) — Describe the task in chat and get a working draft.

[Build it yourself](#the-agent-builder) — Start from an empty agent and wire the nodes.

[Start from the Library](/docs/studio/sharing#starting-from-the-library) — Copy a proven template and adapt it.

| Your situation                                                           | Recommended                                                                                 |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| New to Studio, want to see a result fast                                 | **Let Grace do it** — attach a document while you explain, and it will draft the schema too |
| The rules are clear and you want to design the nodes and schema yourself | **Build it yourself** — add nodes and write the schema manually                             |
| Automating a common task like receipt processing or contract review      | **Start from the Library** — begin from a validated template                                |

When building it yourself, pick a scenario and upload documents, and Studio offers **Auto setup** or
**Manual setup**. Auto setup analyzes the uploaded files and configures the nodes and schema for you.

> Not sure what to build yet? Browsing the [Library](/docs/studio/sharing#starting-from-the-library) is a good start on its own —
> seeing how finished agents are put together, along with their sample results, gives you a solid reference point.

---

### Building with Grace

**Grace** is the conversational assistant built into Studio. You do not have to learn any settings screen
first — describe your document task in chat, and Grace builds an agent with the nodes and schema it needs.
It also handles edits afterwards: adding schema fields, adjusting classification rules, even diagnosing why
a result looks wrong ([Improving with the Grace tab](/docs/studio/feedback-loop#improving-with-the-grace-tab)).

#### Describe the task in the Home prompt box

Type what you want to automate into the box in the middle of the Home screen.

For example: _"Pull the item, unit price, and total from the quote PDFs our vendors send, and lay them out in a table."_

#### Attach a sample document for better accuracy

Attach a real file to the prompt box and Grace will analyze its structure to build a more accurate schema.
When it creates the agent it asks _"Add the N files from this chat to the new agent as well?"_ — just confirm.

#### Answer Grace's questions

Grace asks about anything it is missing, usually as multiple choice. Once it has your document types,
the fields to extract, and any decision criteria, it produces a draft agent.

#### Check the agent and run it

When generation finishes you land on the agent screen, where you can review the nodes and schema.
See [Running an agent](/docs/studio/feedback-loop#running-an-agent) for how to upload files and run.

#### Keep improving through conversation

If something is off after a run, open the **Grace** tab on the right edge of the agent screen and ask for changes there —
see [Improving with the Grace tab](/docs/studio/feedback-loop#improving-with-the-grace-tab).

#### What Grace is and isn't good at

| Good at                                                          | Out of scope                                              |
| ---------------------------------------------------------------- | --------------------------------------------------------- |
| Turning a task description into node structure and schema design | General requests unrelated to document processing         |
| Analyzing an attached document to suggest fields                 | Anything that would need a capability Studio doesn't have |
| Editing the settings of an existing agent                        |                                                           |
| Answering questions about Studio features and usage              |                                                           |

For out-of-scope requests, Grace suggests the closest thing it can do instead.

> **How to explain it well** — write one line each for ① the document type (quote, resume, and so on),
> ② the fields you want, and ③ the criteria, if a judgment is involved. The more specific you are, the better the first draft.

Conversations with Grace are saved under **Recent chats** in the sidebar, so you can always pick them back up.
Grace availability may differ depending on your region.

"With Grace you just describe the job — name the document type, the fields, and the criteria, and Grace does the node design."

---

### The agent builder

The agent builder is where you connect nodes into a pipeline. You switch between nodes in the top bar, and
the area below is split into three panels.

_BuilderLayout (rendered on the docs page)_

#### The three panels

1. **Case panel** — The list of uploaded cases. A _case_ is one unit of processing: it can be a single file or a
   bundle of files. Use the checkboxes to pick what to run, and the controls at the top to switch between
   table, detail, and monitoring views.
2. **Document viewer** — A preview of the original pages of the selected case, so you can compare the source with
   the extracted values side by side while reviewing.
3. **Config and results panel** — Click a node (Parse · Classify · Extract · Instruct) in the top bar to see that node's
   output here, as a preview or as JSON. To change a node's settings, open the config panel with **Edit agent**.

#### Adding and configuring nodes

Adding, removing, and editing nodes all happens in the config panel. Open and close it with the **Edit agent**
button or the <kbd>A</kbd> key.

#### Open the config panel

Click **Edit agent** on the agent screen, or press <kbd>A</kbd>. Press it again to close.

#### Add a node

In the node bar at the top of the panel, click the **＋** on the node you want. You can add Classify, Extract,
and Instruct — including more than one of the same kind (two Instruct nodes, for example).

#### Parse is always included

Parse is the starting node of every agent and cannot be removed. The screen labels it as a default step that
can't be deleted.

#### Configure the node

Click a node on the canvas to fill in its settings. Each node's options are covered in
[Nodes](/docs/studio/key-features).

Every time you change a config and run, Studio records a new **configuration version**, so you can experiment
safely — see [Drafts and config versions](/docs/studio/deployment#drafts-and-config-versions).

#### Uploading cases

| Item                | Details                                                                                                                                                                              |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **How to upload**   | The upload button next to **Run** at the top right, or drag and drop. The button offers the two modes below                                                                          |
| **File upload**     | Each selected file becomes its own case — 10 files means 10 cases and 10 results                                                                                                     |
| **Combined upload** | Several files are bundled into one case and processed together, producing a single result. For example, a contract plus three attachments uploaded together are reviewed as one item |
| **Auto-run**        | Turn on **Run on upload** in the upload dialog and each case runs as soon as it finishes uploading — handy for repetitive batches                                                    |
| **Organizing**      | Cases can be sorted by date or name, and deleted in bulk (deletion can't be undone)                                                                                                  |
| **Limits**          | Up to 500 MB and 1,000 pages per file — see [supported formats](/docs/studio/#supported-file-formats-and-limits)                                                                     |

> **Stuck while building manually? Hand it to Grace.** Open the **Grace** tab on the right edge of the agent screen and
> the assistant appears as a side panel — the same one that built your agent above. Ask it something like
> _"add an issue date field to the schema"_ and it will edit the agent you're working on. Mixing manual editing and
> Grace edits is perfectly fine.

**Renaming** — Click the agent name in the header to edit it. You can also rename from the agent list.

"The builder’s basic path is upload cases → add nodes → configure nodes → run — and when you get stuck, just tell the Grace tab."

---

> Source: /docs/studio/key-features

## Nodes

Learn the role and settings of each node and you can automate most repetitive document work. Connect them
visually in the [agent builder](/docs/studio/create#the-agent-builder) to shape your own pipeline.

### Parse

Converts any document format into text — the starting point of every agent.

### Classify

Sorts documents into your document types, and can split them with Split mode.

### Extract

Pulls the fields defined in your schema, as structured data.

### Instruct

Takes the results and summarizes, transforms, validates, or decides.

### Parse

Parse is the starting point of every pipeline. It converts PDFs, images, Office documents, HWP files — any
format — into machine-readable text (HTML and Markdown).

#### When do you use it?

- **In every agent** — every file goes through Parse, and the downstream nodes take its output as their input.
- Scanned documents and images are read with OCR; text documents are converted with their structure analyzed.
- It is especially useful when you need the content of tables, charts, and equations with their structure intact.

#### Main settings

The basic settings only contain the model, which is configured automatically for your document — leave it as
is. The options below appear once you open **Advanced settings**.

| Setting      | Options                                      | How to choose                                                                                                                                              |
| ------------ | -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Mode**     | Auto / Basic / Advanced                      | _Auto_: picks the best mode per page · _Basic_: clean, well-structured documents · _Advanced_: complex layouts with many visual elements                   |
| **OCR**      | Images only / Always                         | If scans and photos are mixed in, or recognition quality is disappointing, choose **Always**                                                               |
| **Language** | Auto / English / Korean / Japanese / Chinese | If the document language is fixed, naming it is more accurate                                                                                              |
| **Nightly**  | Checkbox                                     | Only if you want to try the latest experimental build first. New features land here first, but stability isn't guaranteed and it can change without notice |

#### Other advanced options

| Setting                     | When to turn it on                                                                                                                                     |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Chart recognition**       | Documents where the numbers inside charts matter (performance decks and the like). Converts charts into tables. Enabled automatically in Advanced mode |
| **Merge multi-page tables** | When a table continues across pages (financial reports, settlement sheets) — merges them into one table                                                |
| **Coordinates**             | Returns the coordinates of each element. Use it when you need to trace or audit where a value came from                                                |
| **Output format**           | HTML (check layout) / Markdown (feed into prompts) / Text (plain review)                                                                               |
| **Image extraction**        | Only when you also need the pictures and charts inside the document as images                                                                          |
| **DPI**                     | PDF conversion resolution — 150 (default) / 200 / 300. Raise it for documents with small type                                                          |

#### Checking the result

Parse results are shown in **Preview · HTML · Text · Markdown · JSON** tabs. Watermarks are removed
automatically.

> **If recognition quality disappoints, try these in order** — ① switch OCR to **Always** → ② switch Mode to **Advanced**
> → ③ raise DPI to 300 → ④ replace the file with a sharper original.

"Parse is the agent’s input normalizer — whatever the document format, it becomes text the downstream nodes can read."

---

### Classify

Classify sorts a mixed pile of documents into document types you define yourself. It is the branching point
that lets you apply a different schema and different handling per type.

#### When do you use it?

- When several kinds of documents arrive mixed together — receipts, contracts, invoices.
- When the same kind of document needs a different schema per vendor.
- When one PDF contains several documents that have to be handled separately (splitting).

You can skip Classify if all your documents are already one type and share a single schema.

#### Defining document types

Add the names of the types you want, and write a description for each. The description is the prompt the
model classifies with, so the clearer and more specific it is, the more accurate the result.

| Field           | Example                                                                                                 |
| --------------- | ------------------------------------------------------------------------------------------------------- |
| **Type name**   | Domestic receipt, Overseas receipt, Tax invoice                                                         |
| **Description** | _A receipt showing a Korean business name and an amount in KRW_ — spell out whatever is easy to confuse |

- **Auto-generate (Beta)** — Generates document types from your uploaded documents. Select the cases and click
  **Auto-generate**. It may take a while.
- **Reuse a setup** — Document types built in one agent can be reused in another. Save them with **Export as JSON**,
  then **Import JSON** in the other agent and the types, descriptions, and Split settings come across intact.
  Treat a well-tuned classification setup as a team standard.

> **Always add an "Other" type.** Without an escape hatch for documents that belong nowhere, the model will force them
> into an existing type and cause misclassification. If you classify FedEx and UPS invoices, add an **Other** type for
> anything that is neither.

#### Hierarchical classification

Document types don't have to be a flat list. You can define up to **three levels** to organize a large number of
types systematically.

- Click **Add sub-level** on a type row to add types beneath it (three levels maximum).
- For example: Invoice (level 1) → Courier invoice (level 2) → UPS shipping invoice (level 3).
- The description at every level is used as a classification prompt, so put broad criteria at the top and specific
  distinctions further down.
- After a run, the classification tree in the results shows which branch each document landed in.
- **Design rules** — leaf type names must be unique across the whole tree, and every intermediate level needs at least one
  child. If you only have a handful of document types, one flat level is plenty.

#### Fixing classification errors

- **Edit only the description of the type that's wrong.** Leave the ones that work alone.
- Descriptions are natural language, so refine them iteratively. You can state conditions too, e.g. _"FedEx invoices over \$10,000"_.
- You can also combine two levels of criteria inside a single Classify node — splitting into _UPS shipping invoices_ and
  _UPS non-shipping invoices_ gets you finer granularity without adding another node.

#### Split — Classify's second mode

Classify runs in two modes: the default mode, which only classifies, and **Split** mode, which first divides a
case (one file or a bundle) into individual documents and then classifies each one. Both take the whole case as
input; the difference is the unit of processing.

| Mode                     | What it does                                                                | Suited for                                     |
| ------------------------ | --------------------------------------------------------------------------- | ---------------------------------------------- |
| **Classify only**        | Treats the whole case as one document and assigns it a single type          | One document per case                          |
| **Split, then classify** | Divides one file or file group into several documents, then classifies each | Several documents mixed into one file or group |

#### Split criteria

| Criterion                               | Behavior                                                                            | Suited for                                               |
| --------------------------------------- | ----------------------------------------------------------------------------------- | -------------------------------------------------------- |
| **Auto-detect documents** `Recommended` | Treats the input as one stream and cuts wherever a new document starts              | Most cases — start here                                  |
| **Split by file**                       | Separates a combined file along its original file boundaries                        | Scanned bundles where separate files were merged         |
| **Split by page**                       | Classifies each page while keeping page order                                       | Bulk scans of one-page receipts or forms                 |
| **Split by page, then group by type**   | Classifies each page, then groups pages of the same type together                   | Pages of the same document arriving out of order         |
| **Custom**                              | Define your own split rule — cut at pages containing a given word, or every N pages | When you have a clear marker like a company name or date |

> When splitting by an identifier, test thoroughly. If you split on invoice number, check the results to make sure the model
> isn't looking at a similar field such as a tracking number instead.

"Classify is the junction that routes a mixed pile of documents into type-specific lanes — so every node after it can behave differently per type."

---

### Extract

Extract pulls specified fields — names, amounts, dates — out of a document as structured data. The heart of it
is **schema design**: defining what to pull and how.

#### When do you use it?

- When you need specific fields from a document as structured output such as a table or JSON.
- When the same fields must be extracted consistently from documents that repeat the same layout.

#### Building a schema

A schema is a list of the fields to extract. Each field has four properties.

| Property        | What it is                                                                               | Example                                      |
| --------------- | ---------------------------------------------------------------------------------------- | -------------------------------------------- |
| **Name**        | The field identifier (up to 100 bytes)                                                   | `vendor_name`, `total_amount`                |
| **Description** | The prompt you give the model (up to 1,000 bytes) — the single biggest lever on accuracy | _The vendor name at the top of the document_ |
| **Type**        | The data type of the value                                                               | String / Number / Boolean, and so on         |
| **List**        | Check this when the same structure repeats                                               | Line items, work history                     |

For repeating row groups — several fields forming one set, like line items — use **Add table** to define a group
table.

> **Reuse your schemas.** Save a finished schema with **Export fields** as a JSON file, and one **Import fields from JSON**
> in another agent brings the same names, descriptions, and types across. Treat a carefully tuned schema as a team standard.

#### Writing good descriptions (mini-prompting)

The description field is a prompt sent to the model. Use it for these five things.

| Purpose               | Example                                                               |
| --------------------- | --------------------------------------------------------------------- |
| **Locate**            | _The vendor name, usually at the top left of the document_            |
| **Include / exclude** | _Exclude corporate suffixes such as LLC or Inc_                       |
| **Format**            | _A dollar amount including decimals down to the cent_                 |
| **Disambiguate**      | _Use only the amounts in the line-item detail, not the summary table_ |
| **Normalize**         | _Format dates as YYYY-MM-DD_                                          |

> **Don't skip the table description.** Group tables have a top-level description too. Something like
> _"the line items from the detailed billing section, not the summary table"_ is what lets the model find the right group of data.

#### Mapping schemas to document types

If there is a Classify node upstream, connect each document type to the schema that should apply to it. For
example: domestic receipts → the Korean-field schema, overseas receipts → the English-field schema. You can
also leave a type (such as "Other") unmapped so it is skipped.

> **Don't casually change the schema structure of a production agent.** If extraction results feed a database, adding or
> removing fields or changing types can break the data pipeline. In production, improve accuracy mainly by editing
> **descriptions**, and coordinate structural changes with whoever owns the database.

"Extract lives or dies on schema design — the more precise the field names and descriptions, the more reliably the AI finds the right value."

---

### Instruct

Instruct is the node you give natural-language instructions to. It takes the previous node's output and does
post-processing: summarizing, transforming, validating, deciding.

#### When do you use it?

| Purpose                          | Example                                                                               |
| -------------------------------- | ------------------------------------------------------------------------------------- |
| **Normalizing data**             | `$1,000` → `1000`; standardize dates to `2026-01-05`                                  |
| **Comparing against a baseline** | Compare extracted contract terms with your standard terms and flag deviations         |
| **Summarizing**                  | Condense a document or a set of extracted fields into a structured brief              |
| **Validating**                   | Cross-check business rules — e.g. _"line item amounts must sum to the invoice total"_ |
| **Deciding / branching**         | Pick one of a fixed set of decisions such as approve or reject                        |

#### Choosing a type

- **Generate only** — Returns a free-form text response following your prompt. Right for summaries, translations, and
  transformations where no fixed decision value is needed.
- **Generate and decide** — Makes a judgment and picks one of the options you defined in advance (for example, approve
  or reject). Downstream nodes can branch on the decision value.

#### Writing the prompt

In the prompt box, type `@` to reference an extracted field from an upstream Extract node, and `#` to reference
the decision value of another Instruct node.

```text
Check the receipt details and reject if the total payment exceeds 10,000 KRW.

Respond in exactly this format.
Decision: [Approve / Reject]
Amount: @total_amount
Reason: (one sentence)
```

> **Three ingredients of a good prompt** — ① state the criteria as numbers and conditions
> (_"please review"_ ✕ → _"reject if the total exceeds 10,000 KRW"_ ✓), ② reference upstream results with `@field_name`,
> ③ spell out the output format you want.

#### Where to place it

- **After Extract** — normalize, validate, and judge the extracted fields (the most common placement).
- **After Classify** — summarize or route by document type without extracting anything.
- **Standalone (after Parse)** — a general-purpose LLM prompt over the whole document.

Rather than handing a whole document to a general-purpose LLM, letting Extract handle document understanding
and Instruct handle post-processing means the transformation and judgment happen on clean, verified data —
which produces markedly more reliable results.

"Instruct is the agent’s decision engine — pull upstream results in with @ and normalize, validate, and make the final call."

Not every workflow needs every node — see [Use cases](/docs/studio/use-cases) for how the four nodes are assembled into real work.

---

> Source: /docs/studio/use-cases

## Use cases

Four representative examples of how the four nodes are assembled into real work. If your task is similar, take
the structure as is and change only the schema and the prompt.

### Resume screening

- **Extract** — a schema for name, contact, work history, and tech stack.
- **Instruct** — use **Generate and decide**, put criteria such as _"5+ years of relevant experience preferred;
  flag for follow-up when information is missing"_ in the prompt, and decide between _Advance_ / _Needs review_ / _Reject_.
- **Why it works** — details scattered differently across every applicant get sorted onto the same axis, giving you
  comparable evidence.

---

### Expense processing

- **Classify** — define the document types _Domestic receipt_ / _Overseas receipt_ / _Other_.
- **Extract** — map a schema per type (domestic: merchant, issue date, amount / overseas: `store_name`, `currency`, `total_amount`).
- **Instruct** — decide approve or reject on a rule such as _"reject if the total exceeds 10,000 KRW"_.
- **Why it works** — upload receipts as individual files and the same review runs against every case. When you bundle
  several receipts into one case, add Split mode as in the next example.

---

### Mixed scan bundles — using Split

A stack of scans containing contracts, receipts, and invoices all at once.

- **Classify** — **Split, then classify** mode with **Auto-detect documents** as the split criterion. It finds where each new
  document starts inside the bundle, cuts there, and classifies each piece.
- **Extract** — extracts from each split document with the schema mapped to its type, producing as many results as there
  are documents.
- **Why it works** — in Split mode one case yields several document-level results, so reviewing row by row in the
  [table view](/docs/studio/feedback-loop#table-view) is much easier.

> In the default mode one case produces one result. In Split mode one case produces several results, one per document.

---

### Comparing quotes

- **Extract** — pull item, unit price, total, and delivery date with a table schema.
- **Instruct** — reference `@item` and `@total_amount` to build a vendor comparison table, summarizing the lowest price and
  the differences in terms.
- **Why it works** — vendors use different layouts, but Extract normalizes them into the same structure, which makes the
  comparison straightforward.

---

### Contract review

- **Classify** — sort by contract type (services, purchase, NDA, and so on).
- **Extract** — pull the term, value, penalty, and termination clauses.
- **Instruct** — compare against your standard terms, flag unfavorable or ambiguous clauses, and judge whether legal review
  is needed.
- **Why it works** — the more you state the criteria as numbers (_"needs review if the penalty clause exceeds 10% of the
  contract value"_), the more consistent the outcome.

> **Not sure how to design yours?** Describe the task in the Home prompt box and let
> [Grace draft it](/docs/studio/create#building-with-grace), or copy a similar agent
> [from the Library](/docs/studio/sharing#starting-from-the-library).

---

> Source: /docs/studio/feedback-loop

## Run and review

Studio is designed to get better with feedback. The cycle is simple: **run** the agent, **correct** the
exceptions during review, and **update** the configuration — through Quick Tune or through Grace. As accuracy
improves, the manual work drops toward zero.

### Running an agent

Select your cases and press **Run**, and the pipeline executes in order. There is no separate save button —
your edits are saved automatically as a draft, and the moment you run, they are committed as a new config
version.

#### What one run does

- If you have edited the config, the draft is committed automatically as a new config version (Config #N). No save button to hunt for.
- The selected cases are processed with that committed config.
- Until you run, your edits stay in **draft** state — see [Drafts and config versions](/docs/studio/deployment#drafts-and-config-versions).

#### Before you run

#### Did you select any cases?

Tick the checkboxes of the cases to process. With nothing selected, the Run button is disabled and reads
_"Select documents to run."_

#### Are there any config errors?

If a required setting is empty you'll see _"N config errors — click to fix."_ Clicking takes you to the offending node.
For example: an Extract node with no schema, or a Classify node with no document types.

#### Do you have free runs left?

The badge next to the Run button shows _"N / M free runs used."_ Past the free quota, a billing notice appears before
the run proceeds.

#### While it runs

- Run status appears in real time in both the file list and the results panel.
- Processing usually takes minutes, depending on document length and pipeline complexity.
- Started the wrong run? **Cancel job** stops it. Cancellation can't be undone.

> **Bulk processing belongs on the API.** Running from the screen is optimized for testing and review. If you process
> hundreds of documents a day, see [Automating with the API](/docs/studio/deployment#automating-with-the-api).

"When a run won’t start, read the message above the button — the screen tells you whether it’s file selection, a config error, or the free quota."

---

### Reading the results

When a run finishes, the config and results panel becomes the results view. Clicking through the node tabs in
order is the basic path.

| Node tab     | What to check                                                                            | View formats                            |
| ------------ | ---------------------------------------------------------------------------------------- | --------------------------------------- |
| **Parse**    | Whether the document converted cleanly — are tables and headings intact?                 | Preview / HTML / Text / Markdown / JSON |
| **Classify** | Whether documents landed in the intended types, and whether splitting is correct         | Grouped list by document type           |
| **Extract**  | Whether each field's value is right, and whether any confidence warnings appear          | Field list / JSON, with result download |
| **Instruct** | Whether the response follows the format you asked for, and whether the decision is right | Text response (plus decision value)     |

Each node's result can be copied or downloaded from the buttons at the top of the results panel.

> **If a result looks wrong, start from the earliest node.** An empty or nonsensical final result is usually an earlier
> problem propagating downstream. Walk Parse → Classify → Extract → Instruct and find the first stage that went off.

#### Switching views

The top of the case panel switches between three views.

- **Detail view** — the default working screen, comparing one case's source and result side by side.
- **Table view** — the results of many cases laid out in a table (below).
- **Monitoring** — this agent's performance metrics ([Monitoring](/docs/studio/monitoring)).

#### Table view

Table view lays the extracted fields of many cases side by side. It is built for bulk review.

- Scan a single field down the column (every invoice date, say) — change the grouping to re-slice the view.
- Click a cell and the document viewer opens for comparison against the original.
- Edit values directly in the table — your edits become ground truth (below).

"Detail view for one-by-one checks, table view for bulk — and a click on any cell always opens the original."

---

### Reviewing results and ground truth

Studio's accuracy grows through review. When you fix a wrong value and mark a document as reviewed, that value
becomes the **ground truth** that every later improvement is measured against.

#### Reading confidence indicators

| Indicator              | Meaning                                                             | What to do                   |
| ---------------------- | ------------------------------------------------------------------- | ---------------------------- |
| **No indicator**       | The model is highly confident                                       | Skim and move on             |
| **⚠ Warning triangle** | Confidence is below the threshold — this does _not_ mean it's wrong | Compare against the original |

> The confidence threshold is set conservatively, so a warning often sits on a perfectly correct value. Via the API,
> confidence is returned as **low** or **high**. Whether and how warnings appear can be adjusted under **Confidence score**
> in your account settings.

#### The three review actions

#### Edit a value

Double-click a wrong value and fix it (for example, "FedEx" → "UPS"). The same edit works in table view.

#### Confirm it's correct

If a warning is showing but the value is right, click the checkmark to confirm it.

#### Mark as reviewed

Once you've checked every field of a document, click **Mark as reviewed**. Every current value — including the ones you
didn't touch — is confirmed as ground truth. You can still edit values afterwards, but the reviewed state itself can't be undone.

#### What ground truth does for you

**It auto-grades your config changes.** Edit a schema and rerun a reviewed document, and the new results are
compared against the ground truth automatically. Fields that now match show as correct; fields that are still
wrong stay flagged — so you don't re-review everything after every change.

**It tracks real accuracy.** As ground truth accumulates, you can measure actual accuracy, which is far more
trustworthy than confidence scores. The more documents reviewed, the more representative the metric.

#### Human-in-the-loop operations

For production work that needs human review, we recommend this flow:

1. Documents are processed through the API. Processed jobs can be pulled onto the screen from the job list in
   [Monitoring](/docs/studio/monitoring) with **Bring into agent**.
2. A reviewer opens each document, verifies and corrects the values, and clicks **Mark as reviewed**.
3. Only the reviewed results are fetched through a separate API call and written to your production database.

> Start by reviewing everything, then taper off for the document types whose accuracy has climbed high enough — a gradual
> path to full automation. That said, for high-stakes documents such as large transactions, keeping review in place
> regardless of accuracy is the safer call.

"Review is an investment, not a cost — one correction becomes ground truth and then works three times over: auto-grading, accuracy metrics, and Quick Tune."

---

### Quick Tune

**Quick Tune** learns from reviewers' correction patterns and proposes schema improvements automatically. It
doesn't retrain a model — it refines the extraction descriptions (prompts), so changes take effect immediately.

#### How it works

1. Reviewers correct extraction results across several documents.
2. Studio analyzes the correction patterns — targeting repeated problems, not one-off mistakes.
3. A **notification** arrives with the proposal: _"We improved the schema based on your edits"_, _"New extraction fields are ready."_
4. Click **Review new fields** to inspect the proposal and accept, modify, or reject it. Accepting creates a new config version.

#### Best practices

- **It won't react to a single correction** — the system waits for a pattern, so building up review volume comes first.
- **Always review before accepting** — check that a description hasn't been narrowed so much that it breaks existing cases.
- **Test before deploying** — run the new config version against your document set before it goes to production.
- **Proposal quality scales with review volume** — the more documents reviewed, the better the suggestions.

"Quick Tune translates human corrections into schema improvements — keep reviewing and Studio proposes the prompt tuning for you."

---

### Improving with the Grace tab

The **Grace** tab on the right side of the agent screen lets you edit the agent you're looking at through
conversation. No digging through settings screens — just ask.

| What you say                                           | What Grace does                                                       |
| ------------------------------------------------------ | --------------------------------------------------------------------- |
| _"Add a payment method field to the schema"_           | Builds a config change and shows it as a preview                      |
| _"Classification keeps getting this wrong — why?"_     | Inspects the config and results, then proposes a cause and a fix      |
| _"Make this document work too"_ (with a file attached) | Analyzes the document and suggests schema and document-type additions |
| _"Run it with the new config"_                         | Offers to run, and runs the agent once you confirm                    |

#### Applying a change

#### Ask in chat

Start a conversation in the Grace tab and describe what you want changed. Conversations in this tab are saved against
the current agent.

#### Preview the change

Grace shows the proposed config change as a preview, with the differences laid out.

#### Apply to the editor, then save

Applying the change puts the editor into **draft** state. Check it, then press the save button (labeled something like
**Save as v8**) to commit it as a new config version. The previous config stays in version history, so you can always roll back.

> **Grace tab vs. the Home prompt box** — the [Home box](/docs/studio/create#building-with-grace) is for creating a new agent;
> the Grace tab is for improving an existing one. It's the same Grace, so the conversation works the same way.

"If the settings screens feel unfamiliar, just tell the Grace tab — preview → apply → save is only three steps, and versions undo any mistake."

---

> Source: /docs/studio/deployment

## Versions and deployment

Every edit stacks up as a version, production runs against a pinned version, and the API connects the whole
thing to your real systems. Keeping experimentation in Studio separate from what production points at is the
core of running this safely.

### Drafts and config versions

Edit an agent's settings and the next-numbered **draft** is created automatically; the moment you run, it is
committed as a proper **config** version. Every version is kept, which makes experimenting safe.

#### How versions are created

- Change a node setting and the dropdown at the top switches to the next-numbered draft — start editing from Config #7 and
  you're on the Config #8 draft.
- Drafts save automatically. Keep editing; there's no save button to find.
- Press **Run** and the draft is committed as Config #8, and your cases are processed with it.
- When a version is committed, a change summary is recorded — _"Extract step added"_, _"Mode changed from Basic to Advanced"_.
- If you don't want a draft, discard it from the dropdown to go back to the previous version.

#### What the config dropdown can do

| Feature             | What it does                                                                                      |
| ------------------- | ------------------------------------------------------------------------------------------------- |
| **Rename**          | Give a version a meaningful name — _"Optimized for FedEx invoices"_, _"Added decimal formatting"_ |
| **Switch version**  | Select an earlier version and rerun documents against that point in time                          |
| **Compare configs** | Put the differences between two versions side by side                                             |
| **Aggregate**       | Combine the run results of several versions into one view                                         |

> Versions accumulate on their own, so experiment freely — and give the meaningful ones a name so your team can tell them apart.

"Versions stack up by themselves — experiment without hesitation, and name the meaningful ones so your team can recognize them."

---

### The production rollout process

An agent running in production is called with a specific, validated config version.

#### Start from a baseline

Pin a well-tested config (say Config #12) in your API calls and go live with it.

#### Keep improving in Studio

Separately from production, keep editing schemas in Studio and building new versions (#13, #14, #15…).
Production traffic still uses #12, so this is safe.

#### Validate the new version

Rerun your reviewed documents against the new version. They are compared against
[ground truth](/docs/studio/feedback-loop#what-ground-truth-does-for-you) automatically, which tells you whether the new
version is genuinely better.

#### Ship in batches

Don't deploy every version. Accumulate improvements and roll them out together (every four or five versions, for example).
Bump the version number the API points at during a planned window, such as outside business hours.

#### Roll back if it goes wrong

If a new version performs worse, point the API's version number back — that's the whole rollback. You can also switch
back in Studio at any time to reproduce the issue.

> **Don't over-optimize.** A 0.01% accuracy gain isn't worth a production deployment. Wait until meaningful improvements
> have accumulated across several fields, and use [Monitoring](/docs/studio/monitoring) to compare versions.

"Production runs on a pinned version number, experiments live in Studio — ship once validated improvements have piled up."

---

### Automating with the API

You can process documents in bulk through the API, with no screen involved — send documents from your internal
systems and load the results into a database for a fully automated pipeline.

#### Where to find your API details

From the more (**⋯**) menu at the top right of the agent screen, choose **Use via API** to open a step-by-step
reference and code snippets for integrating this agent.

| Element                     | What it is                                                                                                                                          |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Agent ID · Config ID**    | The agent and config version to call. Pick the version you want in the Config ID selector (if no config version exists yet, run once to create one) |
| **API key**                 | Choose the key to use. The default key created at sign-up is connected already; issue and manage more in the Console                                |
| **Code snippets**           | Step 1 upload a file → Step 2 create a job → Step 3 get the job. Toggle between cURL / Python and Linux / Windows and copy as is                    |
| **Guide for AI assistants** | The **Copy code.md** button — paste this into an AI coding assistant when you want it to write the integration                                      |
| **View docs**               | Jumps to the full [Agents API](/docs/agents) specification                                                                                          |

#### The call flow

1. **Upload a file** — upload the document to process and receive a file ID.
2. **Create a job** — request processing with the agent ID, config ID, and file ID. Because you name a specific config version,
   your experiments in Studio never affect production.
3. **Get the job** — query status and results by job ID. Each extracted value comes back with a confidence of `low` or `high`.
4. **(Optional) Get reviewed results** — for work that needs human review, fetch only the results a reviewer has
   [marked as reviewed](/docs/studio/feedback-loop#the-three-review-actions) and write those to your production database.

> Jobs run through the API show up in the [Monitoring](/docs/studio/monitoring) job list (filter source: API), and
> **Bring into agent** pulls them onto the screen for review.

"The screen is where you build and review, the API is where you run it — an API call pinned to a version number is the core of stable operations."

---

> Source: /docs/studio/monitoring

## Monitoring

Monitoring is the dashboard that tracks an agent's throughput, speed, and stability in one place. It surfaces
the node that's becoming a bottleneck and lets you drill into the cause job by job.

### Dashboard layout

| Area                 | Contents                                                                                                            |
| -------------------- | ------------------------------------------------------------------------------------------------------------------- |
| **Filters**          | Agent / config version / source (Studio Web · API) / period (1H · 24H · 7D · 30D · Custom)                          |
| **Key metrics**      | Total jobs · Latency · Stability (success rate) — once ground truth accumulates, accuracy metrics appear too        |
| **Per-node metrics** | Throughput, time, and stability for Parse · Classify · Extract · Instruct — this is how you identify the bottleneck |
| **Job list**         | Individual run history — job ID · config version · file · duration · status · source · created                      |

---

### Working with the job list

- Click a job to open its detail view and see what happened at each stage.
- **Download as Excel** — export the results of selected jobs for reporting or reconciliation.
- **Bring into agent** — pull the documents of an API-processed job onto the agent screen for a closer review.
- Statuses: completed · failed · in progress · queued · cancelled.

---

### Where to open it

- **Monitoring view** at the top of the case panel — this agent only.
- **Monitoring shortcut** in the agent list — per-agent entry.

> **A suggested routine** — check the Stability and Latency trends once a week, and use **Bring into agent** on failed jobs to
> find out why. Right after a deployment, filter by the new config version and compare it against the previous one.

"Read metrics as trends, chase problems job by job — spot the anomaly on the dashboard, then narrow the cause in the job detail."

---

> Source: /docs/studio/sharing

## Sharing and the Library

An agent you've built can be shared with your team by link or published to the Library — and conversely, you
can pull a finished agent out of the Library into your workspace as a starting point.

### Sharing by link

#### Open the share menu

From the menu at the top right of the agent screen, choose **Share by link**.

#### Copy the link and send it

Copy the generated link and pass it to your team. Anyone with the link can view the agent and its run results
without logging in.

#### Manage sharing

**Edit sharing** in the same menu lets you change or stop sharing. The version currently shared is marked with a
link-share badge in the config dropdown.

| Visibility               | Who can access                           | Use for                                   |
| ------------------------ | ---------------------------------------- | ----------------------------------------- |
| **Private** (default)    | Only you                                 | Development and testing                   |
| **Link shared**          | Anyone with the link (no login required) | Internal review, circulating results      |
| **Published to Library** | Everyone browsing the Library            | Publishing a finished agent as a template |

---

### Starting from the Library

- Browse task-oriented agent templates under **Library** in the sidebar. Search, filter by category, language, and node, and
  sort by newest or most used.
- Open one you like, review its structure and sample results, then click **Add to my workspace** to copy it into your agents.
- The copy is yours to edit freely — start by adapting the schema to your own documents.

---

### Publishing your agent to the Library

#### Have a working, already-run agent

You must run the agent before publishing — otherwise you'll see _"Run the agent before publishing."_ Sample results are
shown alongside it, so running it on representative documents is worth doing.

#### Open the publish menu

From the menu at the top right of the agent screen, choose **Publish to Library**.

#### Write the listing

Fill in the name and description (auto-generation available), domain, language, supported document types, sample documents,
and thumbnail. This is what other users search on.

#### Publish and manage

Submit it and it goes live after a review — _"We'll notify you when it's published to the Library."_ The published config
version gets a **Published** badge in the dropdown. You can edit the listing or unpublish later from the Library settings.

> **Watch out for personal and sensitive data.** Publishing to the Library also exposes your sample documents and run results.
> Remove anything containing personal information or internal confidential data before publishing, or swap in samples with no
> sensitive values.

> An agent you added (copied) from the Library can't be published again. Publish from agents you built yourself.

---

### Exporting and importing configurations

You can save an agent's configuration — its node structure and schemas — to a file, for backup or to move it to
another environment or account. Use the more (**⋯**) menu in the agent list or on the agent screen.

| Feature                  | What it does                                                                                                                                                             |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Export agent config**  | Downloads the current agent's configuration as a JSON file                                                                                                               |
| **Import agent config**  | Applies a JSON file's configuration to the current agent — this overwrites the current config, but the previous one stays in version history so you can always roll back |
| **Bulk export / import** | Export several agents at once as a ZIP, or create several agents at once from multiple JSON files or a single ZIP                                                        |

> Individual [Classify document types](/docs/studio/key-features#defining-document-types) and
> [Extract schemas](/docs/studio/key-features#building-a-schema) can also be exported and imported on their own, which is handy
> for sharing a tuned setup across agents.

"Link sharing to circulate results, a Library copy to get started, a Library publication for finished work, config export to migrate and back up — it all compounds into team assets."

---

> Source: /docs/studio/troubleshooting

## Troubleshooting & FAQ

The problems that come up most often in real support requests, grouped by topic. Most of them are solved by
reading the message on screen and working through the steps below.

### Running

#### A run fails with an error — timeout or model error

**Symptoms:** the run fails with something like _Request timed out. Please try again later._,
_Document parsing timed out._, or _The model request failed. Please retry._

**Fix:**

1. Temporary congestion is the usual cause, so retry after a moment (failed runs are not billed).
2. If it repeats on the same file, switch the Parse **Mode** to **Basic** and run again. Documents dense with tables and
   charts are heavy to process on the Auto/Advanced path, which makes timeouts more likely.
3. For _The model returned an incomplete response... reduce the number of pages_, cut the page count of the file and retry.

#### The Run button won't respond

**Cause:** no file selected, no file uploaded, a config error, or a run already in progress.

**Fix:** read the message above the button — _"Select documents to run"_ (tick a file),
_"Fix the config errors before running"_ (click the error indicator and fix that node), or
_"The agent is already running"_ (wait for it to finish).

#### The run won't start — credits or API key

**Cause:** insufficient credits, or no API key connected.

**Fix:** check your remaining credits under Console → Billing → confirm the API key under **Use via API** → retry after a
minute or two.

If you see _"An API key is required"_, use the **Create API key** button in that dialog to make one without leaving Studio.
(A default key is created at sign-up, so this is rarely needed.)

---

### Files and results

#### Upload fails, or some files are skipped

**Cause:** an unsupported format, or exceeding the size or page limit.

**Fix:** confirm the format is supported (PDF, images, Office, HWP, email/web — see
[supported formats](/docs/studio/#supported-file-formats-and-limits)) → confirm the file is under 500 MB and 1,000 pages →
split the file if it's over.

If you see _"N files were skipped"_, that's not an error — unsupported formats were excluded automatically.
ZIP, CSV, TXT and similar are not supported, so convert them to a supported format and upload again.

#### A node's result is empty

**Cause:** low image quality, or text recognition failing.

**Fix:** switch Parse's **OCR** to **Always** → switch **Mode** to **Advanced** → raise **DPI** to 300 → if none of that
helps, replace the file with a sharper original. (If HWP is the problem, convert to PDF and upload that.)

#### The final result doesn't appear

**Cause:** when an upstream node's result is empty, the downstream nodes fail in a chain.

**Fix:** click through the node tabs starting at Parse to find the first stage where the result goes empty → fix that node
using the steps above → run again.

#### Results I already ran have disappeared

**Cause:** when you change the config, results have to be recalculated against the new config, so the completed results look
as if they were reset.

**Fix:** the earlier results are not gone — select the earlier version in the config dropdown at the top and its results come
back. It's best to finalize the config before kicking off a large run
([Versions and deployment](/docs/studio/deployment)).

---

### Config and classification

#### Schema will not save — Invalid Schema error

**Symptoms:** saving fails with _Invalid Schema: The type of properties of object cannot be 'array' of 'object'_.

**Cause:** nesting an array of objects inside another array of objects (a table inside a table) is not supported.

**Fix:** flatten it by one level — keep only simple types such as string and number inside a table, and if you genuinely have
two layers of repetition, split them into separate tables.

#### I corrected a classification but the next run gets it wrong the same way

**Cause:** editing in the results view marks the _ground truth_; it does not change the model's classification criteria.

**Fix:** to change the criteria, edit the document type's description in Classify and run with the new config
([Fixing classification errors](/docs/studio/key-features#fixing-classification-errors)). As ground truth accumulates,
[Quick Tune](/docs/studio/feedback-loop#quick-tune) may also propose improvements.

---

### Screen, Grace, and other

#### The screen freezes or loads forever

**Fix:** refresh the page and run again. If a run goes on abnormally long, cancel the job and rerun. If it keeps happening,
report it through the **Feedback** menu with the time it occurred and your browser details.

#### Grace doesn't respond, or answers strangely

**Fix:** if no response arrives or characters from another language get mixed in, regenerate (retry). That usually clears it.

**Note:** files uploaded in chat and an agent's case list are separate things. If the documents you want to run aren't
visible, upload them directly with the upload button on the agent screen.

#### An agent I added from the Library isn't in my list

**Cause:** **Add to my workspace** wasn't clicked, or the page needs refreshing.

**Fix:** refresh the Agents menu → if it's still missing, reopen that agent in the Library and click **Add to my workspace** →
if it still doesn't appear, get in touch through the **Feedback** menu.

---

### Frequently asked questions

#### General

| Question                                              | Answer                                                                                                                                                                                                                            |
| ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **How are my uploaded documents and results stored?** | Results from Studio agents are stored encrypted and secured, so they can be used for review, monitoring, and accuracy improvement. For details of the data handling policy, see the Console documentation and the privacy policy. |
| **How long does processing take?**                    | Usually minutes — not seconds, not hours. It depends on document length and pipeline complexity. Failed requests are not billed.                                                                                                  |
| **Can it handle thousands of documents a day?**       | Yes, in bulk through the API. Enterprise customers expecting large volumes can discuss capacity scaling with their Upstage representative.                                                                                        |
| **Which document languages are supported?**           | The Parse language setting supports Auto, English, Korean, Japanese, and Chinese.                                                                                                                                                 |
| **How do I work on this with my team?**               | Use **Share by link** to circulate results (no login required). For organization-wide rollout and access management, including SSO, talk to your Upstage representative.                                                          |

#### Limits

| Question                                              | Answer                                                                                                                                                                                                            |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **What are the upload file size and page limits?**    | Up to **500 MB** and **1,000 pages** per file ([supported formats and limits](/docs/studio/#supported-file-formats-and-limits)).                                                                                  |
| **What file formats can I upload?**                   | PDF · images (JPG · JPEG · PNG · TIF · TIFF · HEIC · BMP) · Office (DOC · DOCX · PPT · PPTX · XLS · XLSX) · Hancom (HWP · HWPX) · email/web (MSG · EML · MHT · HTML).                                             |
| **Are there per-node page limits?**                   | Parse, Classify, and Instruct handle up to **1,000 pages** per file. Extract's **Enhanced** mode is limited to **50 pages** per file — for longer documents, switch the mode to **Standard** (up to 1,000 pages). |
| **Why does a file within the page limit still fail?** | Besides page count, the amount of content matters — documents dense with text or complex structure can hit the content (token) limit first. Split the file or reduce pages and retry.                             |
| **How many files can I run at once?**                 | There is no fixed per-run file cap — run as many of your uploaded files as you need. Before a large run, check the estimated cost shown in the pre-run billing notice.                                            |
| **Is there a time limit for runs?**                   | A run that stays in progress for more than **1 hour** is automatically marked as failed. Failed runs are not billed.                                                                                              |
| **How long are uploaded files stored?**               | Until you delete them.                                                                                                                                                                                            |

#### Billing

| Question                                           | Answer                                                                                                                                           |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **How does billing work in Studio?**               | Studio uses your **Console credits and card billing**. Each agent includes **10 free document runs**; after that, usage is billed pay-as-you-go. |
| **Will I be charged if a job fails during a run?** | No — jobs that fail during a run are not charged.                                                                                                |
| **Where can I check pricing?**                     | On the [pricing page](https://www.upstage.ai/pricing/api?utm_source=console\&utm_medium=internal\&utm_campaign=studio-pricing#Upstage-Studio).   |

#### Contact and deployment

| Question                                      | Answer                                                                                                                           |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **Where can I send additional questions?**    | Email **<contact@upstage.ai>**, or use the **Feedback** menu in Studio.                                                          |
| **Is on-prem or local deployment available?** | Yes. For details, contact **<contact@upstage.ai>**.                                                                              |
| **Can I use Studio on AWS Marketplace?**      | Yes — see [AWS Marketplace](https://studio.upstage.ai/aws). For Marketplace-related inquiries, contact **<contact@upstage.ai>**. |

---

### Glossary

| Term              | Definition                                                                                                 |
| ----------------- | ---------------------------------------------------------------------------------------------------------- |
| **Agent**         | A pipeline that processes documents automatically through several stages. The basic unit of work in Studio |
| **Node**          | A functional block responsible for one stage of the pipeline — Parse, Classify, Extract, Instruct          |
| **Pipeline**      | The flow of stages that process a document (e.g. Parse → Classify → Extract → Instruct)                    |
| **Parse**         | The node that converts a document (PDF, image, and so on) into machine-readable text                       |
| **Classify**      | The node that sorts documents into types — invoices, receipts, contracts                                   |
| **Extract**       | The node that pulls specific information out of a document — dates, amounts, names                         |
| **Instruct**      | The node where the AI analyzes, summarizes, or makes a judgment                                            |
| **Case**          | One unit of processing. A single file or a bundle of files; one result is produced per case                |
| **Document type** | A classification category you define in Classify                                                           |
| **Schema**        | The template defining which fields to extract from a document                                              |
| **Config**        | A saved version of an agent's setup. Numbered, and switchable at any time                                  |
| **Draft**         | The next-version candidate, auto-saved while you edit. Running commits it as a proper config version       |
| **Confidence**    | How certain the AI is about a result (`low` / `high`)                                                      |
| **Ground truth**  | The correct values confirmed by a reviewer. The basis for auto-grading and accuracy measurement            |
| **Quick Tune**    | The feature that learns from correction patterns and proposes schema improvements                          |
| **Grace**         | Studio's built-in conversational assistant, which builds and edits agents in chat                          |
| **Job**           | One agent run. Monitoring tracks history job by job                                                        |
| **Free quota**    | The free runs included with each agent (currently 10 document runs)                                        |
| **PAYG**          | Pay-as-you-go. Billing by usage once the free quota is spent                                               |

> Still stuck? Send us feedback through the **Feedback** menu in Studio, including the time it happened and your browser details.

---

