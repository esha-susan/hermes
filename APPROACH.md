# Approach Document — Autonomous Content Factory

## Problem We Solved
Marketing teams manually rewrite the same content for every 
platform — causing burnout, inconsistencies and launch delays.

## Our Solution
A three-agent pipeline where each agent has a single responsibility:
- Research Agent: reads source, produces verified JSON Fact Sheet
- Copywriter Agent: generates platform-specific content from Fact Sheet only
- Editor Agent: validates output against Fact Sheet, triggers regeneration if issues found
- Consistency Checking: to identify any mismatch among the generated content
- Remixing: extending the content generation to different narrative styles
- Audience Reaction Simulation: identifying how differnet persona might react to the generated content

## Key Design Decisions

### Why a multi-agent approach vs one prompt?
Single prompts conflate research and writing, leading to hallucinations.
Separating concerns means each agent can be optimised, tested
and improved independently.

### Why a feedback loop?
The Editor → Copywriter loop mirrors real editorial workflows.
Content isn't just generated — it's reviewed and revised until 
it meets factual standards.

### Why FastAPI + React?
Python is the natural home for AI pipelines. FastAPI's async 
background tasks let us return a campaign ID immediately while 
agents run, enabling a live progress UI without WebSockets.

### Why Supabase?
Campaigns persist across sessions. The JSON columns store 
structured agent outputs without requiring a rigid schema.

## What We'd Improve With More Time
1. RAG for large documents — chunk and embed source material 
   so the system scales to 50+ page technical docs
2. WebSocket streaming — show live token-by-token output 
   instead of polling
3. Multi-model routing — use local models for creative tasks, 
   cloud models for structured extraction
4. Export to PDF/Notion/CMS — direct publishing integrations