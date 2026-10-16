import os
import xml.etree.ElementTree as ET
import gzip

# Workspace path
workspace_dir = r"d:\sem 3 project AI powered quiz generator"

# ---------------------------------------------------------
# 1. DRAW.IO XML GENERATION (Supports .drawio, .dio, .dia)
# ---------------------------------------------------------

drawio_xml = """<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="app.diagrams.net" modified="2026-09-01T09:00:00.000Z" agent="Mozilla/5.0" version="21.0.0" type="device">
  <diagram id="questai-erd-exact" name="QuestAI ERD (Exact Replica)">
    <mxGraphModel dx="1400" dy="900" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1600" pageHeight="1100" math="0" shadow="0">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />

        <!-- 1. documents -->
        <mxCell id="tbl_documents" value="&lt;table style=&quot;width:100%; border-collapse:collapse; font-family:Helvetica, Arial, sans-serif; font-size:12px; color:#000000;&quot;&gt;&lt;tr style=&quot;border-bottom:1.5px solid #000000;&quot;&gt;&lt;td colspan=&quot;2&quot; align=&quot;center&quot; style=&quot;padding:6px; font-weight:bold; font-size:14px;&quot;&gt;documents&lt;/td&gt;&lt;/tr&gt;&lt;tr&gt;&lt;td style=&quot;padding:3px 8px; border-right:1px solid #000000; font-weight:bold; width:55%;&quot;&gt;PK &amp;nbsp; id&lt;/td&gt;&lt;td style=&quot;padding:3px 8px; width:45%;&quot;&gt;INT&lt;/td&gt;&lt;/tr&gt;&lt;tr&gt;&lt;td style=&quot;padding:3px 8px; border-right:1px solid #000000; font-weight:bold;&quot;&gt;FK &amp;nbsp; owner_id&lt;/td&gt;&lt;td style=&quot;padding:3px 8px;&quot;&gt;INT&lt;/td&gt;&lt;/tr&gt;&lt;tr&gt;&lt;td style=&quot;padding:3px 8px; border-right:1px solid #000000;&quot;&gt;title&lt;/td&gt;&lt;td style=&quot;padding:3px 8px;&quot;&gt;VARCHAR(255)&lt;/td&gt;&lt;/tr&gt;&lt;tr&gt;&lt;td style=&quot;padding:3px 8px; border-right:1px solid #000000;&quot;&gt;file_name&lt;/td&gt;&lt;td style=&quot;padding:3px 8px;&quot;&gt;VARCHAR(255)&lt;/td&gt;&lt;/tr&gt;&lt;tr&gt;&lt;td style=&quot;padding:3px 8px; border-right:1px solid #000000;&quot;&gt;content&lt;/td&gt;&lt;td style=&quot;padding:3px 8px;&quot;&gt;TEXT&lt;/td&gt;&lt;/tr&gt;&lt;tr&gt;&lt;td style=&quot;padding:3px 8px; border-right:1px solid #000000;&quot;&gt;status&lt;/td&gt;&lt;td style=&quot;padding:3px 8px;&quot;&gt;VARCHAR(50)&lt;/td&gt;&lt;/tr&gt;&lt;tr&gt;&lt;td style=&quot;padding:3px 8px; border-right:1px solid #000000;&quot;&gt;error_message&lt;/td&gt;&lt;td style=&quot;padding:3px 8px;&quot;&gt;TEXT&lt;/td&gt;&lt;/tr&gt;&lt;tr&gt;&lt;td style=&quot;padding:3px 8px; border-right:1px solid #000000;&quot;&gt;created_at&lt;/td&gt;&lt;td style=&quot;padding:3px 8px;&quot;&gt;DATETIME&lt;/td&gt;&lt;/tr&gt;&lt;/table&gt;" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#000000;strokeWidth=1.5;verticalAlign=top;align=left;spacing=0;" vertex="1" parent="1">
          <mxGeometry x="60" y="40" width="280" height="220" as="geometry" />
        </mxCell>

        <!-- 2. users -->
        <mxCell id="tbl_users" value="&lt;table style=&quot;width:100%; border-collapse:collapse; font-family:Helvetica, Arial, sans-serif; font-size:12px; color:#000000;&quot;&gt;&lt;tr style=&quot;border-bottom:1.5px solid #000000;&quot;&gt;&lt;td colspan=&quot;2&quot; align=&quot;center&quot; style=&quot;padding:6px; font-weight:bold; font-size:14px;&quot;&gt;users&lt;/td&gt;&lt;/tr&gt;&lt;tr&gt;&lt;td style=&quot;padding:3px 8px; border-right:1px solid #000000; font-weight:bold; width:55%;&quot;&gt;PK &amp;nbsp; id&lt;/td&gt;&lt;td style=&quot;padding:3px 8px; width:45%;&quot;&gt;INT&lt;/td&gt;&lt;/tr&gt;&lt;tr&gt;&lt;td style=&quot;padding:3px 8px; border-right:1px solid #000000; font-weight:bold;&quot;&gt;UQ &amp;nbsp; email&lt;/td&gt;&lt;td style=&quot;padding:3px 8px;&quot;&gt;VARCHAR(255)&lt;/td&gt;&lt;/tr&gt;&lt;tr&gt;&lt;td style=&quot;padding:3px 8px; border-right:1px solid #000000;&quot;&gt;hashed_password&lt;/td&gt;&lt;td style=&quot;padding:3px 8px;&quot;&gt;VARCHAR(255)&lt;/td&gt;&lt;/tr&gt;&lt;tr&gt;&lt;td style=&quot;padding:3px 8px; border-right:1px solid #000000;&quot;&gt;full_name&lt;/td&gt;&lt;td style=&quot;padding:3px 8px;&quot;&gt;VARCHAR(255)&lt;/td&gt;&lt;/tr&gt;&lt;tr&gt;&lt;td style=&quot;padding:3px 8px; border-right:1px solid #000000; font-weight:bold;&quot;&gt;UQ &amp;nbsp; google_id&lt;/td&gt;&lt;td style=&quot;padding:3px 8px;&quot;&gt;VARCHAR(255)&lt;/td&gt;&lt;/tr&gt;&lt;tr&gt;&lt;td style=&quot;padding:3px 8px; border-right:1px solid #000000;&quot;&gt;auth_provider&lt;/td&gt;&lt;td style=&quot;padding:3px 8px;&quot;&gt;VARCHAR(50)&lt;/td&gt;&lt;/tr&gt;&lt;tr&gt;&lt;td style=&quot;padding:3px 8px; border-right:1px solid #000000;&quot;&gt;role&lt;/td&gt;&lt;td style=&quot;padding:3px 8px;&quot;&gt;VARCHAR(50)&lt;/td&gt;&lt;/tr&gt;&lt;tr&gt;&lt;td style=&quot;padding:3px 8px; border-right:1px solid #000000;&quot;&gt;status&lt;/td&gt;&lt;td style=&quot;padding:3px 8px;&quot;&gt;VARCHAR(50)&lt;/td&gt;&lt;/tr&gt;&lt;/table&gt;" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#000000;strokeWidth=1.5;verticalAlign=top;align=left;spacing=0;" vertex="1" parent="1">
          <mxGeometry x="450" y="40" width="280" height="220" as="geometry" />
        </mxCell>

        <!-- 3. modules -->
        <mxCell id="tbl_modules" value="&lt;table style=&quot;width:100%; border-collapse:collapse; font-family:Helvetica, Arial, sans-serif; font-size:12px; color:#000000;&quot;&gt;&lt;tr style=&quot;border-bottom:1.5px solid #000000;&quot;&gt;&lt;td colspan=&quot;2&quot; align=&quot;center&quot; style=&quot;padding:6px; font-weight:bold; font-size:14px;&quot;&gt;modules&lt;/td&gt;&lt;/tr&gt;&lt;tr&gt;&lt;td style=&quot;padding:3px 8px; border-right:1px solid #000000; font-weight:bold; width:55%;&quot;&gt;PK &amp;nbsp; id&lt;/td&gt;&lt;td style=&quot;padding:3px 8px; width:45%;&quot;&gt;INT&lt;/td&gt;&lt;/tr&gt;&lt;tr&gt;&lt;td style=&quot;padding:3px 8px; border-right:1px solid #000000; font-weight:bold;&quot;&gt;FK &amp;nbsp; document_id&lt;/td&gt;&lt;td style=&quot;padding:3px 8px;&quot;&gt;INT&lt;/td&gt;&lt;/tr&gt;&lt;tr&gt;&lt;td style=&quot;padding:3px 8px; border-right:1px solid #000000;&quot;&gt;title&lt;/td&gt;&lt;td style=&quot;padding:3px 8px;&quot;&gt;VARCHAR(255)&lt;/td&gt;&lt;/tr&gt;&lt;tr&gt;&lt;td style=&quot;padding:3px 8px; border-right:1px solid #000000;&quot;&gt;order&lt;/td&gt;&lt;td style=&quot;padding:3px 8px;&quot;&gt;INT&lt;/td&gt;&lt;/tr&gt;&lt;/table&gt;" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#000000;strokeWidth=1.5;verticalAlign=top;align=left;spacing=0;" vertex="1" parent="1">
          <mxGeometry x="840" y="40" width="240" height="130" as="geometry" />
        </mxCell>

        <!-- 4. chapters -->
        <mxCell id="tbl_chapters" value="&lt;table style=&quot;width:100%; border-collapse:collapse; font-family:Helvetica, Arial, sans-serif; font-size:12px; color:#000000;&quot;&gt;&lt;tr style=&quot;border-bottom:1.5px solid #000000;&quot;&gt;&lt;td colspan=&quot;2&quot; align=&quot;center&quot; style=&quot;padding:6px; font-weight:bold; font-size:14px;&quot;&gt;chapters&lt;/td&gt;&lt;/tr&gt;&lt;tr&gt;&lt;td style=&quot;padding:3px 8px; border-right:1px solid #000000; font-weight:bold; width:55%;&quot;&gt;PK &amp;nbsp; id&lt;/td&gt;&lt;td style=&quot;padding:3px 8px; width:45%;&quot;&gt;INT&lt;/td&gt;&lt;/tr&gt;&lt;tr&gt;&lt;td style=&quot;padding:3px 8px; border-right:1px solid #000000; font-weight:bold;&quot;&gt;FK &amp;nbsp; document_id&lt;/td&gt;&lt;td style=&quot;padding:3px 8px;&quot;&gt;INT&lt;/td&gt;&lt;/tr&gt;&lt;tr&gt;&lt;td style=&quot;padding:3px 8px; border-right:1px solid #000000; font-weight:bold;&quot;&gt;FK &amp;nbsp; module_id&lt;/td&gt;&lt;td style=&quot;padding:3px 8px;&quot;&gt;INT&lt;/td&gt;&lt;/tr&gt;&lt;tr&gt;&lt;td style=&quot;padding:3px 8px; border-right:1px solid #000000;&quot;&gt;title&lt;/td&gt;&lt;td style=&quot;padding:3px 8px;&quot;&gt;VARCHAR(255)&lt;/td&gt;&lt;/tr&gt;&lt;/table&gt;" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#000000;strokeWidth=1.5;verticalAlign=top;align=left;spacing=0;" vertex="1" parent="1">
          <mxGeometry x="840" y="250" width="240" height="130" as="geometry" />
        </mxCell>

        <!-- 5. quizzes -->
        <mxCell id="tbl_quizzes" value="&lt;table style=&quot;width:100%; border-collapse:collapse; font-family:Helvetica, Arial, sans-serif; font-size:12px; color:#000000;&quot;&gt;&lt;tr style=&quot;border-bottom:1.5px solid #000000;&quot;&gt;&lt;td colspan=&quot;2&quot; align=&quot;center&quot; style=&quot;padding:6px; font-weight:bold; font-size:14px;&quot;&gt;quizzes&lt;/td&gt;&lt;/tr&gt;&lt;tr&gt;&lt;td style=&quot;padding:3px 8px; border-right:1px solid #000000; font-weight:bold; width:55%;&quot;&gt;PK &amp;nbsp; id&lt;/td&gt;&lt;td style=&quot;padding:3px 8px; width:45%;&quot;&gt;INT&lt;/td&gt;&lt;/tr&gt;&lt;tr&gt;&lt;td style=&quot;padding:3px 8px; border-right:1px solid #000000; font-weight:bold;&quot;&gt;FK &amp;nbsp; creator_id&lt;/td&gt;&lt;td style=&quot;padding:3px 8px;&quot;&gt;INT&lt;/td&gt;&lt;/tr&gt;&lt;tr&gt;&lt;td style=&quot;padding:3px 8px; border-right:1px solid #000000; font-weight:bold;&quot;&gt;FK &amp;nbsp; document_id&lt;/td&gt;&lt;td style=&quot;padding:3px 8px;&quot;&gt;INT&lt;/td&gt;&lt;/tr&gt;&lt;tr&gt;&lt;td style=&quot;padding:3px 8px; border-right:1px solid #000000;&quot;&gt;source_type&lt;/td&gt;&lt;td style=&quot;padding:3px 8px;&quot;&gt;VARCHAR(50)&lt;/td&gt;&lt;/tr&gt;&lt;tr&gt;&lt;td style=&quot;padding:3px 8px; border-right:1px solid #000000;&quot;&gt;difficulty&lt;/td&gt;&lt;td style=&quot;padding:3px 8px;&quot;&gt;VARCHAR(50)&lt;/td&gt;&lt;/tr&gt;&lt;tr&gt;&lt;td style=&quot;padding:3px 8px; border-right:1px solid #000000;&quot;&gt;status&lt;/td&gt;&lt;td style=&quot;padding:3px 8px;&quot;&gt;VARCHAR(50)&lt;/td&gt;&lt;/tr&gt;&lt;tr&gt;&lt;td style=&quot;padding:3px 8px; border-right:1px solid #000000;&quot;&gt;created_at&lt;/td&gt;&lt;td style=&quot;padding:3px 8px;&quot;&gt;DATETIME&lt;/td&gt;&lt;/tr&gt;&lt;/table&gt;" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#000000;strokeWidth=1.5;verticalAlign=top;align=left;spacing=0;" vertex="1" parent="1">
          <mxGeometry x="440" y="440" width="260" height="200" as="geometry" />
        </mxCell>

        <!-- 6. questions -->
        <mxCell id="tbl_questions" value="&lt;table style=&quot;width:100%; border-collapse:collapse; font-family:Helvetica, Arial, sans-serif; font-size:12px; color:#000000;&quot;&gt;&lt;tr style=&quot;border-bottom:1.5px solid #000000;&quot;&gt;&lt;td colspan=&quot;2&quot; align=&quot;center&quot; style=&quot;padding:6px; font-weight:bold; font-size:14px;&quot;&gt;questions&lt;/td&gt;&lt;/tr&gt;&lt;tr&gt;&lt;td style=&quot;padding:3px 8px; border-right:1px solid #000000; font-weight:bold; width:55%;&quot;&gt;PK &amp;nbsp; id&lt;/td&gt;&lt;td style=&quot;padding:3px 8px; width:45%;&quot;&gt;INT&lt;/td&gt;&lt;/tr&gt;&lt;tr&gt;&lt;td style=&quot;padding:3px 8px; border-right:1px solid #000000; font-weight:bold;&quot;&gt;FK &amp;nbsp; quiz_id&lt;/td&gt;&lt;td style=&quot;padding:3px 8px;&quot;&gt;INT&lt;/td&gt;&lt;/tr&gt;&lt;tr&gt;&lt;td style=&quot;padding:3px 8px; border-right:1px solid #000000;&quot;&gt;question_text&lt;/td&gt;&lt;td style=&quot;padding:3px 8px;&quot;&gt;TEXT&lt;/td&gt;&lt;/tr&gt;&lt;tr&gt;&lt;td style=&quot;padding:3px 8px; border-right:1px solid #000000;&quot;&gt;type&lt;/td&gt;&lt;td style=&quot;padding:3px 8px;&quot;&gt;VARCHAR(50)&lt;/td&gt;&lt;/tr&gt;&lt;tr&gt;&lt;td style=&quot;padding:3px 8px; border-right:1px solid #000000;&quot;&gt;explanation&lt;/td&gt;&lt;td style=&quot;padding:3px 8px;&quot;&gt;TEXT&lt;/td&gt;&lt;/tr&gt;&lt;tr&gt;&lt;td style=&quot;padding:3px 8px; border-right:1px solid #000000;&quot;&gt;points&lt;/td&gt;&lt;td style=&quot;padding:3px 8px;&quot;&gt;INT&lt;/td&gt;&lt;/tr&gt;&lt;/table&gt;" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#000000;strokeWidth=1.5;verticalAlign=top;align=left;spacing=0;" vertex="1" parent="1">
          <mxGeometry x="750" y="440" width="240" height="175" as="geometry" />
        </mxCell>

        <!-- 7. topics -->
        <mxCell id="tbl_topics" value="&lt;table style=&quot;width:100%; border-collapse:collapse; font-family:Helvetica, Arial, sans-serif; font-size:12px; color:#000000;&quot;&gt;&lt;tr style=&quot;border-bottom:1.5px solid #000000;&quot;&gt;&lt;td colspan=&quot;2&quot; align=&quot;center&quot; style=&quot;padding:6px; font-weight:bold; font-size:14px;&quot;&gt;topics&lt;/td&gt;&lt;/tr&gt;&lt;tr&gt;&lt;td style=&quot;padding:3px 8px; border-right:1px solid #000000; font-weight:bold; width:55%;&quot;&gt;PK &amp;nbsp; id&lt;/td&gt;&lt;td style=&quot;padding:3px 8px; width:45%;&quot;&gt;INT&lt;/td&gt;&lt;/tr&gt;&lt;tr&gt;&lt;td style=&quot;padding:3px 8px; border-right:1px solid #000000; font-weight:bold;&quot;&gt;FK &amp;nbsp; chapter_id&lt;/td&gt;&lt;td style=&quot;padding:3px 8px;&quot;&gt;INT&lt;/td&gt;&lt;/tr&gt;&lt;tr&gt;&lt;td style=&quot;padding:3px 8px; border-right:1px solid #000000;&quot;&gt;title&lt;/td&gt;&lt;td style=&quot;padding:3px 8px;&quot;&gt;VARCHAR(255)&lt;/td&gt;&lt;/tr&gt;&lt;/table&gt;" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#000000;strokeWidth=1.5;verticalAlign=top;align=left;spacing=0;" vertex="1" parent="1">
          <mxGeometry x="870" y="640" width="220" height="110" as="geometry" />
        </mxCell>

        <!-- 8. options -->
        <mxCell id="tbl_options" value="&lt;table style=&quot;width:100%; border-collapse:collapse; font-family:Helvetica, Arial, sans-serif; font-size:12px; color:#000000;&quot;&gt;&lt;tr style=&quot;border-bottom:1.5px solid #000000;&quot;&gt;&lt;td colspan=&quot;2&quot; align=&quot;center&quot; style=&quot;padding:6px; font-weight:bold; font-size:14px;&quot;&gt;options&lt;/td&gt;&lt;/tr&gt;&lt;tr&gt;&lt;td style=&quot;padding:3px 8px; border-right:1px solid #000000; font-weight:bold; width:55%;&quot;&gt;PK &amp;nbsp; id&lt;/td&gt;&lt;td style=&quot;padding:3px 8px; width:45%;&quot;&gt;INT&lt;/td&gt;&lt;/tr&gt;&lt;tr&gt;&lt;td style=&quot;padding:3px 8px; border-right:1px solid #000000; font-weight:bold;&quot;&gt;FK &amp;nbsp; question_id&lt;/td&gt;&lt;td style=&quot;padding:3px 8px;&quot;&gt;INT&lt;/td&gt;&lt;/tr&gt;&lt;tr&gt;&lt;td style=&quot;padding:3px 8px; border-right:1px solid #000000;&quot;&gt;option_text&lt;/td&gt;&lt;td style=&quot;padding:3px 8px;&quot;&gt;TEXT&lt;/td&gt;&lt;/tr&gt;&lt;tr&gt;&lt;td style=&quot;padding:3px 8px; border-right:1px solid #000000;&quot;&gt;is_correct&lt;/td&gt;&lt;td style=&quot;padding:3px 8px;&quot;&gt;BOOLEAN&lt;/td&gt;&lt;/tr&gt;&lt;/table&gt;" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#000000;strokeWidth=1.5;verticalAlign=top;align=left;spacing=0;" vertex="1" parent="1">
          <mxGeometry x="730" y="770" width="220" height="130" as="geometry" />
        </mxCell>

        <!-- 9. quiz_attempts -->
        <mxCell id="tbl_quiz_attempts" value="&lt;table style=&quot;width:100%; border-collapse:collapse; font-family:Helvetica, Arial, sans-serif; font-size:12px; color:#000000;&quot;&gt;&lt;tr style=&quot;border-bottom:1.5px solid #000000;&quot;&gt;&lt;td colspan=&quot;2&quot; align=&quot;center&quot; style=&quot;padding:6px; font-weight:bold; font-size:14px;&quot;&gt;quiz_attempts&lt;/td&gt;&lt;/tr&gt;&lt;tr&gt;&lt;td style=&quot;padding:3px 8px; border-right:1px solid #000000; font-weight:bold; width:55%;&quot;&gt;PK &amp;nbsp; id&lt;/td&gt;&lt;td style=&quot;padding:3px 8px; width:45%;&quot;&gt;INT&lt;/td&gt;&lt;/tr&gt;&lt;tr&gt;&lt;td style=&quot;padding:3px 8px; border-right:1px solid #000000; font-weight:bold;&quot;&gt;FK &amp;nbsp; user_id&lt;/td&gt;&lt;td style=&quot;padding:3px 8px;&quot;&gt;INT&lt;/td&gt;&lt;/tr&gt;&lt;tr&gt;&lt;td style=&quot;padding:3px 8px; border-right:1px solid #000000; font-weight:bold;&quot;&gt;FK &amp;nbsp; quiz_id&lt;/td&gt;&lt;td style=&quot;padding:3px 8px;&quot;&gt;INT&lt;/td&gt;&lt;/tr&gt;&lt;tr&gt;&lt;td style=&quot;padding:3px 8px; border-right:1px solid #000000;&quot;&gt;score&lt;/td&gt;&lt;td style=&quot;padding:3px 8px;&quot;&gt;FLOAT&lt;/td&gt;&lt;/tr&gt;&lt;tr&gt;&lt;td style=&quot;padding:3px 8px; border-right:1px solid #000000;&quot;&gt;time_spent&lt;/td&gt;&lt;td style=&quot;padding:3px 8px;&quot;&gt;INT (sec)&lt;/td&gt;&lt;/tr&gt;&lt;tr&gt;&lt;td style=&quot;padding:3px 8px; border-right:1px solid #000000;&quot;&gt;completed_at&lt;/td&gt;&lt;td style=&quot;padding:3px 8px;&quot;&gt;DATETIME&lt;/td&gt;&lt;/tr&gt;&lt;/table&gt;" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#000000;strokeWidth=1.5;verticalAlign=top;align=left;spacing=0;" vertex="1" parent="1">
          <mxGeometry x="100" y="720" width="240" height="175" as="geometry" />
        </mxCell>

        <!-- 10. user_answers -->
        <mxCell id="tbl_user_answers" value="&lt;table style=&quot;width:100%; border-collapse:collapse; font-family:Helvetica, Arial, sans-serif; font-size:12px; color:#000000;&quot;&gt;&lt;tr style=&quot;border-bottom:1.5px solid #000000;&quot;&gt;&lt;td colspan=&quot;2&quot; align=&quot;center&quot; style=&quot;padding:6px; font-weight:bold; font-size:14px;&quot;&gt;user_answers&lt;/td&gt;&lt;/tr&gt;&lt;tr&gt;&lt;td style=&quot;padding:3px 8px; border-right:1px solid #000000; font-weight:bold; width:55%;&quot;&gt;PK &amp;nbsp; id&lt;/td&gt;&lt;td style=&quot;padding:3px 8px; width:45%;&quot;&gt;INT&lt;/td&gt;&lt;/tr&gt;&lt;tr&gt;&lt;td style=&quot;padding:3px 8px; border-right:1px solid #000000; font-weight:bold;&quot;&gt;FK &amp;nbsp; attempt_id&lt;/td&gt;&lt;td style=&quot;padding:3px 8px;&quot;&gt;INT&lt;/td&gt;&lt;/tr&gt;&lt;tr&gt;&lt;td style=&quot;padding:3px 8px; border-right:1px solid #000000; font-weight:bold;&quot;&gt;FK &amp;nbsp; question_id&lt;/td&gt;&lt;td style=&quot;padding:3px 8px;&quot;&gt;INT&lt;/td&gt;&lt;/tr&gt;&lt;tr&gt;&lt;td style=&quot;padding:3px 8px; border-right:1px solid #000000; font-weight:bold;&quot;&gt;FK &amp;nbsp; selected_option_id&lt;/td&gt;&lt;td style=&quot;padding:3px 8px;&quot;&gt;INT&lt;/td&gt;&lt;/tr&gt;&lt;tr&gt;&lt;td style=&quot;padding:3px 8px; border-right:1px solid #000000;&quot;&gt;text_answer&lt;/td&gt;&lt;td style=&quot;padding:3px 8px;&quot;&gt;TEXT&lt;/td&gt;&lt;/tr&gt;&lt;tr&gt;&lt;td style=&quot;padding:3px 8px; border-right:1px solid #000000;&quot;&gt;is_correct&lt;/td&gt;&lt;td style=&quot;padding:3px 8px;&quot;&gt;BOOLEAN&lt;/td&gt;&lt;/tr&gt;&lt;/table&gt;" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#000000;strokeWidth=1.5;verticalAlign=top;align=left;spacing=0;" vertex="1" parent="1">
          <mxGeometry x="450" y="780" width="240" height="175" as="geometry" />
        </mxCell>


        <!-- RELATIONSHIPS -->

        <!-- 1. users -> documents (uploaded_by 1:N) -->
        <mxCell id="rel_users_documents" value="uploaded_by 1:N" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#000000;strokeWidth=1.5;startArrow=ERmandOne;startFill=0;endArrow=ERmany;endFill=0;fontColor=#000000;fontSize=12;fontStyle=1;labelBackgroundColor=#FFFFFF;" edge="1" parent="1" source="tbl_users" target="tbl_documents">
          <mxGeometry relative="1" as="geometry">
            <Array as="points">
              <mxPoint x="450" y="80" />
              <mxPoint x="340" y="80" />
            </Array>
          </mxGeometry>
        </mxCell>

        <!-- 2. documents -> quizzes (source_material 1:N) -->
        <mxCell id="rel_documents_quizzes" value="source_material 1:N" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#000000;strokeWidth=1.5;startArrow=ERmandOne;startFill=0;endArrow=ERmany;endFill=0;fontColor=#000000;fontSize=12;fontStyle=1;labelBackgroundColor=#FFFFFF;" edge="1" parent="1" source="tbl_documents" target="tbl_quizzes">
          <mxGeometry relative="1" as="geometry">
            <Array as="points">
              <mxPoint x="340" y="200" />
              <mxPoint x="380" y="200" />
              <mxPoint x="380" y="520" />
              <mxPoint x="440" y="520" />
            </Array>
          </mxGeometry>
        </mxCell>

        <!-- 3. users -> quizzes (generated_by 1:N) -->
        <mxCell id="rel_users_quizzes" value="generated_by 1:N" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#000000;strokeWidth=1.5;startArrow=ERmandOne;startFill=0;endArrow=ERmany;endFill=0;fontColor=#000000;fontSize=12;fontStyle=1;labelBackgroundColor=#FFFFFF;" edge="1" parent="1" source="tbl_users" target="tbl_quizzes">
          <mxGeometry relative="1" as="geometry">
            <Array as="points">
              <mxPoint x="570" y="260" />
              <mxPoint x="570" y="440" />
            </Array>
          </mxGeometry>
        </mxCell>

        <!-- 4. documents -> modules (1:N across top) -->
        <mxCell id="rel_documents_modules" value="1:N" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#000000;strokeWidth=1.5;startArrow=ERmandOne;startFill=0;endArrow=ERmany;endFill=0;fontColor=#000000;fontSize=12;fontStyle=1;labelBackgroundColor=#FFFFFF;" edge="1" parent="1" source="tbl_documents" target="tbl_modules">
          <mxGeometry relative="1" as="geometry">
            <Array as="points">
              <mxPoint x="200" y="40" />
              <mxPoint x="200" y="15" />
              <mxPoint x="960" y="15" />
              <mxPoint x="960" y="40" />
            </Array>
          </mxGeometry>
        </mxCell>

        <!-- 5. modules -> chapters (1:N) -->
        <mxCell id="rel_modules_chapters" value="1:N" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#000000;strokeWidth=1.5;startArrow=ERmandOne;startFill=0;endArrow=ERmany;endFill=0;fontColor=#000000;fontSize=12;fontStyle=1;labelBackgroundColor=#FFFFFF;" edge="1" parent="1" source="tbl_modules" target="tbl_chapters">
          <mxGeometry relative="1" as="geometry">
            <Array as="points">
              <mxPoint x="840" y="100" />
              <mxPoint x="810" y="100" />
              <mxPoint x="810" y="315" />
              <mxPoint x="840" y="315" />
            </Array>
          </mxGeometry>
        </mxCell>

        <!-- 6. chapters -> topics (1:N) -->
        <mxCell id="rel_chapters_topics" value="1:N" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#000000;strokeWidth=1.5;startArrow=ERmandOne;startFill=0;endArrow=ERmany;endFill=0;fontColor=#000000;fontSize=12;fontStyle=1;labelBackgroundColor=#FFFFFF;" edge="1" parent="1" source="tbl_chapters" target="tbl_topics">
          <mxGeometry relative="1" as="geometry">
            <Array as="points">
              <mxPoint x="1080" y="315" />
              <mxPoint x="1120" y="315" />
              <mxPoint x="1120" y="695" />
              <mxPoint x="1090" y="695" />
            </Array>
          </mxGeometry>
        </mxCell>

        <!-- 7. quizzes -> questions (contains 1:N) -->
        <mxCell id="rel_quizzes_questions" value="contains 1:N" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#000000;strokeWidth=1.5;startArrow=ERmandOne;startFill=0;endArrow=ERmany;endFill=0;fontColor=#000000;fontSize=12;fontStyle=1;labelBackgroundColor=#FFFFFF;" edge="1" parent="1" source="tbl_quizzes" target="tbl_questions">
          <mxGeometry relative="1" as="geometry">
            <Array as="points">
              <mxPoint x="700" y="525" />
              <mxPoint x="750" y="525" />
            </Array>
          </mxGeometry>
        </mxCell>

        <!-- 8. quizzes -> quiz_attempts (taken_by 1:N) -->
        <mxCell id="rel_quizzes_attempts" value="taken_by 1:N" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#000000;strokeWidth=1.5;startArrow=ERmandOne;startFill=0;endArrow=ERmany;endFill=0;fontColor=#000000;fontSize=12;fontStyle=1;labelBackgroundColor=#FFFFFF;" edge="1" parent="1" source="tbl_quizzes" target="tbl_quiz_attempts">
          <mxGeometry relative="1" as="geometry">
            <Array as="points">
              <mxPoint x="440" y="550" />
              <mxPoint x="360" y="550" />
              <mxPoint x="360" y="780" />
              <mxPoint x="340" y="780" />
            </Array>
          </mxGeometry>
        </mxCell>

        <!-- 9. questions -> options (has 1:N) -->
        <mxCell id="rel_questions_options" value="has 1:N" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#000000;strokeWidth=1.5;startArrow=ERmandOne;startFill=0;endArrow=ERmany;endFill=0;fontColor=#000000;fontSize=12;fontStyle=1;labelBackgroundColor=#FFFFFF;" edge="1" parent="1" source="tbl_questions" target="tbl_options">
          <mxGeometry relative="1" as="geometry">
            <Array as="points">
              <mxPoint x="830" y="615" />
              <mxPoint x="830" y="770" />
            </Array>
          </mxGeometry>
        </mxCell>

        <!-- 10. questions -> user_answers (answers_for 1:N) -->
        <mxCell id="rel_questions_user_answers" value="answers_for 1:N" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#000000;strokeWidth=1.5;startArrow=ERmandOne;startFill=0;endArrow=ERmany;endFill=0;fontColor=#000000;fontSize=12;fontStyle=1;labelBackgroundColor=#FFFFFF;" edge="1" parent="1" source="tbl_questions" target="tbl_user_answers">
          <mxGeometry relative="1" as="geometry">
            <Array as="points">
              <mxPoint x="750" y="580" />
              <mxPoint x="710" y="580" />
              <mxPoint x="710" y="740" />
              <mxPoint x="630" y="740" />
              <mxPoint x="630" y="780" />
            </Array>
          </mxGeometry>
        </mxCell>

        <!-- 11. quiz_attempts -> user_answers (records 1:N) -->
        <mxCell id="rel_attempts_user_answers" value="records 1:N" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#000000;strokeWidth=1.5;startArrow=ERmandOne;startFill=0;endArrow=ERmany;endFill=0;fontColor=#000000;fontSize=12;fontStyle=1;labelBackgroundColor=#FFFFFF;" edge="1" parent="1" source="tbl_quiz_attempts" target="tbl_user_answers">
          <mxGeometry relative="1" as="geometry">
            <Array as="points">
              <mxPoint x="340" y="840" />
              <mxPoint x="450" y="840" />
            </Array>
          </mxGeometry>
        </mxCell>

        <!-- 12. options -> user_answers (chosen_option 1:1) -->
        <mxCell id="rel_options_user_answers" value="chosen_option 1:1" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#000000;strokeWidth=1.5;startArrow=ERmandOne;startFill=0;endArrow=ERmandOne;endFill=0;fontColor=#000000;fontSize=12;fontStyle=1;labelBackgroundColor=#FFFFFF;" edge="1" parent="1" source="tbl_options" target="tbl_user_answers">
          <mxGeometry relative="1" as="geometry">
            <Array as="points">
              <mxPoint x="730" y="870" />
              <mxPoint x="690" y="870" />
            </Array>
          </mxGeometry>
        </mxCell>

      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
"""

