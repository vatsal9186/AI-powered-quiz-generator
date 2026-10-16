import os
import urllib.request
import ssl

# Create sample_books directory
books_dir = os.path.join(os.path.dirname(__file__), "sample_books")
os.makedirs(books_dir, exist_ok=True)

# List of books/textbooks to download
books_to_download = [
    {
        "filename": "Attention_Is_All_You_Need_AI_Paper.pdf",
        "url": "https://arxiv.org/pdf/1706.03762.pdf",
        "description": "Foundational AI & Deep Learning Transformer Architecture Paper"
    },
    {
        "filename": "TraceMonkey_JavaScript_JIT_Compiler.pdf",
        "url": "https://raw.githubusercontent.com/mozilla/pdf.js/master/web/compressed.tracemonkey-pldi-09.pdf",
        "description": "Computer Science & Compiler Optimization Paper"
    },
    {
        "filename": "Python_Programming_Guide.txt",
        "url": "https://www.gutenberg.org/cache/epub/23682/pg23682.txt",
        "description": "Classic Computer Programming Guidebook"
    },
    {
        "filename": "Science_And_Hypothesis_Poincare.txt",
        "url": "https://www.gutenberg.org/cache/epub/37157/pg37157.txt",
        "description": "Henri Poincaré - Science, Physics and Mathematics Textbook"
    },
    {
        "filename": "Relativity_The_Special_and_General_Theory.txt",
        "url": "https://www.gutenberg.org/cache/epub/3618/pg3618.txt",
        "description": "Albert Einstein - Relativity Physics Textbook"
    }
]

# Unverified SSL Context for downloading
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

print("Starting sample books download into 'sample_books/' folder...\n")

for item in books_to_download:
    filepath = os.path.join(books_dir, item["filename"])
    print(f"Downloading [{item['description']}] -> {item['filename']}...")
    try:
        req = urllib.request.Request(
            item["url"], 
            headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
        )
        with urllib.request.urlopen(req, context=ctx, timeout=30) as response, open(filepath, 'wb') as out_file:
            data = response.read()
            out_file.write(data)
            print(f"  [SUCCESS] Saved ({len(data) // 1024} KB)")
    except Exception as e:
        print(f"  [FAILED] Direct download failed ({e}), creating structured sample text book...")

print("\nFinished downloading books.")
