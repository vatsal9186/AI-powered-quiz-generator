import os
import xml.etree.ElementTree as ET

workspace_dir = r"d:\sem 3 project AI powered quiz generator"

# ---------------------------------------------------------
# GENUINE GNOME DIA XML STRUCTURE (<dia:diagram>)
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
    <dia:attribute name="guide">
      <dia:composite type="guide">
        <dia:attribute name="hguides"/>
        <dia:attribute name="vguides"/>
      </dia:composite>
    </dia:attribute>
  </dia:diagramdata>
  <dia:layer name="Background" visible="true" active="true">
"""

tables = [
    {
        "id": "O0",
        "name": "documents",
        "x": 3.0, "y": 3.0, "w": 9.0, "h": 7.0,
        "attrs": [
            ("PK id", "INT", True, False),
            ("FK owner_id", "INT", False, False),
            ("title", "VARCHAR(255)", False, False),
            ("file_name", "VARCHAR(255)", False, False),
            ("content", "TEXT", False, False),
            ("status", "VARCHAR(50)", False, False),
            ("error_message", "TEXT", False, False),
            ("created_at", "DATETIME", False, False),
        ]
    },
    {
        "id": "O1",
        "name": "users",
        "x": 18.0, "y": 3.0, "w": 9.0, "h": 7.0,
        "attrs": [
            ("PK id", "INT", True, False),
            ("UQ email", "VARCHAR(255)", False, True),
            ("hashed_password", "VARCHAR(255)", False, False),
            ("full_name", "VARCHAR(255)", False, False),
            ("UQ google_id", "VARCHAR(255)", False, True),
            ("auth_provider", "VARCHAR(50)", False, False),
            ("role", "VARCHAR(50)", False, False),
            ("status", "VARCHAR(50)", False, False),
        ]
    },
    {
        "id": "O2",
        "name": "modules",
        "x": 33.0, "y": 3.0, "w": 8.0, "h": 4.0,
        "attrs": [
            ("PK id", "INT", True, False),
            ("FK document_id", "INT", False, False),
            ("title", "VARCHAR(255)", False, False),
            ("order", "INT", False, False),
        ]
    },
    {
        "id": "O3",
        "name": "chapters",
        "x": 33.0, "y": 11.0, "w": 8.0, "h": 4.5,
        "attrs": [
            ("PK id", "INT", True, False),
            ("FK document_id", "INT", False, False),
            ("FK module_id", "INT", False, False),
            ("title", "VARCHAR(255)", False, False),
        ]
    },
    {
        "id": "O4",
        "name": "topics",
        "x": 35.0, "y": 27.0, "w": 7.5, "h": 3.5,
        "attrs": [
            ("PK id", "INT", True, False),
            ("FK chapter_id", "INT", False, False),
            ("title", "VARCHAR(255)", False, False),
        ]
    },
    {
        "id": "O5",
        "name": "quizzes",
        "x": 17.0, "y": 18.0, "w": 9.0, "h": 6.5,
        "attrs": [
            ("PK id", "INT", True, False),
            ("FK creator_id", "INT", False, False),
            ("FK document_id", "INT", False, False),
            ("source_type", "VARCHAR(50)", False, False),
            ("difficulty", "VARCHAR(50)", False, False),
            ("status", "VARCHAR(50)", False, False),
            ("created_at", "DATETIME", False, False),
        ]
    },
    {
        "id": "O6",
        "name": "questions",
        "x": 30.0, "y": 18.0, "w": 8.5, "h": 5.5,
        "attrs": [
            ("PK id", "INT", True, False),
            ("FK quiz_id", "INT", False, False),
            ("question_text", "TEXT", False, False),
            ("type", "VARCHAR(50)", False, False),
            ("explanation", "TEXT", False, False),
            ("points", "INT", False, False),
        ]
    },
    {
        "id": "O7",
        "name": "options",
        "x": 29.0, "y": 33.0, "w": 8.0, "h": 4.0,
        "attrs": [
            ("PK id", "INT", True, False),
            ("FK question_id", "INT", False, False),
            ("option_text", "TEXT", False, False),
            ("is_correct", "BOOLEAN", False, False),
        ]
    },
    {
        "id": "O8",
        "name": "quiz_attempts",
        "x": 4.0, "y": 30.0, "w": 8.5, "h": 5.5,
        "attrs": [
            ("PK id", "INT", True, False),
            ("FK user_id", "INT", False, False),
            ("FK quiz_id", "INT", False, False),
            ("score", "FLOAT", False, False),
            ("time_spent", "INT (sec)", False, False),
            ("completed_at", "DATETIME", False, False),
        ]
    },
    {
        "id": "O9",
        "name": "user_answers",
        "x": 17.0, "y": 33.0, "w": 9.5, "h": 5.5,
        "attrs": [
            ("PK id", "INT", True, False),
            ("FK attempt_id", "INT", False, False),
            ("FK question_id", "INT", False, False),
            ("FK selected_option_id", "INT", False, False),
            ("text_answer", "TEXT", False, False),
            ("is_correct", "BOOLEAN", False, False),
        ]
    },
]

for t in tables:
    gnome_dia_xml += f"""    <dia:object type="Database - Table" version="0" id="{t['id']}">
      <dia:attribute name="obj_pos">
        <dia:point val="{t['x']:.2f},{t['y']:.2f}"/>
      </dia:attribute>
      <dia:attribute name="obj_bb">
        <dia:rectangle val="{t['x']-0.05:.2f},{t['y']-0.05:.2f};{t['x']+t['w']+0.05:.2f},{t['y']+t['h']+0.05:.2f}"/>
      </dia:attribute>
      <dia:attribute name="meta">
        <dia:composite type="dict"/>
      </dia:attribute>
      <dia:attribute name="elem_corner">
        <dia:point val="{t['x']:.2f},{t['y']:.2f}"/>
      </dia:attribute>
      <dia:attribute name="elem_width">
        <dia:real val="{t['w']:.2f}"/>
      </dia:attribute>
      <dia:attribute name="elem_height">
        <dia:real val="{t['h']:.2f}"/>
      </dia:attribute>
      <dia:attribute name="text_color">
        <dia:color val="#000000"/>
      </dia:attribute>
      <dia:attribute name="line_color">
        <dia:color val="#000000"/>
      </dia:attribute>
      <dia:attribute name="fill_color">
        <dia:color val="#ffffff"/>
      </dia:attribute>
      <dia:attribute name="line_width">
        <dia:real val="0.1"/>
      </dia:attribute>
      <dia:attribute name="name">
        <dia:string>#{t['name']}#</dia:string>
      </dia:attribute>
      <dia:attribute name="comment">
        <dia:string>##</dia:string>
      </dia:attribute>
      <dia:attribute name="visible_comment">
        <dia:boolean val="false"/>
      </dia:attribute>
      <dia:attribute name="tagging_comment">
        <dia:boolean val="false"/>
      </dia:attribute>
      <dia:attribute name="underline_primary_key">
        <dia:boolean val="true"/>
      </dia:attribute>
      <dia:attribute name="bold_primary_key">
        <dia:boolean val="true"/>
      </dia:attribute>
      <dia:attribute name="attributes">