# Save drawio files
file_paths = [
    os.path.join(workspace_dir, "erd_diagram.dia"),
    os.path.join(workspace_dir, "erd_diagram.drawio"),
    os.path.join(workspace_dir, "erd_diagram.dio")
]

for p in file_paths:
    with open(p, "w", encoding="utf-8") as f:
        f.write(drawio_xml)
    print(f"Created Draw.io format: {p}")

# ---------------------------------------------------------
# 2. GNOME DIA NATIVE XML GENERATION (for GNOME Dia Editor)
# ---------------------------------------------------------
gnome_dia_xml = """<?xml version="1.0" encoding="UTF-8"?>
<dia:diagram xmlns:dia="http://www.gnome.org/critney/dia/">
  <dia:diagramdata>
    <dia:attribute name="background">
      <dia:color val="#ffffff"/>
    </dia:attribute>
    <dia:attribute name="pagebreak">
      <dia:color val="#000000"/>
    </dia:attribute>
    <dia:attribute name="paper">
      <dia:composite type="paper">
        <dia:attribute name="name">
          <dia:string>#A4#</dia:string>
        </dia:attribute>
        <dia:attribute name="tmargin">
          <dia:real val="1"/>
        </dia:attribute>
        <dia:attribute name="bmargin">
          <dia:real val="1"/>
        </dia:attribute>
        <dia:attribute name="lmargin">
          <dia:real val="1"/>
        </dia:attribute>
        <dia:attribute name="rmargin">
          <dia:real val="1"/>
        </dia:attribute>
        <dia:attribute name="is_portrait">
          <dia:boolean val="false"/>
        </dia:attribute>
        <dia:attribute name="scaling">
          <dia:real val="1"/>
        </dia:attribute>
        <dia:attribute name="fitto">
          <dia:boolean val="false"/>
        </dia:attribute>
      </dia:composite>
    </dia:attribute>
    <dia:attribute name="grid">
      <dia:composite type="grid">
        <dia:attribute name="width_x">
          <dia:real val="1"/>
        </dia:attribute>
        <dia:attribute name="width_y">
          <dia:real val="1"/>
        </dia:attribute>
        <dia:attribute name="visible_x">
          <dia:int val="1"/>
        </dia:attribute>
        <dia:attribute name="visible_y">
          <dia:int val="1"/>
        </dia:attribute>
      </dia:composite>
    </dia:attribute>
  </dia:diagramdata>
  <dia:layer name="Background" visible="true" active="true">
"""

