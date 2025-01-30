import tempfile
from pathlib import Path
from typing import Annotated

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse
from markitdown import MarkItDown

app = FastAPI(
    title="KnowledgeX Engine",
    description="KnowledgeX Engine API",
    version="0.1.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "Welcome to KnowledgeX Engine API"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


@app.post("/convert", response_class=PlainTextResponse)
async def convert_to_markdown(file: Annotated[UploadFile, File()]):
    markitdown = MarkItDown()

    try:
        # Create a temporary directory
        with tempfile.TemporaryDirectory() as temp_dir:
            # Create full path for the temporary file
            temp_file_path = Path(temp_dir) / file.filename

            # Save uploaded file to temporary directory
            content = await file.read()
            with open(temp_file_path, "wb") as f:
                f.write(content)

            # Convert file to markdown
            markdown = markitdown.convert(str(temp_file_path))

            # Return the markdown content
            return markdown.text_content

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error converting file: {str(e)}")
