# CodeLens AI

AI-powered code analysis and debugging assistant.

## What is CodeLens AI?

CodeLens AI is an AI-powered developer tool that helps developers
understand, review, debug, and optimize source code.

Users can paste their code, select an analysis task, and receive
structured AI-generated feedback through a simple developer-focused UI.

## Features

- 🔍 Code Review
  - Identifies bugs and code-quality issues
  - Provides suggestions for improvement
  - Considers readability, maintainability, performance and security

- 🐛 Debug
  - Analyzes errors and incorrect behavior
  - Explains the likely cause
  - Provides a corrected version

- 📖 Explain
  - Explains code in beginner, intermediate, or advanced-friendly terms
  - Breaks down the execution flow
  - Explains important functions, variables and operations

- ⚡ Optimize
  - Analyzes time and space complexity
  - Identifies inefficient approaches
  - Suggests optimized solutions

- 💬 Follow-up AI Chat
  - Ask questions about the analyzed code
  - Continue the discussion using the previous analysis as context

- 🤖 Automatic Language Detection
  - The AI identifies the programming language automatically

- 📋 Structured AI Responses
  - Backend validates AI-generated responses using Pydantic models

## Tech Stack

### Frontend
- React.js
- Vite
- JavaScript
- Bootstrap
- Axios
- React Markdown
- Lucide React

### Backend
- Python
- FastAPI
- Pydantic
- Google Gemini API

### Deployment
- Frontend: Render Static Site
- Backend: Render Web Service

## Architecture

React Frontend
       ↓
FastAPI Backend
       ↓
Google Gemini API
       ↓
Structured Response
       ↓
React Frontend

## How It Works

1. User enters source code.
2. User selects an analysis task.
3. React sends the code and task to the FastAPI backend.
4. FastAPI constructs a task-specific prompt.
5. Gemini processes the request.
6. The backend validates the structured response using Pydantic.
7. The frontend displays the analysis.
8. Users can ask follow-up questions about the code.

## Why I Built This

CodeLens AI was built to explore practical LLM application development
beyond a basic chatbot.

The project focuses on:
- LLM API integration
- Prompt engineering
- Structured AI output
- Pydantic validation
- Backend API design
- AI-assisted developer workflows
- Frontend and backend integration

## Current Limitations

CodeLens AI currently uses the Gemini API's available usage quota.
Therefore, the application may temporarily be unable to generate
responses when the configured API project's quota is exhausted.

The project does not currently use:
- RAG
- Vector databases
- Embeddings
- AI agents
- LangChain
- Persistent conversation history

These were intentionally kept outside the scope of this project so that
the application could remain focused on LLM-based code analysis.
