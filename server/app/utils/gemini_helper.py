import json
import requests
import re
import time
from typing import List, Dict, Any
from app.config import settings

def call_gemini(prompt: str, json_mode: bool = False, api_key: str = None) -> str:
    """
    Makes a direct REST API call to Google Gemini Flash models with key rotation, retries, and timeout controls.
    """
    configured_keys = []
    if api_key and api_key.startswith("AIza"):
        configured_keys.append(api_key)
    if settings.GEMINI_API_KEY and settings.GEMINI_API_KEY.startswith("AIza"):
        if settings.GEMINI_API_KEY not in configured_keys:
            configured_keys.append(settings.GEMINI_API_KEY)
    if settings.GEMINI_API_KEY_2 and settings.GEMINI_API_KEY_2.startswith("AIza"):
        if settings.GEMINI_API_KEY_2 not in configured_keys:
            configured_keys.append(settings.GEMINI_API_KEY_2)

    if not configured_keys:
        raise ValueError("Gemini API key is not configured or is invalid. Please configure a valid API key in your backend .env file.")

    models_to_try = ["gemini-1.5-flash", "gemini-2.0-flash"]
    headers = {"Content-Type": "application/json"}
    
    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt}
                ]
            }
        ]
    }
    
    if json_mode:
        payload["generationConfig"] = {
            "responseMimeType": "application/json"
        }
        
    last_exception = None
    for current_key in configured_keys:
        for model_name in models_to_try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={current_key}"
            try:
                response = requests.post(url, json=payload, headers=headers, timeout=12)
                if response.status_code == 200:
                    response_data = response.json()
                    text_output = response_data['candidates'][0]['content']['parts'][0]['text']
                    return text_output
                else:
                    print(f"Gemini API ({model_name}) returned status {response.status_code}: {response.text[:120]}")
            except requests.exceptions.RequestException as e:
                last_exception = e
                print(f"Gemini API ({model_name}) request failed: {e}")
            
    raise Exception(f"Gemini API call failed across candidate models and API keys. Last error: {last_exception}")

def chunk_text(text: str, max_chars: int = 80000, overlap: int = 10000) -> List[str]:
    """
    Splits text into chunks of max_chars with specified overlap.
    """
    if len(text) <= max_chars:
        return [text]
        
    chunks = []
    start = 0
    while start < len(text):
        end = min(start + max_chars, len(text))
        chunks.append(text[start:end])
        start += max_chars - overlap
    return chunks

def parse_robust_json(text: str) -> Any:
    """
    Cleans up common formatting issues from AI text response and parses JSON.
    """
    cleaned = text.strip()
    
    # 1. Strip markdown wrapper if present
    if cleaned.startswith("```"):
        lines = cleaned.splitlines()
        if len(lines) > 2:
            cleaned = "\n".join(lines[1:-1])
        else:
            cleaned = cleaned.replace("```json", "").replace("```", "")
            
    cleaned = cleaned.strip()
    
    # 2. Try standard json load
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass
        
    # 3. Clean up common parsing issues (trailing commas)
    cleaned_comma = re.sub(r',\s*([\]}])', r'\1', cleaned)
    try:
        return json.loads(cleaned_comma)
    except json.JSONDecodeError as e:
        raise ValueError(f"Failed to parse AI JSON response: {str(e)}\nRaw text: {text[:200]}...")

def extract_hierarchy_from_chunk(chunk: str) -> Dict[str, Any]:
    """
    Asks Gemini to analyze a single chunk of text and extract modules, chapters, and topics.
    """
    prompt = """You are an expert document structure analyzer.
Analyze the following text extracted from a document and identify its hierarchical structure (Modules, Chapters, and Topics/Sections).

Rules:
1. The titles of modules, chapters, and topics/sections MUST correspond to actual headers/titles in the text.
2. The chapter titles you return MUST match strings present in the text case-insensitively so they can be programmatically located.
3. Be comprehensive: do not omit chapters or sections.
4. Maintain the original order of the document.
5. If the document has no clear modules, group all chapters under a single structure item with "module_title": null.
6. If the document has only sections/topics and no clear chapters, represent these sections as chapters.

Return the result in the following JSON format:
{
  "document_title": "string",
  "structure": [
    {
      "module_title": "string or null",
      "chapters": [
        {
          "chapter_title": "string",
          "topics": [
            "string"
          ]
        }
      ]
    }
  ]
}

Text content to analyze:
""" + chunk

    response_text = call_gemini(prompt, json_mode=True)
    return parse_robust_json(response_text)

