import sys
import os

# Add server root to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def run_tests():
    print("Testing backend modules imports...")
    
    try:
        from app.database import Base, engine
        print("[OK] Database and engine imported.")
    except Exception as e:
        print(f"[FAIL] Database import failed: {e}")
        return False

    try:
        import app.models as models
        print("[OK] Database models imported successfully.")
        
        # Verify the new models are registered in SQLAlchemy Base
        registered = list(Base.metadata.tables.keys())
        print(f"  Registered tables: {registered}")
        
        expected_tables = ["documents", "modules", "chapters", "topics", "quizzes", "questions", "options", "quiz_attempts", "user_answers"]
        missing = [t for t in expected_tables if t not in registered]
        if missing:
            print(f"[FAIL] Missing registered tables: {missing}")
            return False
        else:
            print("[OK] All expected tables are registered in database metadata.")
            
    except Exception as e:
        print(f"[FAIL] Database models validation failed: {e}")
        return False

    try:
        from app.utils.document_parser import extract_text_for_validated_file
        print("[OK] Document parser imported successfully.")
    except Exception as e:
        print(f"[FAIL] Document parser import failed: {e}")
        return False

    try:
        from app.utils.gemini_helper import analyze_document, generate_quiz_questions
        print("[OK] Gemini helper imported successfully.")
    except Exception as e:
        print(f"[FAIL] Gemini helper import failed: {e}")
        return False

    try:
        from app.routers import documents, quizzes
        print("[OK] Routers imported successfully.")
    except Exception as e:
        print(f"[FAIL] Routers import failed: {e}")
        return False

    print("[OK] Backend sanity tests PASSED successfully!")
    return True

if __name__ == "__main__":
    success = run_tests()
    sys.exit(0 if success else 1)
