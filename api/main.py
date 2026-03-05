from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
import replicate
from PIL import Image
from io import BytesIO
import os
from dotenv import load_dotenv
import traceback

# Load environment variables (e.g., your Gemini API key)
load_dotenv()

# Replicate API handles token natively from OS env REPLICATE_API_TOKEN

app = FastAPI()

# ---------------- CORS ----------------
def build_allowed_origins() -> list[str]:
    raw = os.getenv("CORS_ORIGINS", "")
    items = [o.strip().rstrip("/") for o in raw.split(",") if o.strip()]
    return items

ALLOWED_ORIGINS = build_allowed_origins()
ALLOW_RENDER_REGEX = os.getenv("CORS_ALLOW_RENDER_REGEX", "false").lower() == "true"
DEBUG_CORS = os.getenv("DEBUG_CORS", "false").lower() == "true"

if DEBUG_CORS:
    print("[CORS] DEBUG: allow * (no credentials)")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    if ALLOW_RENDER_REGEX:
        print("[CORS] Using regex for *.onrender.com plus explicit origins:", ALLOWED_ORIGINS)
        app.add_middleware(
            CORSMiddleware,
            allow_origins=ALLOWED_ORIGINS,   # explicit frontends you know
            allow_origin_regex=r"^https://.*\.onrender\.com$",  # any render frontend
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )
    else:
        print("[CORS] Allowed origins:", ALLOWED_ORIGINS)
        app.add_middleware(
            CORSMiddleware,
            allow_origins=ALLOWED_ORIGINS,
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )
@app.post("/api/edit")
async def process_image_with_gemini(
    image_file: UploadFile = File(...),
    prompt: str = Form(...),
    mode: str = Form("portrait")   # 👈 new field from frontend
):
    print("into gemini")
    try:
        pil_image = Image.open(image_file.file)
        pil_image.load()

        user_prompt = prompt.strip()
        mode = mode.strip().lower()

        # ---------- PROMPT SWITCH ----------
        if mode == "portrait":
            # 🎨 Portrait Mode Prompt
            final_prompt = f"""
Generate a **single, high-quality artistic portrait** based on the provided image.

**Artistic Style:** {user_prompt}"""

# **Guidelines:**
# - Maintain the subject’s **exact facial structure, proportions, and recognizable identity**.
# - Focus on **upper body or face only**.
# - Do **not** add extra limbs, distortions, or unrelated background objects.
# - Background may be softly artistic or abstract, complementing the chosen art style.
# - Avoid surreal or abnormal elements; keep it human-realistic.
# - Use consistent colors, brushwork, and lighting inspired by the mentioned artist style.

# **Output Goal:** A single portrait painting that looks like the same person recreated in the artistic style described above.
# """
        else:
            # 📖 Storyline / Comic Mode Prompt
            final_prompt = f"""
Generate a visually cohesive, single-page **comic strip** divided into 4 sequential panels, each with a clear border and consistent artistic style.

**Artistic Theme & Style:** {user_prompt}

**Character Consistency:**
- The main character must have the same **face, proportions, and identity** as the provided reference image across all panels.
- Avoid any deformation, extra limbs, or surreal artifacts.

**Comic Narrative:**
- Tell a short, coherent story derived from the given theme.
- 4 panels progression:
  1️⃣ Introduce character and setting.
  2️⃣ Show an action or event.
  3️⃣ Illustrate a key emotional or dramatic moment.
  4️⃣ Conclude with a meaningful ending.
- Include short, readable **speech bubbles or captions** that advance the story.

**Formatting:**
- Maintain consistent art style, lighting, and palette.
- Each panel should be visually distinct but cohesive.
- The whole comic should fit on a single page, clearly divided into 4 panels.

**Output Goal:** A complete 4-panel comic in {user_prompt} style preserving the character’s identity.
"""
        # ------------------------------------

        # Save image to temporary bytes for Replicate input
        img_byte_arr = BytesIO()
        pil_image.save(img_byte_arr, format="PNG")
        img_byte_arr.seek(0)
        
        output = replicate.run(
            "google/gemini-2.5-flash-image",
            input={
                "image": img_byte_arr,
                "prompt": final_prompt
            }
        )

        # Output is an iterator of strings containing the URLs to the images
        # Flash image outputs a list with one item
        output_url = ""
        for item in output:
             output_url = item
        
        # Download the generated image bytes and return them
        import requests
        img_response = requests.get(output_url)
        img_response.raise_for_status()
        
        return Response(content=img_response.content, media_type="image/png")

        raise HTTPException(status_code=500, detail="No image found in Gemini API response.")

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")