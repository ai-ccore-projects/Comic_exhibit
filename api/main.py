from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
import replicate
from PIL import Image
from io import BytesIO
import os
from dotenv import load_dotenv
import traceback
import uuid
from supabase import create_client, Client

# Load environment variables (e.g., your Gemini API key)
_api_dir = os.path.dirname(__file__)
load_dotenv(os.path.join(_api_dir, "..", ".env.local"))  # project root
load_dotenv(os.path.join(_api_dir, ".env"))               # api/.env fallback
load_dotenv(os.path.join(_api_dir, ".env.local"))         # api/.env.local fallback

# Replicate API handles token natively from OS env REPLICATE_API_TOKEN

# Log Supabase config at startup (masked)
_sb_url = os.getenv("SUPABASE_URL")
_sb_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
if _sb_url and _sb_key:
    print(f"[Supabase] Config loaded for project: {_sb_url.replace('https://', '').split('.supabase.co')[0][:12]}...")
else:
    print("[Supabase] WARNING: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set - uploads will be skipped")

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
        img_byte_arr.name = "image.png"
        pil_image.save(img_byte_arr, format="PNG")
        img_byte_arr.seek(0)
        
        output = replicate.run(
            "google/nano-banana",
            input={
                "image_input": [img_byte_arr],
                "prompt": final_prompt
            }
        )

        # Check if output is a FileOutput or list
        if isinstance(output, list) and len(output) > 0:
            result_item = output[0]
        else:
            result_item = output

        # Replicate's Python client returns FileOutput objects that can be read directly
        image_data = None
        if hasattr(result_item, "read"):
            image_data = result_item.read()
        else:
            # Fallback if it's a string URL
            output_url = str(result_item)
            import requests
            img_response = requests.get(output_url)
            img_response.raise_for_status()
            image_data = img_response.content
        
        if image_data:
            # Let's save to Supabase
            supabase_url = os.getenv("SUPABASE_URL")
            supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
            
            if not supabase_url or not supabase_key:
                print("[Supabase] WARNING: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing - skipping upload")
                print(f"[Supabase] SUPABASE_URL present: {bool(supabase_url)}, SUPABASE_SERVICE_ROLE_KEY present: {bool(supabase_key)}")
            else:
                try:
                    # Log which project we're targeting (masked)
                    _masked = supabase_url.replace("https://", "").split(".supabase.co")[0][:8] + "..." if supabase_url else "?"
                    print(f"[Supabase] Attempting upload to project: {_masked}")
                    
                    supabase_client: Client = create_client(supabase_url, supabase_key)
                    
                    # Upload to storage (storage3 API: path, file, file_options)
                    filename = f"comic_{uuid.uuid4().hex}.png"
                    
                    supabase_client.storage.from_("comic-artworks").upload(
                        path=filename,
                        file=image_data,
                        file_options={"content-type": "image/png"}
                    )
                    
                    public_url = supabase_client.storage.from_("comic-artworks").get_public_url(filename)
                    
                    # Insert to db
                    insert_result = supabase_client.table("comic_submissions").insert({
                        "generated_url": public_url,
                        "style": user_prompt,
                        "mode": mode
                    }).execute()
                    
                    print(f"[Supabase] Successfully uploaded: {public_url}")
                    print(f"[Supabase] Insert result: {len(insert_result.data or [])} row(s) created")
                except Exception as e:
                    print(f"[Supabase] FAILED: {e}")
                    traceback.print_exc()
                    
            return Response(content=image_data, media_type="image/png")

        raise HTTPException(status_code=500, detail="No image found in API response.")

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")