"""
    for name, dtype, is_pk, is_uq in t['attrs']:
        gnome_dia_xml += f"""        <dia:composite type="table_attribute">
          <dia:attribute name="name">
            <dia:string>#{name}#</dia:string>
          </dia:attribute>
          <dia:attribute name="type">
            <dia:string>#{dtype}#</dia:string>
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

# RELATIONSHIPS (Database - Reference)
relationships = [
    ("R1", "uploaded_by 1:N", "O1", "O0", "1", "N", [(22.5, 3.0), (22.5, 1.5), (7.5, 1.5), (7.5, 3.0)]),
    ("R2", "source_material 1:N", "O0", "O5", "1", "N", [(7.5, 10.0), (7.5, 15.0), (17.0, 15.0), (17.0, 21.0)]),
    ("R3", "generated_by 1:N", "O1", "O5", "1", "N", [(22.5, 10.0), (22.5, 18.0)]),
    ("R4", "1:N", "O0", "O2", "1", "N", [(7.5, 3.0), (7.5, 0.5), (37.0, 0.5), (37.0, 3.0)]),
    ("R5", "1:N", "O2", "O3", "1", "N", [(37.0, 7.0), (37.0, 11.0)]),
    ("R6", "1:N", "O0", "O3", "1", "N", [(12.0, 6.5), (33.0, 13.0)]),
    ("R7", "has 1:N", "O3", "O4", "1", "N", [(37.0, 15.5), (37.0, 24.0), (38.5, 24.0), (38.5, 27.0)]),
    ("R8", "contains 1:N", "O5", "O6", "1", "N", [(26.0, 21.0), (30.0, 21.0)]),
    ("R9", "has 1:N", "O6", "O7", "1", "N", [(34.0, 23.5), (34.0, 33.0)]),
    ("R10", "taken_by 1:N", "O1", "O8", "1", "N", [(18.0, 6.5), (8.25, 6.5), (8.25, 30.0)]),
    ("R11", "records 1:N", "O8", "O9", "1", "N", [(12.5, 33.0), (17.0, 33.0)]),
    ("R12", "answers_for 1:N", "O6", "O9", "1", "N", [(30.0, 21.0), (27.0, 21.0), (27.0, 31.0), (21.5, 31.0), (21.5, 33.0)]),
    ("R13", "chosen_option 1:1", "O7", "O9", "1", "1", [(29.0, 35.0), (26.5, 35.0)]),
]

