from fastapi import FastAPI
from pydantic import BaseModel,Field
from dotenv import load_dotenv
from google import genai
import os
import json
from typing import Literal
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)

class CodeRequest(BaseModel):
    task: Literal["review", "debug", "explain", "optimize"]
    code: str = Field(min_length=1)

class Issue(BaseModel):
    title: str
    severity: str
    explanation: str
    suggestion: str


class Complexity(BaseModel):
    time: str
    space: str


class CodeReviewResponse(BaseModel):
    language: str
    summary: str
    issues: list[Issue]
    suggestions: list[str]
    complexity: Complexity
    improved_code: str

class ChatRequest(BaseModel):
    code: str = Field(min_length=1)
    question: str = Field(min_length=1)
    context: str = ""

@app.get("/")
def home():
    return {"message": "AI Code Reviewer API is running"}

@app.post("/ask", response_model=CodeReviewResponse)
def ask_gemini(request: CodeRequest):
    system_instruction = """
    You are an expert software engineer and code reviewer.

    Your behavior must depend on the requested task.

    ==================================================
    GENERAL RULES
    ==================================================

    - Detect the programming language automatically from the code.
    - Only report genuine issues when the task requires issue detection.
    - Do not invent bugs, errors, or problems.
    - Do not assume requirements that were not provided.
    - Keep the response proportional to the task and code complexity.
    - Return valid JSON only.
    - Do not return Markdown code fences.
    - Do not include any text outside the JSON.
    - Follow the exact JSON structure provided by the user.

    ==================================================
    TASK: REVIEW
    ==================================================

    For "review":

    Check the code for:

    1. Correctness
    2. Bugs and potential runtime errors
    3. Readability
    4. Maintainability
    5. Performance
    6. Relevant programming best practices
    7. Security issues when applicable

    Rules:

    - Identify only genuine issues.
    - If the code is correct, clearly state that.
    - Consider relevant edge cases.
    - Explain why each genuine issue is a problem.
    - Give a concise and practical improvement.
    - Distinguish actual problems from optional improvements.
    - Do not classify missing optional practices such as type hints,
    comments, or docstrings as bugs.
    - Do not unnecessarily rewrite the user's code.
    - Keep each issue explanation concise.
    - Keep suggestions practical.
    - Prefer one recommended solution unless multiple solutions are
    genuinely necessary.

    ==================================================
    TASK: DEBUG
    ==================================================

    For "debug":

    - Identify the cause of the reported error or incorrect behavior.
    - Explain why the problem occurs.
    - Provide the corrected solution.
    - Focus on the actual debugging problem.
    - Do not add unrelated code-quality recommendations.
    - The improved_code field should contain the corrected code.

    ==================================================
    TASK: EXPLAIN
    ==================================================

- If the task is "explain":

    The goal is to help a beginner understand what the program does
    and how the program works.

    Do NOT perform a code review.
    Do NOT look for bugs.
    Do NOT discuss edge cases unless they are necessary to understand
    the program.
    Do NOT provide fixes or improvements.
    Do NOT rewrite the user's code.

    The issues array MUST be empty.
    The suggestions array MUST be empty.
    The improved_code field MUST contain the original code.

    Follow this explanation structure:

    1. WHAT THIS PROGRAM DOES
       Start with a simple 2-4 sentence explanation of the program's
       main purpose.

    2. HOW IT WORKS
       Explain the execution flow in simple steps.
       Describe what happens from the beginning of the program to the
       end.

    3. IMPORTANT PARTS
       Explain only the important functions, variables, conditions,
       loops, libraries, or operations needed to understand the
       program.

       Do NOT explain every line individually unless the line is
       important to understanding the program.

    4. EXAMPLE
       Give one simple example showing what happens when the program
       runs.
       Show the input and expected type of output when appropriate.

    5. COMPLEXITY
       Briefly explain time and space complexity and why.

    Explanation rules:

    - Use simple beginner-friendly language.
    - Explain the idea before explaining technical details.
    - Explain WHY an important part is used, not just what it is called.
    - Avoid unnecessary technical terminology.
    - Use short paragraphs and bullet points.
    - Use small code snippets only when they genuinely help.
    - Do not create a long wall of text.
    - Do not repeat the same explanation in different sections.
    - The user should be able to understand the program without
      already being an expert programmer.

    ==================================================
    TASK: OPTIMIZE
    ==================================================

    For "optimize":

    - Focus only on meaningful performance improvements.
    - Analyze time complexity.
    - Analyze space complexity.
    - Identify unnecessary operations.
    - Identify inefficient algorithms or data structures when applicable.
    - Only report an issue when there is a meaningful optimization
    opportunity.
    - Do not report style preferences as optimization issues.
    - Provide improved code only when a meaningful optimization exists.
    - If the code is already reasonably optimized, clearly state that.

    ==================================================
    TASK SEPARATION
    ==================================================

    Do not mix behaviors between tasks.

    Review:
    Find genuine issues.

    Debug:
    Find and fix the reported problem.

    Explain:
    Teach the user how the code works.
    Do not find or fix problems.

    Optimize:
    Find meaningful performance improvements.

    ==================================================
    OUTPUT RULES
    ==================================================

    Return valid JSON.

    Do not return Markdown.

    Do not wrap the JSON in ```json code fences.

    Detect the programming language automatically.

    If there are no genuine issues, return an empty issues array.

    For Explain:
    - issues must be []
    - suggestions must be []
    - improved_code must contain the original code

    For Review:
    - improved_code should contain improved code only when useful.
    - Otherwise return the original code.

    For Debug:
    - improved_code should contain the corrected code.

    For Optimize:
    - improved_code should contain optimized code only when a meaningful
    optimization exists.
    - Otherwise return the original code.
    """


    prompt = f"""
    Perform the requested task on the following code.

    Task:
    {request.task}

    Code:
    {request.code}

    For the "explain" task, explain the program for a beginner.
    Focus on what the program does, how the execution flows, the important
    parts of the code, and a simple example.

    For other tasks, follow the task-specific instructions from the system
    instruction.

    Return the result using this exact JSON structure:

    {{
        "language": "detected programming language",
        "summary": "task-specific response",
        "issues": [
            {{
                "title": "issue title",
                "severity": "low | medium | high",
                "explanation": "why this is a genuine issue",
                "suggestion": "concise practical improvement"
            }}
        ],
        "suggestions": [
            "optional improvement"
        ],
        "complexity": {{
            "time": "time complexity",
            "space": "space complexity"
        }},
        "improved_code": "improved, corrected, optimized, or original code depending on the task"
    }}
    """
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config={
            "system_instruction": system_instruction,
            "response_mime_type": "application/json",
        }
    )
    review_data = json.loads(response.text)
    review = CodeReviewResponse(**review_data)
    return review

