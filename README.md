# Hermes — Autonomous Content Factory

## Project Overview

**Hermes** is a multi-agent AI system that automates marketing content creation.  
It generates consistent, platform-specific content across blogs, social media, and email from a single source document. Hermes ensures factual accuracy, proper tone, and audience engagement.

---

## Problem Statement

Marketing teams manually rewrite content for different channels:

* Blog
* LinkedIn / Social Media
* Client Newsletters

Challenges include:

* Repetitive work causing creative burnout
* Inconsistencies in tone and facts
* Delays in product launches due to slow content production

---

## Objective

Build a multi-agent system that:

1. Verifies a source document for facts
2. Transforms it into platform-specific content automatically and consistently
3. Ensures content quality, consistency, and audience engagement

---

## Features

### Fact-Check & Research Agent (Analytical Brain)

* Reads raw source material from text file or URL
* Produces a verified Fact-Sheet in JSON or Markdown
* Extracts core product features, technical specifications, target audience
* Flags ambiguous or unclear statements

### Creative Copywriter Agent (Voice)

* Generates content for multiple channels simultaneously:
  - 500-word Blog Post
  - 5-post Social Media Thread
  - 1-paragraph Email Teaser
* Adapts tone per platform:
  - Professional for blog
  - Engaging for social media
  - Concise for email
* Follows the Fact-Sheet strictly

### Consistency Checker

* Validates content across channels
* Ensures alignment with the Fact-Sheet
* Flags factual and tonal inconsistencies

### Remix Agent

* Creates alternative content versions for A/B testing
* Maintains factual accuracy while experimenting with style

### Audience Reaction Simulator

* Predicts audience engagement per channel
* Suggests improvements to maximize impact

---

## Tech Stack

**Languages:** Python, JavaScript  
**Frameworks:** FastAPI backend, React + Vite frontend  
**Database:** Supabase (PostgreSQL)  
**APIs / Tools:** Google Gemini, Axios

---

## Setup Instructions

```bash
# Clone the repository
git clone https://github.com/esha-susan/hermes.git
cd Hermes

# Backend setup
cd backend
python -m venv venv
source venv/bin/activate   # Linux/Mac
# venv\Scripts\activate    # Windows
pip install -r requirements.txt
cp .env.example .env

# Update .env with your keys:
# GEMINI_API_KEY=your_key
# SUPABASE_URL=your_url
# SUPABASE_KEY=your_key

# Run backend
uvicorn app.main:app --reload --port 5000

# Frontend setup
cd ../frontend
npm install
cp .env.example .env.local

# Update .env.local with:
# VITE_API_URL=http://localhost:5000

# Run frontend
npm run dev