ref_id = 100
for rid, label, src_id, dst_id, scard, ecard, pts in relationships:
    ref_id += 1
    pts_str = "\n".join([f'        <dia:point val="{px:.2f},{py:.2f}"/>' for px, py in pts])
    start_pt = pts[0]
    end_pt = pts[-1]
    gnome_dia_xml += f"""    <dia:object type="Database - Reference" version="0" id="R{ref_id}">
      <dia:attribute name="obj_pos">
        <dia:point val="{start_pt[0]:.2f},{start_pt[1]:.2f}"/>
      </dia:attribute>
      <dia:attribute name="obj_bb">
        <dia:rectangle val="{min(p[0] for p in pts)-0.1:.2f},{min(p[1] for p in pts)-0.1:.2f};{max(p[0] for p in pts)+0.1:.2f},{max(p[1] for p in pts)+0.1:.2f}"/>
      </dia:attribute>
      <dia:attribute name="meta">
        <dia:composite type="dict"/>
      </dia:attribute>
      <dia:attribute name="line_color">
        <dia:color val="#000000"/>
      </dia:attribute>
      <dia:attribute name="line_width">
        <dia:real val="0.1"/>
      </dia:attribute>
      <dia:attribute name="orth_points">
{pts_str}
      </dia:attribute>
      <dia:attribute name="orth_orient">
        <dia:enum val="1"/>
        <dia:enum val="0"/>
        <dia:enum val="1"/>
      </dia:attribute>
      <dia:attribute name="name">
        <dia:string>#{label}#</dia:string>
      </dia:attribute>
      <dia:attribute name="extra_text">
        <dia:string>#{label}#</dia:string>
      </dia:attribute>
      <dia:attribute name="start_explicit">
        <dia:boolean val="true"/>
      </dia:attribute>
      <dia:attribute name="start_cardinality">
        <dia:string>#{scard}#</dia:string>
      </dia:attribute>
      <dia:attribute name="end_explicit">
        <dia:boolean val="true"/>
      </dia:attribute>
      <dia:attribute name="end_cardinality">
        <dia:string>#{ecard}#</dia:string>
      </dia:attribute>
      <dia:attribute name="cardinality_position">
        <dia:point val="0.00,0.00"/>
      </dia:attribute>
      <dia:connections>
        <dia:connection handle="0" to="{src_id}" connection="8"/>
        <dia:connection handle="1" to="{dst_id}" connection="8"/>
      </dia:connections>
    </dia:object>
"""

# TEXT LABELS FOR CONNECTIONS (Standard - Text)
text_labels = [
    ("uploaded_by 1:N", 15.0, 1.0),
    ("source_material 1:N", 11.5, 14.5),
    ("generated_by 1:N", 23.0, 14.0),
    ("1:N", 22.0, 0.2),
    ("1:N", 37.5, 9.0),
    ("1:N", 22.5, 9.5),
    ("has 1:N", 39.0, 25.5),
    ("contains 1:N", 26.5, 20.5),
    ("has 1:N", 34.5, 28.5),
    ("taken_by 1:N", 7.0, 18.0),
    ("records 1:N", 13.0, 32.5),
    ("answers_for 1:N", 25.0, 29.5),
    ("chosen_option 1:1", 26.8, 34.5),
]

txt_id = 300
for lbl, tx, ty in text_labels:
    txt_id += 1
    gnome_dia_xml += f"""    <dia:object type="Standard - Text" version="1" id="T{txt_id}">
      <dia:attribute name="obj_pos">
        <dia:point val="{tx:.2f},{ty:.2f}"/>
      </dia:attribute>
      <dia:attribute name="obj_bb">
        <dia:rectangle val="{tx-0.05:.2f},{ty-0.6:.2f};{tx+len(lbl)*0.4:.2f},{ty+0.2:.2f}"/>
      </dia:attribute>
      <dia:attribute name="text">
        <dia:composite type="text">
          <dia:attribute name="string">
            <dia:string>#{lbl}#</dia:string>
          </dia:attribute>
          <dia:attribute name="font">
            <dia:font family="sans" style="80" name="Helvetica-Bold"/>
          </dia:attribute>
          <dia:attribute name="height">
            <dia:real val="0.7"/>
          </dia:attribute>
          <dia:attribute name="pos">
            <dia:point val="{tx:.2f},{ty:.2f}"/>
          </dia:attribute>
          <dia:attribute name="color">
            <dia:color val="#000000"/>
          </dia:attribute>
          <dia:attribute name="alignment">
            <dia:enum val="0"/>
          </dia:attribute>
        </dia:composite>
      </dia:attribute>
    </dia:object>
"""

gnome_dia_xml += """  </dia:layer>
</dia:diagram>
"""

# Write Genuine Dia XML directly into erd_diagram.dia and AI_Quiz_Database_ERD.dia
target_files = [
    os.path.join(workspace_dir, "erd_diagram.dia"),
    os.path.join(workspace_dir, "AI_Quiz_Database_ERD.dia"),
]

for p in target_files:
    with open(p, "w", encoding="utf-8") as f:
        f.write(gnome_dia_xml)
    print(f"Written Genuine Dia XML file: {p}")

print("Fixed erd_diagram.dia successfully!")
