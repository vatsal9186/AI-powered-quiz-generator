import os
from docx import Document

books_dir = os.path.join(os.path.dirname(__file__), "sample_books")
os.makedirs(books_dir, exist_ok=True)

# 1. Create a DOCX textbook: Data Structures and Algorithms Guide
doc = Document()
doc.add_heading('Data Structures and Algorithms Textbook', 0)

doc.add_heading('Module 1: Linear Data Structures', level=1)
doc.add_heading('Chapter 1: Arrays and Linked Lists', level=2)
doc.add_paragraph(
    'An array is a collection of items stored at contiguous memory locations. '
    'Random access is allowed with O(1) complexity. '
    'A linked list consists of nodes where each node contains data and a reference pointer to the next node. '
    'Insertion and deletion in a linked list can be performed in O(1) time if pointer references are known.'
)

doc.add_heading('Chapter 2: Stacks and Queues', level=2)
doc.add_paragraph(
    'A Stack follows the Last-In-First-Out (LIFO) principle. Common operations include push(), pop(), and peek(). '
    'Stacks are heavily used in function call call-stacks, expression evaluation, and backtracking algorithms. '
    'A Queue follows the First-In-First-Out (FIFO) principle with enqueue() and dequeue() operations. '
    'Queues are used in CPU scheduling, breadth-first search (BFS), and asynchronous message buffers.'
)

doc.add_heading('Module 2: Non-Linear Data Structures and Sorting', level=1)
doc.add_heading('Chapter 3: Binary Trees and Heaps', level=2)
doc.add_paragraph(
    'A Binary Tree is a hierarchical data structure in which each parent node has at most two children, referred to as left and right. '
    'Binary Search Trees (BST) maintain an invariant where left child values are strictly smaller than root, and right child values are larger. '
    'A Heap is a complete binary tree where parent nodes maintain heap order properties (Max-Heap or Min-Heap).'
)

doc.add_heading('Chapter 4: Sorting and Searching Algorithms', level=2)
doc.add_paragraph(
    'QuickSort is a divide-and-conquer algorithm with average time complexity of O(n log n). '
    'MergeSort guarantees O(n log n) worst-case time complexity using extra space for merge operations. '
    'Binary Search operates on sorted arrays in logarithmic time complexity O(log n).'
)

docx_path = os.path.join(books_dir, "Data_Structures_and_Algorithms_Textbook.docx")
doc.save(docx_path)
print(f"Created DOCX Textbook: {docx_path}")

# 2. Create a TXT textbook: Artificial Intelligence and Machine Learning Overview
txt_content = """===================================================================
ARTIFICIAL INTELLIGENCE AND MACHINE LEARNING - COMPREHENSIVE TEXTBOOK
===================================================================

MODULE 1: INTRODUCTION TO ARTIFICIAL INTELLIGENCE

CHAPTER 1: Foundations of Artificial Intelligence
Artificial Intelligence (AI) refers to the simulation of human intelligence in machines programmed to think, reason, and learn. The core subfields of AI include Machine Learning (ML), Natural Language Processing (NLP), Computer Vision, and Robotics. Symbolic AI relies on formal logic and rules, whereas modern AI leverages statistical learning from large datasets.

CHAPTER 2: Supervised and Unsupervised Machine Learning
Supervised learning algorithms build mathematical models from training datasets containing input features and explicit target labels. Typical algorithms include Linear Regression, Logistic Regression, Decision Trees, Support Vector Machines (SVM), and Random Forests. Unsupervised learning discovers hidden patterns or clusters without human-provided labels using techniques like K-Means Clustering, Hierarchical Clustering, and Principal Component Analysis (PCA).

MODULE 2: DEEP LEARNING AND MODERN NEURAL NETWORKS

CHAPTER 3: Artificial Neural Networks and Backpropagation
An Artificial Neural Network (ANN) consists of interconnected layers of artificial neurons (perceptrons). Activation functions such as ReLU (Rectified Linear Unit), Sigmoid, and Tanh introduce non-linearity. Training involves forward propagation of inputs, computation of loss via loss functions (e.g., Cross-Entropy Loss), and backward propagation of errors using gradient descent optimizations (e.g., Adam, SGD).

CHAPTER 4: Large Language Models and Generative AI
Transformer architectures rely on self-attention mechanisms to process tokens in parallel rather than sequentially. Generative Pre-trained Transformers (GPT) predict subsequent tokens in text sequences. Retrieval-Augmented Generation (RAG) combines dense vector search databases with LLMs to eliminate hallucinations and produce accurate, source-backed answers.
"""

txt_path = os.path.join(books_dir, "Artificial_Intelligence_and_ML_Textbook.txt")
with open(txt_path, "w", encoding="utf-8") as f:
    f.write(txt_content)
print(f"Created TXT Textbook: {txt_path}")
