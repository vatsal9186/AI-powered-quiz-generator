import sys
import os

# Add server root to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.utils.file_validator import validate_uploaded_file, FileValidationError

def test_validation_logic():
    print("Testing upload validation logic...")

    # Test case 1: Empty file
    try:
        validate_uploaded_file(b"", "document.pdf")
        print("[FAIL] Empty file did not trigger validation error.")
        return False
    except FileValidationError as e:
        assert e.error_code == "INVALID_FILE"
        print("[OK] Empty file validation rejected correctly.")

    # Test case 2: File size > 10MB
    try:
        oversized_bytes = b"0" * (10 * 1024 * 1024 + 1)
        validate_uploaded_file(oversized_bytes, "document.pdf")
        print("[FAIL] Oversized file did not trigger validation error.")
        return False
    except FileValidationError as e:
        assert e.error_code == "FILE_TOO_LARGE"
        print("[OK] Oversized file validation rejected correctly.")

    # Test case 3: Unsupported file extension
    try:
        validate_uploaded_file(b"%PDF-1.4...", "document.png")
        print("[FAIL] Unsupported file extension did not trigger validation error.")
        return False
    except FileValidationError as e:
        assert e.error_code == "UNSUPPORTED_FILE_TYPE"
        print("[OK] Unsupported file extension rejected correctly.")

    # Test case 4: Content mismatch (Renamed TXT to PDF)
    try:
        validate_uploaded_file(b"This is a plain text file, not a PDF.", "document.pdf")
        print("[FAIL] Header mismatch did not trigger validation error.")
        return False
    except FileValidationError as e:
        assert e.error_code == "UNSUPPORTED_FILE_TYPE"
        print("[OK] Content signature mismatch (TXT renamed to PDF) rejected correctly.")

    # Test case 5: Content mismatch (ZIP renamed to PDF)
    try:
        validate_uploaded_file(b"PK\x03\x04extrabytes", "document.pdf")
        print("[FAIL] Header mismatch did not trigger validation error.")
        return False
    except FileValidationError as e:
        assert e.error_code == "UNSUPPORTED_FILE_TYPE"
        print("[OK] Content signature mismatch (ZIP renamed to PDF) rejected correctly.")

    # Test case 6: Valid PDF (simulated)
    # A basic valid PDF header starts with %PDF
    try:
        # pypdf reader requires actual pdf content structure, so we can mock the page check or try to load
        # Let's verify that a fake pdf fails during pypdf parsing rather than magic bytes
        validate_uploaded_file(b"%PDF-1.5\n%...", "document.pdf")
        print("[FAIL] Corrupted PDF did not trigger invalid file error during pypdf parsing.")
        return False
    except FileValidationError as e:
        assert e.error_code == "INVALID_FILE"
        print("[OK] Corrupted PDF signature checked, then failed gracefully on reader parsing.")

    print("[OK] All upload validation tests PASSED successfully!")
    return True

if __name__ == "__main__":
    success = test_validation_logic()
    sys.exit(0 if success else 1)