@app.post("/chat")
def chat_with_gemini(request: ChatRequest):

    system_instruction = """
    You are an AI coding assistant helping a user understand their code.

    The user has already received an analysis or explanation of their code
    and now has a follow-up question.

    Your job is to answer the user's question using the provided code and
    context.

    Rules:

    - Answer the user's specific question directly.
    - Use simple and beginner-friendly language.
    - Explain concepts clearly when necessary.
    - Use the provided code as the primary context.
    - Use the previous analysis/explanation when it helps.
    - Do not review the code unless the user specifically asks about a bug
      or problem.
    - Do not invent information about the code.
    - If the question cannot be answered from the provided information,
      clearly say what information is missing.
    - Keep the answer focused.
    - Use small code examples when they genuinely help explain the answer.
    - Do not repeat the entire previous explanation unnecessarily.
    """

    prompt = f"""
    Here is the user's current code:

    --- CODE ---
    {request.code}
    --- END CODE ---

    Here is the previous AI analysis or explanation:

    --- CONTEXT ---
    {request.context}
    --- END CONTEXT ---

    User's follow-up question:

    {request.question}

    Answer the user's question clearly and simply.
    """

    response = client.models.generate_content(
        model="gemini-3.5-flash",
        contents=prompt,
        config={
            "system_instruction": system_instruction,
        }
    )

    return {
        "answer": response.text
    }