def merge_document_structures(structures: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Merges multiple structure dicts from different chunks into a single unified hierarchy.
    """
    if not structures:
        return {"document_title": "Untitled Document", "structure": []}
        
    final_title = structures[0].get("document_title") or "Untitled Document"
    merged_structure = []
    
    for struct_data in structures:
        for module in struct_data.get("structure", []):
            mod_title = module.get("module_title")
            
            # Find if this module already exists in merged_structure
            existing_mod = None
            for m in merged_structure:
                if m.get("module_title") == mod_title:
                    existing_mod = m
                    break
            
            if not existing_mod:
                existing_mod = {
                    "module_title": mod_title,
                    "chapters": []
                }
                merged_structure.append(existing_mod)
                
            for chap in module.get("chapters", []):
                chap_title = chap.get("chapter_title")
                
                # Find if this chapter already exists in this module
                existing_chap = None
                for c in existing_mod["chapters"]:
                    if c.get("chapter_title") == chap_title:
                        existing_chap = c
                        break
                        
                if not existing_chap:
                    existing_chap = {
                        "chapter_title": chap_title,
                        "topics": []
                    }
                    existing_mod["chapters"].append(existing_chap)
                    
                # Add topics (prevent duplicates)
                for topic in chap.get("topics", []):
                    if topic not in existing_chap["topics"]:
                        existing_chap["topics"].append(topic)
                        
    return {
        "document_title": final_title,
        "structure": merged_structure
    }

def segment_text_by_chapters(full_text: str, chapter_titles: List[str]) -> Dict[str, str]:
    """
    Slices the full_text into parts matching each chapter title.
    Returns a dictionary of {chapter_title: chapter_content}.
    """
    positions = []
    for title in chapter_titles:
        # Search case-insensitively for the title
        idx = full_text.lower().find(title.lower())
        if idx != -1:
            positions.append((idx, title))
        else:
            # Fallback to search for title content after common headings prefix (like Chapter 1)
            clean_title = title
            if ":" in title:
                clean_title = title.split(":", 1)[1].strip()
            elif "chapter" in title.lower():
                parts = re.split(r'\d+', title.lower(), 1)
                if len(parts) > 1:
                    clean_title = parts[1].strip()
            
            if clean_title:
                idx = full_text.lower().find(clean_title.lower())
                if idx != -1:
                    positions.append((idx, title))
                    
    # Sort positions by their index in the text to maintain document order
    positions.sort()
    
    chapter_contents = {}
    for i in range(len(positions)):
        start_idx, title = positions[i]
        end_idx = positions[i+1][0] if i + 1 < len(positions) else len(full_text)
        
        # Extract the content and clean it up
        content = full_text[start_idx:end_idx].strip()
        chapter_contents[title] = content
        
    # If no chapters were found, fallback by dividing text evenly or mapping the full text to the first chapter
    if not chapter_contents and chapter_titles:
        chapter_contents[chapter_titles[0]] = full_text
        for title in chapter_titles[1:]:
            chapter_contents[title] = ""
            
    return chapter_contents

def analyze_document_heuristically(full_text: str, filename: str = None) -> Dict[str, Any]:
    """
    Heuristically extracts document structure locally in milliseconds.
    Ensures text content is fully assigned to chapters to allow offline quiz generation.
    """
    import re
    
    # 1. Clean filename to get a title
    title = "Untitled Document"
    if filename:
        title = filename.rsplit(".", 1)[0].replace("_", " ").replace("-", " ").strip().title()
    else:
        # Fallback: check first line of full_text for a title
        first_lines = [l.strip() for l in full_text.split("\n") if l.strip()]
        if first_lines:
            title = first_lines[0][:50].strip()
            
    # 2. Try to find headers or chapter-like structures using regex
    lines = full_text.split("\n")
    
    chapter_patterns = [
        re.compile(r'^\s*(?:chapter|module|section|unit|part)\s+(\d+|[ivxldm]+)\b[:.-]?\s*(.*)$', re.IGNORECASE),
        re.compile(r'^\s*(\d+\.\d+|\d+)\s+([A-Z][a-zA-Z\s]{3,40})$'),
        re.compile(r'^#+\s+(.+)$')
    ]
    
    detected_chapters = []
    
    char_offset = 0
    for line_idx, line in enumerate(lines):
        line_len = len(line) + 1 # +1 for newline
        stripped = line.strip()
        if not stripped:
            char_offset += line_len
            continue
            
        # Optimization: Skip lines that are too long or too short to be chapter headers
        if len(stripped) > 100 or len(stripped) < 3:
            char_offset += line_len
            continue

        matched = False
        header_text = ""
        for pat in chapter_patterns:
            m = pat.match(stripped)
            if m:
                if len(m.groups()) >= 2 and m.group(1):
                    prefix = stripped[:m.start(2)].strip(" :.-")
                    suffix = m.group(2).strip()
                    header_text = f"{prefix}: {suffix}" if suffix else prefix
                else:
                    header_text = m.group(1).strip()
                
                header_text = re.sub(r'\s+', ' ', header_text).strip()
                matched = True
                break
                
        if matched and 3 <= len(header_text) <= 80:
            if not any(dc["title"].lower() == header_text.lower() for dc in detected_chapters):
                detected_chapters.append({
                    "title": header_text,
                    "index": char_offset,
                    "line_idx": line_idx
                })
                
        char_offset += line_len

    # If we found too few chapters (e.g. less than 2) or too many (e.g. more than 40), chunk evenly.
    if len(detected_chapters) < 2 or len(detected_chapters) > 40:
        detected_chapters = []
        page_matches = list(re.finditer(r'--- Page (\d+) ---', full_text))
        if len(page_matches) >= 5:
            num_pages = len(page_matches)
            pages_per_chapter = max(1, num_pages // 6)
            for i in range(0, num_pages, pages_per_chapter):
                start_page = i + 1
                end_page = min(num_pages, i + pages_per_chapter)
                start_idx = page_matches[i].start()
                detected_chapters.append({
                    "title": f"Chapter {len(detected_chapters)+1}: Pages {start_page}-{end_page}",
                    "index": start_idx
                })
        else:
            num_chunks = 4
            chars_per_chapter = len(full_text) // num_chunks
            for i in range(num_chunks):
                start_idx = i * chars_per_chapter
                snippet = full_text[start_idx:start_idx+300]
                clean_title = ""
                for chunk_line in snippet.split("\n"):
                    line_strip = chunk_line.strip()
                    if line_strip and not line_strip.startswith("--- Page"):
                        clean_title = re.sub(r'[^a-zA-Z0-9\s-]', '', line_strip)[:40].strip()
                        break
                if not clean_title or len(clean_title) < 3:
                    clean_title = f"Overview Part {i+1}"
                
                detected_chapters.append({
                    "title": f"Chapter {i+1}: {clean_title.title()}",
                    "index": start_idx
                })

    detected_chapters.sort(key=lambda x: x["index"])
    
    chapters = []
    for i in range(len(detected_chapters)):
        chap = detected_chapters[i]
        start_idx = chap["index"]
        end_idx = detected_chapters[i+1]["index"] if i + 1 < len(detected_chapters) else len(full_text)
        
        chap_content = full_text[start_idx:end_idx].strip()
        if not chap_content:
            chap_content = f"Content for {chap['title']} is under development or not available."
            
        sub_headers = []
        chap_lines = chap_content.split("\n")[:100]
        for line in chap_lines:
            line_strip = line.strip()
            if line_strip.startswith("## ") or line_strip.startswith("### "):
                sub_h = line_strip.lstrip("# ").strip()
                if 3 <= len(sub_h) <= 50 and sub_h not in sub_headers:
                    sub_headers.append(sub_h)
            elif re.match(r'^\s*\d+\.\d+\s+[A-Z]', line_strip):
                sub_h = re.sub(r'^\s*\d+\.\d+\s+', '', line_strip).strip()
                if 3 <= len(sub_h) <= 50 and sub_h not in sub_headers:
                    sub_headers.append(sub_h)
                    
        sub_headers = sub_headers[:3]
        if not sub_headers:
            clean_name = chap["title"].split(":", 1)[-1].strip()
            sub_headers = [
                f"Introduction to {clean_name}",
                f"Core Principles of {clean_name}",
                f"Summary & Review Exercises"
            ]
            
        chapters.append({
            "chapter_title": chap["title"],
            "topics": sub_headers,
            "content": chap_content
        })

    return {
        "document_title": title,
        "structure": [
            {
                "module_title": "Course Curriculum Outline",
                "chapters": chapters
            }
        ]
    }

def analyze_document(full_text: str, filename: str = None) -> Dict[str, Any]:
    """
    Main entry point for document structure analysis. Handles calling Gemini,
    optional parallel chunking for large files, and mapping contents.
    If settings.FAST_UPLOAD_MODE is set, processes the structure heuristically.
    """
    if getattr(settings, "FAST_UPLOAD_MODE", True):
        return analyze_document_heuristically(full_text, filename)

    text_len = len(full_text)
    
    # 1. Single-request optimization for documents under ~500 pages (approx 1,200,000 chars)
    if text_len <= 1200000:
        try:
            final_hierarchy = extract_hierarchy_from_chunk(full_text)
        except Exception:
            # Fallback if a single giant prompt fails (e.g. timeout)
            chunks = chunk_text(full_text, max_chars=300000, overlap=30000)
            from concurrent.futures import ThreadPoolExecutor
            with ThreadPoolExecutor(max_workers=4) as executor:
                structures = list(executor.map(extract_hierarchy_from_chunk, chunks))
            final_hierarchy = merge_document_structures(structures)
    else:
        # 2. Parallel thread execution for massive documents (over 500 pages)
        chunks = chunk_text(full_text, max_chars=1000000, overlap=100000)
        from concurrent.futures import ThreadPoolExecutor
        with ThreadPoolExecutor(max_workers=5) as executor:
            structures = list(executor.map(extract_hierarchy_from_chunk, chunks))
        final_hierarchy = merge_document_structures(structures)
        
    # Extract chapter titles safely
    chapter_titles = []
    for module in final_hierarchy.get("structure", []):
        for chapter in module.get("chapters", []):
            chapter_titles.append(chapter["chapter_title"])
            
    # Segment text
    segmented_contents = segment_text_by_chapters(full_text, chapter_titles)
    
    # Add content to structure dict for storage mapping
    for module in final_hierarchy.get("structure", []):
        for chapter in module.get("chapters", []):
            title = chapter["chapter_title"]
            chapter["content"] = segmented_contents.get(title, "")
            
    return final_hierarchy

def generate_quiz_questions_heuristically(content: str, difficulty: str, num_questions: int) -> List[Dict[str, Any]]:
    """
    Offline fallback function to generate MCQ questions from text content when Gemini API fails.
    """
    import random
    
    difficulty = difficulty.strip().lower()
    
    # Split content into sentences
    raw_sentences = re.split(r'(?<=[.!?])\s+', content)
    sentences = []
    for s in raw_sentences:
        s_clean = s.strip().replace("\n", " ")
        s_clean = re.sub(r'\s+', ' ', s_clean)
        if len(s_clean) >= 30 and len(s_clean) <= 250:
            sentences.append(s_clean)

    # If too few sentences, split by newlines/commas
    if len(sentences) < num_questions:
        raw_clauses = re.split(r'[,;:\n]+', content)
        for c in raw_clauses:
            c_clean = c.strip()
            c_clean = re.sub(r'\s+', ' ', c_clean)
            if len(c_clean) >= 20 and len(c_clean) <= 150:
                sentences.append(c_clean)

    # De-duplicate
    seen_s = set()
    unique_sentences = []
    for s in sentences:
        if s.lower() not in seen_s:
            seen_s.add(s.lower())
            unique_sentences.append(s)
    sentences = unique_sentences

    # Distractor terms from text + standard defaults
    words = re.findall(r'\b[A-Z][a-zA-Z]{3,15}\b', content)
    text_distractors = list(set(words))
    
    fallback_distractors = [
        "Data Structure", "Algorithm", "Compiler", "Interpreter", "Variable",
        "Function", "Class", "Object", "Memory Allocation", "Recursion",
        "Iteration", "Thread", "Process", "Socket", "Interface", "Database",
        "Array", "Linked List", "Stack", "Queue", "Pointer", "Reference"
    ]
    distractor_pool = list(set(text_distractors + fallback_distractors))
    
    questions = []
    matched_sentences = []
    
    # Heuristic sentence matching patterns
    patterns = [
        r'\b([A-Z][a-zA-Z0-9\s]{2,20}?)\s+(?:is\s+a|is\s+the|refers\s+to|means|defines|represents)\b',
        r'\b([a-zA-Z0-9\s]{3,25}?)\s+(?:is\s+used\s+to|allows\s+us\s+to|can\s+be\s+used\s+to|helps\s+in)\b',
        r'\b(?:The|A|An)\s+([a-zA-Z0-9\s]{3,25}?)\s+(?:is|are|was|were)\b'
    ]
    
    for s in sentences:
        for pat in patterns:
            match = re.search(pat, s, re.IGNORECASE)
            if match:
                concept = match.group(1).strip()
                if 2 <= len(concept) <= 30 and not re.search(r'[.!?]|^[0-9]+$', concept):
                    pattern_to_replace = re.compile(re.escape(concept), re.IGNORECASE)
                    blanked_s = pattern_to_replace.sub("_______", s, count=1)
                    matched_sentences.append({
                        "original": s,
                        "concept": concept,
                        "blanked": blanked_s
                    })
                    break

    # Fill in if we need more matched sentences
    while len(matched_sentences) < min(num_questions * 2, len(sentences)):
        available = [i for i, s in enumerate(sentences) if not any(m["original"] == s for m in matched_sentences)]
        if not available:
            break
        idx = random.choice(available)
        s = sentences[idx]
        
        words_in_s = [w for w in re.findall(r'\b[a-zA-Z]{4,15}\b', s) if w.lower() not in [
            "with", "that", "this", "from", "they", "have", "were", "been", "their", "there", "some", "more"
        ]]
        if words_in_s:
            cap_words = [w for w in words_in_s if w[0].isupper()]
            concept = random.choice(cap_words) if cap_words else random.choice(words_in_s)
            
            pattern_to_replace = re.compile(re.escape(concept), re.IGNORECASE)
            blanked_s = pattern_to_replace.sub("_______", s, count=1)
            matched_sentences.append({
                "original": s,
                "concept": concept,
                "blanked": blanked_s
            })
        else:
            # Absolute fallback
            matched_sentences.append({
                "original": s,
                "concept": "Correct Option",
                "blanked": s + " (Answer: Correct Option)"
            })

    random.shuffle(matched_sentences)
    
    for item in matched_sentences:
        if len(questions) >= num_questions:
            break
            
        concept = item["concept"]
        blanked = item["blanked"]
        original = item["original"]
        
        # Select 3 unique distractors
        available_distractors = [d for d in distractor_pool if d.lower() != concept.lower() and len(d) > 1]
        if len(available_distractors) < 3:
            available_distractors = ["Stack", "Queue", "Array", "Linked List"]
            available_distractors = [d for d in available_distractors if d.lower() != concept.lower()]
            
        selected_distractors = random.sample(available_distractors, min(3, len(available_distractors)))
        while len(selected_distractors) < 3:
            selected_distractors.append(f"Alternative {len(selected_distractors) + 1}")
            
        options = [concept] + selected_distractors
        random.shuffle(options)
        
        questions.append({
            "question": blanked,
            "options": options,
            "correct_answer": concept,
            "explanation": f"This question is generated from the following sentence in the text: \"{original}\"",
            "difficulty": difficulty,
            "source_chapter": None
        })

    # If still not enough questions, add generic ones
    while len(questions) < num_questions:
        q_num = len(questions) + 1
        questions.append({
            "question": f"Which of the following is correct regarding the content of chapter section {q_num}?",
            "options": ["It discusses key definitions and concepts.", "It has no practical applications.", "It is deprecated material.", "It is unrelated to the course."],
            "correct_answer": "It discusses key definitions and concepts.",
            "explanation": "This is a placeholder question generated because the text has insufficient content for heuristic sentence-matching.",
            "difficulty": difficulty,
            "source_chapter": None
        })

    return questions

def generate_quiz_questions(content: str, difficulty: str, num_questions: int) -> List[Dict[str, Any]]:
    """
    Generates mcq quiz questions based strictly on the provided content text.
    """
    if len(content.strip()) < 100:
        raise ValueError("Selected content is too short to generate a high-quality quiz (minimum 100 characters). Please select more chapters.")

    difficulty = difficulty.strip().lower()

    # Fast Upload Mode bypasses Gemini call for instant local heuristic generation
    if getattr(settings, "FAST_UPLOAD_MODE", True):
        try:
            print("[FAST_UPLOAD_MODE] Bypassing Gemini API, generating questions heuristically...")
            return generate_quiz_questions_heuristically(content, difficulty, num_questions)
        except Exception as e:
            print(f"[FAST_UPLOAD_MODE] Heuristic generation failed, falling back to Gemini API: {e}")
    
    prompt = f"""You are an expert academic evaluator. Generate a multiple-choice quiz containing exactly {num_questions} questions of difficulty level '{difficulty}' based strictly and only on the provided content.

GROUNDING CONSTRAINT:
- Every question must be directly and strictly answerable using ONLY the facts explicitly stated in the provided content.
- Do NOT generate questions using outside general knowledge, assumptions, interpolations, or extrapolations.
- If the content has insufficient facts to generate {num_questions} unique questions, generate ONLY the maximum number of unique questions possible. Do NOT hallucinate.

DIFFICULTY LEVEL GUIDELINES:
- 'easy': Test basic concepts, definitions, direct understanding, and simple recall from the text.
- 'medium': Test conceptual understanding, comparisons, moderate reasoning, and simple application of ideas in the text.
- 'hard': Test multi-step reasoning, analysis, scenario-based questions, and concept application in new contexts, using challenging but plausible distractors.

QUESTION FORMAT RULES:
- Every question must have exactly four options.
- There must be exactly one correct answer.
- All incorrect options must be plausible and related to the selected topic. Do not use obviously fake or absurd options.
- Avoid duplicate or nearly identical questions.
- Provide a brief, clear explanation for why the correct answer is right, citing the text.

The response must be a JSON array of questions, where each question contains:
- question: string (the question text)
- options: list of exactly 4 strings (options)
- correct_answer: string (MUST match one of the options exactly)
- explanation: string (explanation citing the text)
- difficulty: string (easy, medium, or hard)
- source_chapter: string or null (the name of the chapter this question comes from, if known)

Provided Content:
{content}
"""

    max_logic_retries = 2
    for logic_attempt in range(max_logic_retries):
        try:
            response_text = call_gemini(prompt, json_mode=True)
            questions = parse_robust_json(response_text)
            
            if not isinstance(questions, list):
                if isinstance(questions, dict) and "questions" in questions:
                    questions = questions["questions"]
                else:
                    raise ValueError("Gemini did not return a list of questions.")

            # Validate questions
            valid_questions = []
            seen_questions = set()
            for q in questions:
                if not isinstance(q, dict):
                    continue
                question_text = q.get("question")
                options = q.get("options")
                correct_ans = q.get("correct_answer")
                explanation = q.get("explanation")
                
                # Check basic schema integrity and clean option texts
                if (question_text and isinstance(options, list) and len(options) == 4 
                        and correct_ans and explanation):
                    
                    q_text_strip = str(question_text).strip()
                    if q_text_strip.lower() in seen_questions:
                        continue # Skip duplicates
                    
                    cleaned_options = [str(opt).strip() for opt in options]
                    # Check for duplicate options within the same question
                    if len(set(opt.lower() for opt in cleaned_options)) < 4:
                        continue
                        
                    cleaned_correct = str(correct_ans).strip()
                    
                    # Ensure correct answer matches exactly one option
                    matches = [opt for opt in cleaned_options if opt.lower() == cleaned_correct.lower()]
                    if len(matches) == 1:
                        # Normalize correct answer to match option casing exactly
                        q["question"] = q_text_strip
                        q["options"] = cleaned_options
                        q["correct_answer"] = matches[0]
                        q["explanation"] = str(explanation).strip()
                        q["difficulty"] = str(q.get("difficulty", difficulty)).lower().strip()
                        valid_questions.append(q)
                        seen_questions.add(q_text_strip.lower())
                    
            if valid_questions:
                return valid_questions
                
            raise ValueError("No questions passed parsing validation checks.")
        except Exception as e:
            if logic_attempt == max_logic_retries - 1:
                print(f"[FALLBACK] Gemini quiz generation failed with error: {e}. Falling back to heuristic question generation...")
                try:
                    return generate_quiz_questions_heuristically(content, difficulty, num_questions)
                except Exception as fallback_err:
                    raise ValueError(f"AI failed to generate valid structured questions. Details: {str(e)}. Fallback also failed: {fallback_err}")
            print(f"Logic parsing retry {logic_attempt + 1} due to error: {str(e)}")
            time.sleep(1)
            
    raise ValueError("AI failed to generate valid structured questions after retries.")


def generate_aptitude_questions_heuristically(difficulty: str = "medium", num_questions: int = 15) -> List[Dict[str, Any]]:
    """
    Fast local dynamic generator for Aptitude Test questions.
    Generates balanced questions across Quantitative Reasoning, Logical Reasoning, and Verbal Ability
    with parameterized numbers and questions matched to difficulty and count.
    """
    import random

    difficulty = difficulty.lower().strip()
    
    quant_pool = []
    
    if difficulty == "easy":
        speed = random.choice([40, 50, 60, 80, 90])
        dist = speed * random.choice([2, 3, 4])
        t_ans = dist / speed
        quant_pool.append({
            "category": "Quantitative Reasoning",
            "question": f"A vehicle travels at a constant speed of {speed} km/h. How many hours will it take to cover a distance of {dist} km?",
            "options": [f"{t_ans - 1:.1f} hours", f"{t_ans:.1f} hours", f"{t_ans + 0.5:.1f} hours", f"{t_ans + 1.5:.1f} hours"],
            "correctIndex": 1,
            "explanation": f"Time = Distance / Speed = {dist} / {speed} = {t_ans:.1f} hours."
        })

        orig_price = random.choice([50, 100, 200, 400])
        discount = random.choice([10, 20, 25, 50])
        sale_price = int(orig_price * (1 - discount / 100))
        quant_pool.append({
            "category": "Quantitative Reasoning",
            "question": f"An item priced at ${orig_price} is offered at a {discount}% discount. What is the final sale price?",
            "options": [f"${sale_price}", f"${sale_price + 5}", f"${sale_price - 5}", f"${orig_price - discount}"],
            "correctIndex": 0,
            "explanation": f"Discount amount = ${orig_price} × ({discount}/100) = ${orig_price * discount // 100}. Sale price = ${orig_price} - ${orig_price * discount // 100} = ${sale_price}."
        })

        n = random.choice([10, 12, 20, 25])
        ans_sum = n * (n + 1) // 2
        quant_pool.append({
            "category": "Quantitative Reasoning",
            "question": f"What is the sum of the first {n} positive consecutive integers (1, 2, 3, ..., {n})?",
            "options": [f"{ans_sum - 10}", f"{ans_sum}", f"{ans_sum + 15}", f"{ans_sum + 20}"],
            "correctIndex": 1,
            "explanation": f"Using the formula Sum = n(n+1)/2 = {n}×{n+1}/2 = {ans_sum}."
        })
        
        a, b = random.choice([(2, 3), (3, 4), (4, 5)])
        total = (a + b) * random.choice([10, 20, 15])
        val_a = (a * total) // (a + b)
        val_b = total - val_a
        quant_pool.append({
            "category": "Quantitative Reasoning",
            "question": f"A sum of ${total} is divided between Person A and Person B in the ratio {a}:{b}. How much does Person A receive?",
            "options": [f"${val_a - 10}", f"${val_a}", f"${val_b}", f"${total // 2}"],
            "correctIndex": 1,
            "explanation": f"Total parts = {a} + {b} = {a+b}. Person A's share = (${total} / {a+b}) × {a} = ${val_a}."
        })

    elif difficulty == "hard":
        w1, w2 = random.choice([(6, 12), (10, 15), (12, 24), (8, 12)])
        combined_time = (w1 * w2) / (w1 + w2)
        quant_pool.append({
            "category": "Quantitative Reasoning",
            "question": f"Worker A can complete a project alone in {w1} days, while Worker B can complete the same project in {w2} days. How many days will it take them to finish working together?",
            "options": [f"{combined_time:.1f} days", f"{combined_time + 1.5:.1f} days", f"{(w1+w2)/2:.1f} days", f"{combined_time - 0.5:.1f} days"],
            "correctIndex": 0,
            "explanation": f"Combined rate = (1/{w1} + 1/{w2}) = {(w1+w2)}/({w1*w2}). Time taken = {w1*w2}/{w1+w2} = {combined_time:.1f} days."
        })

        total_marbles = random.choice([15, 20, 25])
        red_marbles = random.choice([5, 6, 8])
        prob_percent = round((red_marbles / total_marbles) * 100, 1)
        quant_pool.append({
            "category": "Quantitative Reasoning",
            "question": f"A bag contains {red_marbles} red balls, {total_marbles - red_marbles - 3} blue balls, and 3 green balls (total {total_marbles}). If one ball is picked at random, what is the probability (in %) of picking a red ball?",
            "options": [f"{prob_percent - 5}%", f"{prob_percent}%", f"{prob_percent + 4}%", f"{(red_marbles/10)*100:.1f}%"],
            "correctIndex": 1,
            "explanation": f"Probability = (Favorable Outcomes / Total Outcomes) = {red_marbles} / {total_marbles} = {prob_percent}%."
        })

        cost_p = random.choice([150, 200, 300, 400])
        profit_pct = random.choice([15, 25, 30, 40])
        sell_p = cost_p + (cost_p * profit_pct // 100)
        quant_pool.append({
            "category": "Quantitative Reasoning",
            "question": f"A merchant buys an item for ${cost_p} and wants to sell it to earn a profit of {profit_pct}%. What should be the selling price?",
            "options": [f"${sell_p + 20}", f"${sell_p - 15}", f"${sell_p}", f"${cost_p + profit_pct}"],
            "correctIndex": 2,
            "explanation": f"Selling Price = Cost Price + Profit = ${cost_p} + (${cost_p} × {profit_pct}/100) = ${sell_p}."
        })
    else:
        speed = random.choice([60, 75, 90])
        dist = speed * 2.5
        quant_pool.append({
            "category": "Quantitative Reasoning",
            "question": f"If a car travels at a speed of {speed} km/h, how long does it take to travel a distance of {int(dist)} km?",
            "options": ["1.5 hours", "2.0 hours", "2.5 hours", "3.0 hours"],
            "correctIndex": 2,
            "explanation": f"Time = Distance / Speed = {int(dist)} / {speed} = 2.5 hours."
        })

        n = random.choice([12, 15, 16])
        ans_odd = n ** 2
        quant_pool.append({
            "category": "Quantitative Reasoning",
            "question": f"What is the sum of the first {n} positive odd integers (1, 3, 5, ...)?",
            "options": [f"{ans_odd - 25}", f"{ans_odd + 10}", f"{ans_odd}", f"{ans_odd + 31}"],
            "correctIndex": 2,
            "explanation": f"Formula for the sum of first n odd integers is n² = {n}² = {ans_odd}."
        })

        final_price = random.choice([24, 36, 48, 72])
        disc_pct = 20
        orig = int(final_price / 0.8)
        quant_pool.append({
            "category": "Quantitative Reasoning",
            "question": f"A shirt is on sale for {disc_pct}% off. The final sale price is ${final_price}. What was the original price?",
            "options": [f"${orig - 4}", f"${orig}", f"${orig + 4}", f"${orig + 8}"],
            "correctIndex": 1,
            "explanation": f"Sale price is 80% of original price. Original Price = ${final_price} / 0.8 = ${orig}."
        })

    logical_pool = [
        {
            "category": "Logical Reasoning",
            "question": "Determine the next number in the arithmetic sequence: 3, 6, 11, 18, 27, ...",
            "options": ["36", "38", "40", "42"],
            "correctIndex": 1,
            "explanation": "Differences between consecutive terms are consecutive odd numbers: 3, 5, 7, 9, 11. Next term = 27 + 11 = 38."
        },
        {
            "category": "Logical Reasoning",
            "question": "Look closely at the number series: 72, 70, 66, 60, 52, ... What number should come next?",
            "options": ["40", "42", "44", "46"],
            "correctIndex": 1,
            "explanation": "Subtracting increasing even numbers: -2, -4, -6, -8, -10. 52 - 10 = 42."
        },
        {
            "category": "Logical Reasoning",
            "question": "Pointing to a photograph of a boy, Suresh said, 'He is the son of the only son of my mother.' How is Suresh related to that boy?",
            "options": ["Brother", "Uncle", "Cousin", "Father"],
            "correctIndex": 3,
            "explanation": "'The only son of my mother' is Suresh himself. Therefore, the boy is Suresh's son."
        },
        {
            "category": "Logical Reasoning",
            "question": "If all glipglops are zumbas, and all zumbas are flimflams, is it logically true that all glipglops are flimflams?",
            "options": ["Yes, always", "No, never", "Sometimes true", "Insufficient data"],
            "correctIndex": 0,
            "explanation": "By syllogistic transitivity, if Set A is a subset of Set B and Set B is a subset of Set C, then Set A is a subset of Set C."
        },
        {
            "category": "Logical Reasoning",
            "question": "Find the missing letter in the pattern sequence: B, D, G, K, P, ...",
            "options": ["S", "U", "V", "W"],
            "correctIndex": 2,
            "explanation": "Letter positions increment by +2, +3, +4, +5, +6. P(16) + 6 = V(22)."
        },
        {
            "category": "Logical Reasoning",
            "question": "If CAT is coded as 3120 and DOG is coded as 4157, how is PIG coded in the same scheme?",
            "options": ["1697", "16970", "1597", "16197"],
            "correctIndex": 0,
            "explanation": "Each letter is replaced by its 1-indexed alphabetical position: P=16, I=9, G=7 -> 1697."
        }
    ]

    verbal_pool = [
        {
            "category": "Verbal Ability",
            "question": "Which of the following words is most nearly the OPPOSITE in meaning to 'Candid'?",
            "options": ["Sincere", "Bold", "Devious", "Playful"],
            "correctIndex": 2,
            "explanation": "'Candid' means frank and truthful. 'Devious' means dishonest or underhanded, which is the direct opposite."
        },
        {
            "category": "Verbal Ability",
            "question": "Choose the option that best completes the analogy: 'Subtle is to Glaring' as:",
            "options": ["Obvious is to Hidden", "Quiet is to Loud", "Soft is to Hard", "Weak is to Strong"],
            "correctIndex": 1,
            "explanation": "'Subtle' and 'Glaring' are antonyms of intensity/visibility, mirroring 'Quiet' and 'Loud'."
        },
        {
            "category": "Verbal Ability",
            "question": "Identify the grammatical error: 'Neither the teacher nor the students was prepared for the exam.'",
            "options": ["Neither... nor", "the teacher", "was prepared", "prepared for"],
            "correctIndex": 2,
            "explanation": "Verb agrees with closest subject ('students'). 'was prepared' should be 'were prepared'."
        },
        {
            "category": "Verbal Ability",
            "question": "Which word is closest in meaning to 'Ephemeral'?",
            "options": ["Transient", "Permanent", "Eternal", "Substantial"],
            "correctIndex": 0,
            "explanation": "'Ephemeral' means lasting a very short time, synonymous with 'Transient'."
        },
        {
            "category": "Verbal Ability",
            "question": "Complete the sentence: 'Despite her initial reservation, she was eventually ________ by his earnest explanation.'",
            "options": ["swayed", "deterred", "repelled", "dismissed"],
            "correctIndex": 0,
            "explanation": "'Swayed' fits the context, meaning convinced or moved by the explanation."
        }
    ]

    all_questions = []
    
    # Expand questions list by duplicating/varying until we hit num_questions
    pool_index = 0
    while len(all_questions) < num_questions:
        q_item = None
        category_choice = pool_index % 3
        if category_choice == 0 and quant_pool:
            q_item = quant_pool[len(all_questions) % len(quant_pool)]
        elif category_choice == 1 and logical_pool:
            q_item = logical_pool[len(all_questions) % len(logical_pool)]
        elif verbal_pool:
            q_item = verbal_pool[len(all_questions) % len(verbal_pool)]
            
        if q_item:
            q_copy = dict(q_item)
            q_copy["id"] = len(all_questions) + 1
            all_questions.append(q_copy)
        pool_index += 1

    return all_questions[:num_questions]


def generate_aptitude_questions(difficulty: str = "medium", num_questions: int = 10) -> List[Dict[str, Any]]:
    """
    Generates dynamic aptitude test questions using Gemini API or fast local fallback.
    Questions are balanced across Quantitative Reasoning, Logical Reasoning, and Verbal Ability.
    """
    api_key_to_use = settings.GEMINI_API_KEY
    
    if api_key_to_use and api_key_to_use.startswith("AIza"):
        prompt = f"""
        You are an expert aptitude test developer. Create a balanced, high-quality aptitude test with exactly {num_questions} questions.
        The difficulty level of the test must be: {difficulty.upper()}.
        
        Distribute the questions evenly across these three categories:
        1. Quantitative Reasoning (mathematical puzzles, speed, distance, percentages, series, arithmetic, algebra)
        2. Logical Reasoning (deductions, series patterns, relationships, syllogisms)
        3. Verbal Ability (antonyms/synonyms, analogies, grammatical corrections, reading comprehension style logic)
        
        You MUST respond with a valid JSON array of objects. Do NOT wrap the JSON in ```json or ``` or any markdown formatting. Output ONLY raw JSON code.
        Each object in the JSON array must strictly follow this structure:
        {{
            "category": "Quantitative Reasoning" or "Logical Reasoning" or "Verbal Ability",
            "question": "The text of the question. Make it clear and challenging.",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correctIndex": 0, // Integer (0 to 3) representing the index of the correct answer in options
            "explanation": "A detailed explanation of why the answer is correct and how to solve it step-by-step."
        }}
        
        Ensure all questions are completely new, mathematically correct, grammatically perfect, and logical.
        """
        try:
            response_text = call_gemini(prompt, json_mode=True, api_key=api_key_to_use)
            cleaned_text = response_text.strip()
            if cleaned_text.startswith("```"):
                cleaned_text = re.sub(r"^```[a-zA-Z]*\n", "", cleaned_text)
                cleaned_text = re.sub(r"\n```$", "", cleaned_text)
                cleaned_text = cleaned_text.strip()
                
            questions = json.loads(cleaned_text)
            if isinstance(questions, list) and len(questions) > 0:
                validated_questions = []
                for idx, q in enumerate(questions):
                    validated_q = {
                        "id": idx + 1,
                        "category": q.get("category", "Aptitude"),
                        "question": q.get("question", "No question text"),
                        "options": q.get("options", ["A", "B", "C", "D"])[:4],
                        "correctIndex": int(q.get("correctIndex", 0)),
                        "explanation": q.get("explanation", "No explanation available.")
                    }
                    validated_questions.append(validated_q)
                return validated_questions
        except Exception as e:
            print(f"[FAST_FALLBACK] Gemini API failed for aptitude questions: {e}. Falling back to dynamic local generator...")
            
    print("[FAST_FALLBACK] Generating aptitude questions dynamically locally...")
    return generate_aptitude_questions_heuristically(difficulty=difficulty, num_questions=num_questions)
