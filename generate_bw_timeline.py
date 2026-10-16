import matplotlib.pyplot as plt
import matplotlib.patches as patches
import numpy as np

# Set figure size and DPI for crisp draw.io look
fig, ax = plt.subplots(figsize=(12, 6.5), dpi=300)
fig.patch.set_facecolor('#ffffff')
ax.set_facecolor('#ffffff')

# Hide default axes
ax.axis('off')
ax.set_xlim(0, 1100)
ax.set_ylim(0, 600)

# 1. Background Grid (draw.io style subtle grid)
for x in range(0, 1100, 20):
    ax.plot([x, x], [0, 600], color='#f2f4f7', linewidth=0.5, zorder=1)
for y in range(0, 600, 20):
    ax.plot([0, 1100], [y, y], color='#f2f4f7', linewidth=0.5, zorder=1)

# Title Block (draw.io style title)
ax.text(550, 550, "AI Quiz Generator - Project Timeline", 
        fontsize=18, fontweight='bold', color='#000000', ha='center', va='center', fontfamily='sans-serif')
ax.text(550, 525, "June 2026 – September 2026 (Semester 3 Project)", 
        fontsize=11, fontweight='normal', color='#4a5568', ha='center', va='center', fontfamily='sans-serif')

# Chart boundaries / Main Axes
# Left vertical line (Start - Jun 02)
ax.plot([240, 240], [100, 480], color='#000000', linewidth=1.5, zorder=3)
# Right vertical line (End - Sep 22)
ax.plot([1000, 1000], [100, 480], color='#000000', linewidth=1.5, zorder=3)

# Vertical Dashed Grid Lines for bi-weekly dates
date_x_coords = [240, 335, 430, 525, 620, 715, 810, 905, 1000]
date_labels = ["Jun 02", "Jun 16", "Jun 30", "Jul 14", "Jul 28", "Aug 11", "Aug 25", "Sep 08", "Sep 22"]

for x in date_x_coords[1:-1]:
    ax.plot([x, x], [100, 480], color='#718096', linestyle='--', linewidth=1.0, zorder=2)

# Y-Axis Task Labels & Coordinates
tasks = [
    ("1. SRS & Planning", 440, 240, 88.5, "13 days"),
    ("2. DB & Architecture", 380, 335, 88.5, "13 days"),
    ("3. Core Quiz Modules", 320, 430, 183.8, "27 days"),
    ("4. Gemini AI Integration", 260, 620, 136.1, "20 days"),
    ("5. Testing & Fixes", 200, 762.5, 88.5, "13 days"),
    ("6. Report & Viva PPT", 140, 857.5, 136.1, "20 days")
]

for label, y, x_start, width, duration in tasks:
    # Task Label on left
    ax.text(225, y, label, fontsize=11, fontweight='bold', color='#000000', ha='right', va='center', fontfamily='sans-serif')
    
    # Task Box (draw.io standard white box with sharp/rounded border and soft drop shadow or clean border)
    # Light subtle gray border/fill to look authentic draw.io shape
    box = patches.FancyBboxPatch((x_start, y - 16), width, 32,
                                boxstyle="round,pad=0.3,rounding_size=3",
                                facecolor="#f8fafc", edgecolor="#000000", linewidth=1.5, zorder=4)
    ax.add_patch(box)
    
    # Text inside box
    ax.text(x_start + width/2, y, duration, fontsize=10, fontweight='bold', color='#000000', ha='center', va='center', fontfamily='sans-serif', zorder=5)

# X-Axis Ticks & Labels
ax.plot([240, 1000], [100, 100], color='#000000', linewidth=1.5, zorder=3)
for x, label in zip(date_x_coords, date_labels):
    ax.plot([x, x], [95, 100], color='#000000', linewidth=1.5, zorder=3)
    ax.text(x, 75, label, fontsize=10, fontweight='bold', color='#000000', ha='center', va='center', fontfamily='sans-serif')

# Bottom Axis Title
ax.text(620, 40, "Timeline (June 2026 – September 2026)", fontsize=11, fontweight='bold', color='#2d3748', ha='center', va='center', fontfamily='sans-serif')

# Watermark / Subtitle badge indicating draw.io styling
ax.text(1000, 20, "Exported Format: B&W Diagram (draw.io / Dia compatible style)", fontsize=8, color='#718096', ha='right', va='center', fontstyle='italic')

plt.tight_layout()
plt.savefig("project_timeline_bw.png", dpi=300, bbox_inches='tight', facecolor='#ffffff')
plt.close()
print("Saved project_timeline_bw.png successfully.")
