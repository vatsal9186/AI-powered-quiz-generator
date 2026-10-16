import os
import io
import zipfile
from typing import List

class FileValidationError(Exception):
    def __init__(self, status_code: int, error_code: str, message: str):
        self.status_code = status_code
        self.error_code = error_code
        self.message = message

def validate_file_signature(file_bytes: bytes, filename: str) -> str:
    """
    Validates magic bytes structure of the file and returns the validated format.
    Raises ValueError (with error_code, error_msg tuple) if signature doesn't match extension.
    """
    ext = filename.lower().split(".")[-1]
    if len(file_bytes) < 8:
        raise ValueError("INVALID_FILE", "The uploaded file is empty, corrupted, or cannot be processed.")
        
    # Check PDF signature anywhere in the first 1024 bytes to be tolerant of BOM/whitespace/metadata
    first_kb = file_bytes[:1024]
    if b"%PDF" in first_kb:
        if ext != "pdf":
            raise ValueError("UNSUPPORTED_FILE_TYPE", "Only PDF, PPT, PPTX, DOC, and DOCX files are supported.")
        return "pdf"
        
    header = file_bytes[:8]
    # 2. ZIP-based modern Office formats (DOCX, PPTX)
    if header.startswith(b"PK\x03\x04"):
        if ext not in ["docx", "pptx"]:
            raise ValueError("UNSUPPORTED_FILE_TYPE", "Only PDF, PPT, PPTX, DOC, and DOCX files are supported.")
        # Differentiate docx vs pptx by checking internal files in ZIP in memory
        try:
            with zipfile.ZipFile(io.BytesIO(file_bytes)) as z:
                namelist = z.namelist()
                if any("word/document.xml" in name for name in namelist):
                    if ext != "docx":
                        raise ValueError("UNSUPPORTED_FILE_TYPE", "Only PDF, PPT, PPTX, DOC, and DOCX files are supported.")
                    return "docx"
                elif any("ppt/presentation.xml" in name for name in namelist):
                    if ext != "pptx":
                        raise ValueError("UNSUPPORTED_FILE_TYPE", "Only PDF, PPT, PPTX, DOC, and DOCX files are supported.")
                    return "pptx"
                else:
                    raise ValueError("INVALID_FILE", "The uploaded file is empty, corrupted, or cannot be processed.")
        except zipfile.BadZipFile:
            raise ValueError("INVALID_FILE", "The uploaded file is empty, corrupted, or cannot be processed.")
            
    # 3. OLE2 legacy Compound Binary Document binary formats (DOC, PPT)
    if header.startswith(b"\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1"):
        if ext not in ["doc", "ppt"]:
            raise ValueError("UNSUPPORTED_FILE_TYPE", "Only PDF, PPT, PPTX, DOC, and DOCX files are supported.")
        return ext
        
    # Reject everything else
    raise ValueError("UNSUPPORTED_FILE_TYPE", "Only PDF, PPT, PPTX, DOC, and DOCX files are supported.")

def validate_uploaded_file(file_bytes: bytes, filename: str) -> str:
    """
    Enforces strict file upload validations: size, extension, signatures, PDF page counts.
    Returns the detected format string if successful, else raises FileValidationError.
    """
    # 1. Empty check
    if len(file_bytes) == 0:
        raise FileValidationError(400, "INVALID_FILE", "The uploaded file is empty, corrupted, or cannot be processed.")

    # 2. File size limit check (100MB)
    if len(file_bytes) > 100 * 1024 * 1024:
        raise FileValidationError(400, "FILE_TOO_LARGE", "File size exceeds the maximum allowed limit of 100 MB. Please upload a file smaller than or equal to 100 MB.")

    # 3. File extension checks
    filename_clean = os.path.basename(filename)
    if "." not in filename_clean:
        raise FileValidationError(400, "UNSUPPORTED_FILE_TYPE", "Only PDF, PPT, PPTX, DOC, and DOCX files are supported.")
        
    ext = filename_clean.lower().split(".")[-1]
    supported = {"pdf", "doc", "docx", "ppt", "pptx"}
    if ext not in supported:
        raise FileValidationError(400, "UNSUPPORTED_FILE_TYPE", "Only PDF, PPT, PPTX, DOC, and DOCX files are supported.")

    # 4. Check Magic Signature
    try:
        detected_format = validate_file_signature(file_bytes, filename_clean)
    except ValueError as ve:
        err_code, err_msg = ve.args
        raise FileValidationError(400, err_code, err_msg)

    # 5. Check PDF Page Limit
    if detected_format == "pdf":
        try:
            import pymupdf
            doc = pymupdf.open(stream=file_bytes, filetype="pdf")
            page_count = len(doc)
            doc.close()
            if page_count > 5000:
                raise FileValidationError(
                    400, 
                    "PDF_PAGE_LIMIT_EXCEEDED", 
                    "PDF page limit exceeded. The maximum allowed number of pages is 5000. Please upload a PDF containing 5000 pages or fewer."
                )
        except FileValidationError:
            raise
        except Exception:
            raise FileValidationError(400, "INVALID_FILE", "The uploaded file is empty, corrupted, or cannot be processed.")

    return detected_format