tables_data = [
    ("documents", 2.0, 2.0, [
        ("id", "INT", True, False, False),
        ("owner_id", "INT", False, True, False),
        ("title", "VARCHAR(255)", False, False, False),
        ("file_name", "VARCHAR(255)", False, False, False),
        ("content", "TEXT", False, False, False),
        ("status", "VARCHAR(50)", False, False, False),
        ("error_message", "TEXT", False, False, False),
        ("created_at", "DATETIME", False, False, False),
    ]),
    ("users", 14.0, 2.0, [
        ("id", "INT", True, False, False),
        ("email", "VARCHAR(255)", False, False, True),
        ("hashed_password", "VARCHAR(255)", False, False, False),
        ("full_name", "VARCHAR(255)", False, False, False),
        ("google_id", "VARCHAR(255)", False, False, True),
        ("auth_provider", "VARCHAR(50)", False, False, False),
        ("role", "VARCHAR(50)", False, False, False),
        ("status", "VARCHAR(50)", False, False, False),
    ]),
    ("modules", 26.0, 2.0, [
        ("id", "INT", True, False, False),
        ("document_id", "INT", False, True, False),
        ("title", "VARCHAR(255)", False, False, False),
        ("order", "INT", False, False, False),
    ]),
    ("chapters", 26.0, 9.0, [
        ("id", "INT", True, False, False),
        ("document_id", "INT", False, True, False),
        ("module_id", "INT", False, True, False),
        ("title", "VARCHAR(255)", False, False, False),
    ]),
    ("quizzes", 14.0, 14.0, [
        ("id", "INT", True, False, False),
        ("creator_id", "INT", False, True, False),
        ("document_id", "INT", False, True, False),
        ("source_type", "VARCHAR(50)", False, False, False),
        ("difficulty", "VARCHAR(50)", False, False, False),
        ("status", "VARCHAR(50)", False, False, False),
        ("created_at", "DATETIME", False, False, False),
    ]),
    ("questions", 24.0, 14.0, [
        ("id", "INT", True, False, False),
        ("quiz_id", "INT", False, True, False),
        ("question_text", "TEXT", False, False, False),
        ("type", "VARCHAR(50)", False, False, False),
        ("explanation", "TEXT", False, False, False),
        ("points", "INT", False, False, False),
    ]),
    ("topics", 28.0, 20.0, [
        ("id", "INT", True, False, False),
        ("chapter_id", "INT", False, True, False),
        ("title", "VARCHAR(255)", False, False, False),
    ]),
    ("options", 24.0, 24.0, [
        ("id", "INT", True, False, False),
        ("question_id", "INT", False, True, False),
        ("option_text", "TEXT", False, False, False),
        ("is_correct", "BOOLEAN", False, False, False),
    ]),
    ("quiz_attempts", 3.0, 22.0, [
        ("id", "INT", True, False, False),
        ("user_id", "INT", False, True, False),
        ("quiz_id", "INT", False, True, False),
        ("score", "FLOAT", False, False, False),
        ("time_spent", "INT (sec)", False, False, False),
        ("completed_at", "DATETIME", False, False, False),
    ]),
    ("user_answers", 14.0, 24.0, [
        ("id", "INT", True, False, False),
        ("attempt_id", "INT", False, True, False),
        ("question_id", "INT", False, True, False),
        ("selected_option_id", "INT", False, True, False),
        ("text_answer", "TEXT", False, False, False),
        ("is_correct", "BOOLEAN", False, False, False),
    ]),
]

