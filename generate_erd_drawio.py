import xml.etree.ElementTree as ET

# Create XML structure for draw.io ER diagram
drawio_xml = """<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="app.diagrams.net" modified="2026-08-31T21:10:00.000Z" agent="Mozilla/5.0" version="21.0.0" type="device">
  <diagram id="questai-erd-bw" name="QuestAI ERD (Black &amp; White)">
    <mxGraphModel dx="1200" dy="800" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1600" pageHeight="1100" math="0" shadow="0">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />

        <!-- Title -->
        <mxCell id="title" value="QuestAI - Entity Relationship Diagram (10 Tables)" style="text;html=1;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;fontStyle=1;fontSize=22;fontColor=#000000;" vertex="1" parent="1">
          <mxGeometry x="500" y="20" width="600" height="40" as="geometry" />
        </mxCell>

        <!-- Entity 1: users -->
        <mxCell id="tbl_users" value="users" style="swimlane;childLayout=stackLayout;horizontal=1;startSize=30;horizontalStack=0;fillColor=#FFFFFF;strokeColor=#000000;fontColor=#000000;fontStyle=1;fontSize=14;align=center;whiteSpace=wrap;collapsible=0;dropTarget=0;" vertex="1" parent="1">
          <mxGeometry x="50" y="100" width="220" height="260" as="geometry" />
        </mxCell>
        <mxCell id="u_1" value="+ id: int [PK]" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=8;fontSize=11;fontColor=#000000;fontStyle=1;" vertex="1" parent="tbl_users">
          <mxGeometry y="30" width="220" height="20" as="geometry" />
        </mxCell>
        <mxCell id="u_2" value="+ email: string [UQ]" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=8;fontSize=11;fontColor=#000000;" vertex="1" parent="tbl_users">
          <mxGeometry y="50" width="220" height="20" as="geometry" />
        </mxCell>
        <mxCell id="u_3" value="+ hashed_password: string" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=8;fontSize=11;fontColor=#000000;" vertex="1" parent="tbl_users">
          <mxGeometry y="70" width="220" height="20" as="geometry" />
        </mxCell>
        <mxCell id="u_4" value="+ full_name: string" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=8;fontSize=11;fontColor=#000000;" vertex="1" parent="tbl_users">
          <mxGeometry y="90" width="220" height="20" as="geometry" />
        </mxCell>
        <mxCell id="u_5" value="+ google_id: string [UQ]" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=8;fontSize=11;fontColor=#000000;" vertex="1" parent="tbl_users">
          <mxGeometry y="110" width="220" height="20" as="geometry" />
        </mxCell>
        <mxCell id="u_6" value="+ profile_picture: string" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=8;fontSize=11;fontColor=#000000;" vertex="1" parent="tbl_users">
          <mxGeometry y="130" width="220" height="20" as="geometry" />
        </mxCell>
        <mxCell id="u_7" value="+ auth_provider: string" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=8;fontSize=11;fontColor=#000000;" vertex="1" parent="tbl_users">
          <mxGeometry y="150" width="220" height="20" as="geometry" />
        </mxCell>
        <mxCell id="u_8" value="+ role: string" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=8;fontSize=11;fontColor=#000000;" vertex="1" parent="tbl_users">
          <mxGeometry y="170" width="220" height="20" as="geometry" />
        </mxCell>
        <mxCell id="u_9" value="+ status: string" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=8;fontSize=11;fontColor=#000000;" vertex="1" parent="tbl_users">
          <mxGeometry y="190" width="220" height="20" as="geometry" />
        </mxCell>
        <mxCell id="u_10" value="+ created_at: datetime" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=8;fontSize=11;fontColor=#000000;" vertex="1" parent="tbl_users">
          <mxGeometry y="210" width="220" height="20" as="geometry" />
        </mxCell>
        <mxCell id="u_11" value="+ updated_at: datetime" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=8;fontSize=11;fontColor=#000000;" vertex="1" parent="tbl_users">
          <mxGeometry y="230" width="220" height="20" as="geometry" />
        </mxCell>

        <!-- Entity 2: documents -->
        <mxCell id="tbl_documents" value="documents" style="swimlane;childLayout=stackLayout;horizontal=1;startSize=30;horizontalStack=0;fillColor=#FFFFFF;strokeColor=#000000;fontColor=#000000;fontStyle=1;fontSize=14;align=center;whiteSpace=wrap;collapsible=0;dropTarget=0;" vertex="1" parent="1">
          <mxGeometry x="350" y="100" width="220" height="200" as="geometry" />
        </mxCell>
        <mxCell id="d_1" value="+ id: int [PK]" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=8;fontSize=11;fontColor=#000000;fontStyle=1;" vertex="1" parent="tbl_documents">
          <mxGeometry y="30" width="220" height="20" as="geometry" />
        </mxCell>
        <mxCell id="d_2" value="# owner_id: int [FK]" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=8;fontSize=11;fontColor=#000000;fontStyle=1;" vertex="1" parent="tbl_documents">
          <mxGeometry y="50" width="220" height="20" as="geometry" />
        </mxCell>
        <mxCell id="d_3" value="+ title: string" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=8;fontSize=11;fontColor=#000000;" vertex="1" parent="tbl_documents">
          <mxGeometry y="70" width="220" height="20" as="geometry" />
        </mxCell>
        <mxCell id="d_4" value="+ file_name: string" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=8;fontSize=11;fontColor=#000000;" vertex="1" parent="tbl_documents">
          <mxGeometry y="90" width="220" height="20" as="geometry" />
        </mxCell>
        <mxCell id="d_5" value="+ content: string" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=8;fontSize=11;fontColor=#000000;" vertex="1" parent="tbl_documents">
          <mxGeometry y="110" width="220" height="20" as="geometry" />
        </mxCell>
        <mxCell id="d_6" value="+ status: string" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=8;fontSize=11;fontColor=#000000;" vertex="1" parent="tbl_documents">
          <mxGeometry y="130" width="220" height="20" as="geometry" />
        </mxCell>
        <mxCell id="d_7" value="+ error_message: string" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=8;fontSize=11;fontColor=#000000;" vertex="1" parent="tbl_documents">
          <mxGeometry y="150" width="220" height="20" as="geometry" />
        </mxCell>
        <mxCell id="d_8" value="+ created_at: datetime" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=8;fontSize=11;fontColor=#000000;" vertex="1" parent="tbl_documents">
          <mxGeometry y="170" width="220" height="20" as="geometry" />
        </mxCell>

        <!-- Entity 3: modules -->
        <mxCell id="tbl_modules" value="modules" style="swimlane;childLayout=stackLayout;horizontal=1;startSize=30;horizontalStack=0;fillColor=#FFFFFF;strokeColor=#000000;fontColor=#000000;fontStyle=1;fontSize=14;align=center;whiteSpace=wrap;collapsible=0;dropTarget=0;" vertex="1" parent="1">
          <mxGeometry x="650" y="100" width="200" height="120" as="geometry" />
        </mxCell>
        <mxCell id="m_1" value="+ id: int [PK]" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=8;fontSize=11;fontColor=#000000;fontStyle=1;" vertex="1" parent="tbl_modules">
          <mxGeometry y="30" width="200" height="20" as="geometry" />
        </mxCell>
        <mxCell id="m_2" value="# document_id: int [FK]" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=8;fontSize=11;fontColor=#000000;fontStyle=1;" vertex="1" parent="tbl_modules">
          <mxGeometry y="50" width="200" height="20" as="geometry" />
        </mxCell>
        <mxCell id="m_3" value="+ title: string" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=8;fontSize=11;fontColor=#000000;" vertex="1" parent="tbl_modules">
          <mxGeometry y="70" width="200" height="20" as="geometry" />
        </mxCell>
        <mxCell id="m_4" value="+ order: int" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=8;fontSize=11;fontColor=#000000;" vertex="1" parent="tbl_modules">
          <mxGeometry y="90" width="200" height="20" as="geometry" />
        </mxCell>

        <!-- Entity 4: chapters -->
        <mxCell id="tbl_chapters" value="chapters" style="swimlane;childLayout=stackLayout;horizontal=1;startSize=30;horizontalStack=0;fillColor=#FFFFFF;strokeColor=#000000;fontColor=#000000;fontStyle=1;fontSize=14;align=center;whiteSpace=wrap;collapsible=0;dropTarget=0;" vertex="1" parent="1">
          <mxGeometry x="930" y="100" width="210" height="160" as="geometry" />
        </mxCell>
        <mxCell id="c_1" value="+ id: int [PK]" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=8;fontSize=11;fontColor=#000000;fontStyle=1;" vertex="1" parent="tbl_chapters">
          <mxGeometry y="30" width="210" height="20" as="geometry" />
        </mxCell>
        <mxCell id="c_2" value="# document_id: int [FK]" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=8;fontSize=11;fontColor=#000000;fontStyle=1;" vertex="1" parent="tbl_chapters">
          <mxGeometry y="50" width="210" height="20" as="geometry" />
        </mxCell>
        <mxCell id="c_3" value="# module_id: int [FK]" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=8;fontSize=11;fontColor=#000000;fontStyle=1;" vertex="1" parent="tbl_chapters">
          <mxGeometry y="70" width="210" height="20" as="geometry" />
        </mxCell>
        <mxCell id="c_4" value="+ title: string" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=8;fontSize=11;fontColor=#000000;" vertex="1" parent="tbl_chapters">
          <mxGeometry y="90" width="210" height="20" as="geometry" />
        </mxCell>
        <mxCell id="c_5" value="+ content: string" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=8;fontSize=11;fontColor=#000000;" vertex="1" parent="tbl_chapters">
          <mxGeometry y="110" width="210" height="20" as="geometry" />
        </mxCell>
        <mxCell id="c_6" value="+ order: int" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=8;fontSize=11;fontColor=#000000;" vertex="1" parent="tbl_chapters">
          <mxGeometry y="130" width="210" height="20" as="geometry" />
        </mxCell>

        <!-- Entity 5: topics -->
        <mxCell id="tbl_topics" value="topics" style="swimlane;childLayout=stackLayout;horizontal=1;startSize=30;horizontalStack=0;fillColor=#FFFFFF;strokeColor=#000000;fontColor=#000000;fontStyle=1;fontSize=14;align=center;whiteSpace=wrap;collapsible=0;dropTarget=0;" vertex="1" parent="1">
          <mxGeometry x="1220" y="100" width="200" height="120" as="geometry" />
        </mxCell>
        <mxCell id="top_1" value="+ id: int [PK]" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=8;fontSize=11;fontColor=#000000;fontStyle=1;" vertex="1" parent="tbl_topics">
          <mxGeometry y="30" width="200" height="20" as="geometry" />
        </mxCell>
        <mxCell id="top_2" value="# chapter_id: int [FK]" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=8;fontSize=11;fontColor=#000000;fontStyle=1;" vertex="1" parent="tbl_topics">
          <mxGeometry y="50" width="200" height="20" as="geometry" />
        </mxCell>
        <mxCell id="top_3" value="+ title: string" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=8;fontSize=11;fontColor=#000000;" vertex="1" parent="tbl_topics">
          <mxGeometry y="70" width="200" height="20" as="geometry" />
        </mxCell>
        <mxCell id="top_4" value="+ order: int" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=8;fontSize=11;fontColor=#000000;" vertex="1" parent="tbl_topics">
          <mxGeometry y="90" width="200" height="20" as="geometry" />
        </mxCell>

        <!-- Entity 6: quizzes -->
        <mxCell id="tbl_quizzes" value="quizzes" style="swimlane;childLayout=stackLayout;horizontal=1;startSize=30;horizontalStack=0;fillColor=#FFFFFF;strokeColor=#000000;fontColor=#000000;fontStyle=1;fontSize=14;align=center;whiteSpace=wrap;collapsible=0;dropTarget=0;" vertex="1" parent="1">
          <mxGeometry x="350" y="420" width="220" height="220" as="geometry" />
        </mxCell>
        <mxCell id="q_1" value="+ id: int [PK]" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=8;fontSize=11;fontColor=#000000;fontStyle=1;" vertex="1" parent="tbl_quizzes">
          <mxGeometry y="30" width="220" height="20" as="geometry" />
        </mxCell>
        <mxCell id="q_2" value="# creator_id: int [FK]" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=8;fontSize=11;fontColor=#000000;fontStyle=1;" vertex="1" parent="tbl_quizzes">
          <mxGeometry y="50" width="220" height="20" as="geometry" />
        </mxCell>
        <mxCell id="q_3" value="# document_id: int [FK]" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=8;fontSize=11;fontColor=#000000;fontStyle=1;" vertex="1" parent="tbl_quizzes">
          <mxGeometry y="70" width="220" height="20" as="geometry" />
        </mxCell>
        <mxCell id="q_4" value="+ title: string" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=8;fontSize=11;fontColor=#000000;" vertex="1" parent="tbl_quizzes">
          <mxGeometry y="90" width="220" height="20" as="geometry" />
        </mxCell>
        <mxCell id="q_5" value="+ description: string" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=8;fontSize=11;fontColor=#000000;" vertex="1" parent="tbl_quizzes">
          <mxGeometry y="110" width="220" height="20" as="geometry" />
        </mxCell>
        <mxCell id="q_6" value="+ source_type: string" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=8;fontSize=11;fontColor=#000000;" vertex="1" parent="tbl_quizzes">
          <mxGeometry y="130" width="220" height="20" as="geometry" />
        </mxCell>
        <mxCell id="q_7" value="+ difficulty: string" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=8;fontSize=11;fontColor=#000000;" vertex="1" parent="tbl_quizzes">
          <mxGeometry y="150" width="220" height="20" as="geometry" />
        </mxCell>
        <mxCell id="q_8" value="+ status: string" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=8;fontSize=11;fontColor=#000000;" vertex="1" parent="tbl_quizzes">
          <mxGeometry y="170" width="220" height="20" as="geometry" />
        </mxCell>
        <mxCell id="q_9" value="+ created_at: datetime" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=8;fontSize=11;fontColor=#000000;" vertex="1" parent="tbl_quizzes">
          <mxGeometry y="190" width="220" height="20" as="geometry" />
        </mxCell>

        <!-- Entity 7: questions -->
        <mxCell id="tbl_questions" value="questions" style="swimlane;childLayout=stackLayout;horizontal=1;startSize=30;horizontalStack=0;fillColor=#FFFFFF;strokeColor=#000000;fontColor=#000000;fontStyle=1;fontSize=14;align=center;whiteSpace=wrap;collapsible=0;dropTarget=0;" vertex="1" parent="1">
          <mxGeometry x="650" y="420" width="220" height="200" as="geometry" />
        </mxCell>
        <mxCell id="qst_1" value="+ id: int [PK]" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=8;fontSize=11;fontColor=#000000;fontStyle=1;" vertex="1" parent="tbl_questions">
          <mxGeometry y="30" width="220" height="20" as="geometry" />
        </mxCell>
        <mxCell id="qst_2" value="# quiz_id: int [FK]" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=8;fontSize=11;fontColor=#000000;fontStyle=1;" vertex="1" parent="tbl_questions">
          <mxGeometry y="50" width="220" height="20" as="geometry" />
        </mxCell>
        <mxCell id="qst_3" value="+ question_text: string" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=8;fontSize=11;fontColor=#000000;" vertex="1" parent="tbl_questions">
          <mxGeometry y="70" width="220" height="20" as="geometry" />
        </mxCell>
        <mxCell id="qst_4" value="+ type: string" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=8;fontSize=11;fontColor=#000000;" vertex="1" parent="tbl_questions">
          <mxGeometry y="90" width="220" height="20" as="geometry" />
        </mxCell>
        <mxCell id="qst_5" value="+ explanation: string" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=8;fontSize=11;fontColor=#000000;" vertex="1" parent="tbl_questions">
          <mxGeometry y="110" width="220" height="20" as="geometry" />
        </mxCell>
        <mxCell id="qst_6" value="+ points: int" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=8;fontSize=11;fontColor=#000000;" vertex="1" parent="tbl_questions">
          <mxGeometry y="130" width="220" height="20" as="geometry" />
        </mxCell>
        <mxCell id="qst_7" value="+ difficulty: string" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=8;fontSize=11;fontColor=#000000;" vertex="1" parent="tbl_questions">
          <mxGeometry y="150" width="220" height="20" as="geometry" />
        </mxCell>
        <mxCell id="qst_8" value="+ created_at: datetime" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=8;fontSize=11;fontColor=#000000;" vertex="1" parent="tbl_questions">
          <mxGeometry y="170" width="220" height="20" as="geometry" />
        </mxCell>

        <!-- Entity 8: options -->
        <mxCell id="tbl_options" value="options" style="swimlane;childLayout=stackLayout;horizontal=1;startSize=30;horizontalStack=0;fillColor=#FFFFFF;strokeColor=#000000;fontColor=#000000;fontStyle=1;fontSize=14;align=center;whiteSpace=wrap;collapsible=0;dropTarget=0;" vertex="1" parent="1">
          <mxGeometry x="950" y="420" width="200" height="120" as="geometry" />
        </mxCell>
        <mxCell id="opt_1" value="+ id: int [PK]" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=8;fontSize=11;fontColor=#000000;fontStyle=1;" vertex="1" parent="tbl_options">
          <mxGeometry y="30" width="200" height="20" as="geometry" />
        </mxCell>
        <mxCell id="opt_2" value="# question_id: int [FK]" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=8;fontSize=11;fontColor=#000000;fontStyle=1;" vertex="1" parent="tbl_options">
          <mxGeometry y="50" width="200" height="20" as="geometry" />
        </mxCell>
        <mxCell id="opt_3" value="+ option_text: string" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=8;fontSize=11;fontColor=#000000;" vertex="1" parent="tbl_options">
          <mxGeometry y="70" width="200" height="20" as="geometry" />
        </mxCell>
        <mxCell id="opt_4" value="+ is_correct: boolean" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=8;fontSize=11;fontColor=#000000;" vertex="1" parent="tbl_options">
          <mxGeometry y="90" width="200" height="20" as="geometry" />
        </mxCell>

        <!-- Entity 9: quiz_attempts -->
        <mxCell id="tbl_quiz_attempts" value="quiz_attempts" style="swimlane;childLayout=stackLayout;horizontal=1;startSize=30;horizontalStack=0;fillColor=#FFFFFF;strokeColor=#000000;fontColor=#000000;fontStyle=1;fontSize=14;align=center;whiteSpace=wrap;collapsible=0;dropTarget=0;" vertex="1" parent="1">
          <mxGeometry x="350" y="700" width="220" height="160" as="geometry" />
        </mxCell>
        <mxCell id="qa_1" value="+ id: int [PK]" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=8;fontSize=11;fontColor=#000000;fontStyle=1;" vertex="1" parent="tbl_quiz_attempts">
          <mxGeometry y="30" width="220" height="20" as="geometry" />
        </mxCell>
        <mxCell id="qa_2" value="# user_id: int [FK]" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=8;fontSize=11;fontColor=#000000;fontStyle=1;" vertex="1" parent="tbl_quiz_attempts">
          <mxGeometry y="50" width="220" height="20" as="geometry" />
        </mxCell>
        <mxCell id="qa_3" value="# quiz_id: int [FK]" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=8;fontSize=11;fontColor=#000000;fontStyle=1;" vertex="1" parent="tbl_quiz_attempts">
          <mxGeometry y="70" width="220" height="20" as="geometry" />
        </mxCell>
        <mxCell id="qa_4" value="+ score: float" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=8;fontSize=11;fontColor=#000000;" vertex="1" parent="tbl_quiz_attempts">
          <mxGeometry y="90" width="220" height="20" as="geometry" />
        </mxCell>
        <mxCell id="qa_5" value="+ time_spent: int" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=8;fontSize=11;fontColor=#000000;" vertex="1" parent="tbl_quiz_attempts">
          <mxGeometry y="110" width="220" height="20" as="geometry" />
        </mxCell>
        <mxCell id="qa_6" value="+ completed_at: datetime" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=8;fontSize=11;fontColor=#000000;" vertex="1" parent="tbl_quiz_attempts">
          <mxGeometry y="130" width="220" height="20" as="geometry" />
        </mxCell>

        <!-- Entity 10: user_answers -->
        <mxCell id="tbl_user_answers" value="user_answers" style="swimlane;childLayout=stackLayout;horizontal=1;startSize=30;horizontalStack=0;fillColor=#FFFFFF;strokeColor=#000000;fontColor=#000000;fontStyle=1;fontSize=14;align=center;whiteSpace=wrap;collapsible=0;dropTarget=0;" vertex="1" parent="1">
          <mxGeometry x="650" y="700" width="240" height="160" as="geometry" />
        </mxCell>
        <mxCell id="ua_1" value="+ id: int [PK]" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=8;fontSize=11;fontColor=#000000;fontStyle=1;" vertex="1" parent="tbl_user_answers">
          <mxGeometry y="30" width="240" height="20" as="geometry" />
        </mxCell>
        <mxCell id="ua_2" value="# attempt_id: int [FK]" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=8;fontSize=11;fontColor=#000000;fontStyle=1;" vertex="1" parent="tbl_user_answers">
          <mxGeometry y="50" width="240" height="20" as="geometry" />
        </mxCell>
        <mxCell id="ua_3" value="# question_id: int [FK]" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=8;fontSize=11;fontColor=#000000;fontStyle=1;" vertex="1" parent="tbl_user_answers">
          <mxGeometry y="70" width="240" height="20" as="geometry" />
        </mxCell>
        <mxCell id="ua_4" value="# selected_option_id: int [FK]" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=8;fontSize=11;fontColor=#000000;fontStyle=1;" vertex="1" parent="tbl_user_answers">
          <mxGeometry y="90" width="240" height="20" as="geometry" />
        </mxCell>
        <mxCell id="ua_5" value="+ text_answer: string" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=8;fontSize=11;fontColor=#000000;" vertex="1" parent="tbl_user_answers">
          <mxGeometry y="110" width="240" height="20" as="geometry" />
        </mxCell>
        <mxCell id="ua_6" value="+ is_correct: boolean" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=8;fontSize=11;fontColor=#000000;" vertex="1" parent="tbl_user_answers">
          <mxGeometry y="130" width="240" height="20" as="geometry" />
        </mxCell>

        <!-- Relationships -->
        <!-- users -> documents (1:N) -->
        <mxCell id="rel_1" value="1 : N" style="endArrow=ERmany;html=1;rounded=0;strokeColor=#000000;strokeWidth=1.5;startArrow=ERone;startFill=0;endFill=0;fontColor=#000000;" edge="1" parent="1" source="tbl_users" target="tbl_documents">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- users -> quizzes (1:N) -->
        <mxCell id="rel_2" value="1 : N" style="endArrow=ERmany;html=1;rounded=0;strokeColor=#000000;strokeWidth=1.5;startArrow=ERone;startFill=0;endFill=0;fontColor=#000000;" edge="1" parent="1" source="tbl_users" target="tbl_quizzes">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- users -> quiz_attempts (1:N) -->
        <mxCell id="rel_3" value="1 : N" style="endArrow=ERmany;html=1;rounded=0;strokeColor=#000000;strokeWidth=1.5;startArrow=ERone;startFill=0;endFill=0;fontColor=#000000;" edge="1" parent="1" source="tbl_users" target="tbl_quiz_attempts">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- documents -> quizzes (1:N) -->
        <mxCell id="rel_4" value="1 : N" style="endArrow=ERmany;html=1;rounded=0;strokeColor=#000000;strokeWidth=1.5;startArrow=ERone;startFill=0;endFill=0;fontColor=#000000;" edge="1" parent="1" source="tbl_documents" target="tbl_quizzes">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- documents -> modules (1:N) -->
        <mxCell id="rel_5" value="1 : N" style="endArrow=ERmany;html=1;rounded=0;strokeColor=#000000;strokeWidth=1.5;startArrow=ERone;startFill=0;endFill=0;fontColor=#000000;" edge="1" parent="1" source="tbl_documents" target="tbl_modules">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- modules -> chapters (1:N) -->
        <mxCell id="rel_6" value="1 : N" style="endArrow=ERmany;html=1;rounded=0;strokeColor=#000000;strokeWidth=1.5;startArrow=ERone;startFill=0;endFill=0;fontColor=#000000;" edge="1" parent="1" source="tbl_modules" target="tbl_chapters">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- chapters -> topics (1:N) -->
        <mxCell id="rel_7" value="1 : N" style="endArrow=ERmany;html=1;rounded=0;strokeColor=#000000;strokeWidth=1.5;startArrow=ERone;startFill=0;endFill=0;fontColor=#000000;" edge="1" parent="1" source="tbl_chapters" target="tbl_topics">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- quizzes -> questions (1:N) -->
        <mxCell id="rel_8" value="1 : N" style="endArrow=ERmany;html=1;rounded=0;strokeColor=#000000;strokeWidth=1.5;startArrow=ERone;startFill=0;endFill=0;fontColor=#000000;" edge="1" parent="1" source="tbl_quizzes" target="tbl_questions">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- quizzes -> quiz_attempts (1:N) -->
        <mxCell id="rel_9" value="1 : N" style="endArrow=ERmany;html=1;rounded=0;strokeColor=#000000;strokeWidth=1.5;startArrow=ERone;startFill=0;endFill=0;fontColor=#000000;" edge="1" parent="1" source="tbl_quizzes" target="tbl_quiz_attempts">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- questions -> options (1:N) -->
        <mxCell id="rel_10" value="1 : N" style="endArrow=ERmany;html=1;rounded=0;strokeColor=#000000;strokeWidth=1.5;startArrow=ERone;startFill=0;endFill=0;fontColor=#000000;" edge="1" parent="1" source="tbl_questions" target="tbl_options">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- quiz_attempts -> user_answers (1:N) -->
        <mxCell id="rel_11" value="1 : N" style="endArrow=ERmany;html=1;rounded=0;strokeColor=#000000;strokeWidth=1.5;startArrow=ERone;startFill=0;endFill=0;fontColor=#000000;" edge="1" parent="1" source="tbl_quiz_attempts" target="tbl_user_answers">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- questions -> user_answers (1:N) -->
        <mxCell id="rel_12" value="1 : N" style="endArrow=ERmany;html=1;rounded=0;strokeColor=#000000;strokeWidth=1.5;startArrow=ERone;startFill=0;endFill=0;fontColor=#000000;" edge="1" parent="1" source="tbl_questions" target="tbl_user_answers">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
"""

with open("d:/sem 3 project AI powered quiz generator/erd_diagram.drawio", "w", encoding="utf-8") as f:
    f.write(drawio_xml)

print("Generated erd_diagram.drawio successfully!")