obj_id = 0
for name, x, y, attrs in tables_data:
    obj_id += 1
    gnome_dia_xml += f"""    <dia:object type="Database - Table" version="0" id="O{obj_id}">
      <dia:attribute name="obj_pos">
        <dia:point val="{x},{y}"/>
      </dia:attribute>
      <dia:attribute name="obj_bb">
        <dia:rectangle val="{x},{y};{x+7},{y+len(attrs)*0.8+2}"/>
      </dia:attribute>
      <dia:attribute name="name">
        <dia:string>#{name}#</dia:string>
      </dia:attribute>
      <dia:attribute name="attributes">
"""
    for attr_name, attr_type, is_pk, is_fk, is_uq in attrs:
        gnome_dia_xml += f"""        <dia:composite type="table_attribute">
          <dia:attribute name="name">
            <dia:string>#{attr_name}#</dia:string>
          </dia:attribute>
          <dia:attribute name="type">
            <dia:string>#{attr_type}#</dia:string>
          </dia:attribute>
          <dia:attribute name="comment">
            <dia:string>##</dia:string>
          </dia:attribute>
          <dia:attribute name="primary_key">
            <dia:boolean val="{'true' if is_pk else 'false'}"/>
          </dia:attribute>
          <dia:attribute name="nullable">
            <dia:boolean val="false"/>
          </dia:attribute>
          <dia:attribute name="unique">
            <dia:boolean val="{'true' if is_uq else 'false'}"/>
          </dia:attribute>
        </dia:composite>
"""
    gnome_dia_xml += """      </dia:attribute>
    </dia:object>
"""

gnome_dia_xml += """  </dia:layer>
</dia:diagram>
"""

gnome_path = os.path.join(workspace_dir, "erd_diagram_gnome.dia")
with open(gnome_path, "w", encoding="utf-8") as f:
    f.write(gnome_dia_xml)
print(f"Created GNOME Dia format: {gnome_path}")

print("All diagram files generated successfully!")

