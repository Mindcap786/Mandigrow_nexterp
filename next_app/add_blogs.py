import os
import re

# Read posts.ts
with open('app/blog/posts.ts', 'r') as f:
    content = f.read()

artifacts_dir = '/Users/shauddin/.gemini/antigravity/brain/7a90a851-c3cb-4a95-90a3-1e686ab4c1a8'

blog_files = [
    'blog_1_fruit_mandi.md',
    'blog_2_sabzi_mandi.md',
    'blog_3_anaj_mandi.md',
    'blog_4_digital_khata.md',
    'artifacts/blog_5_crate_management.md'
]

new_posts_code = []

def md_to_html(text):
    lines = text.split('\n')
    html_lines = []
    in_list = False
    in_table = False
    for line in lines:
        line = line.strip()
        if not line:
            if in_list:
                html_lines.append("</ul>")
                in_list = False
            if in_table:
                html_lines.append("</table>")
                in_table = False
            continue
        
        # Bold
        line = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', line)
        line = re.sub(r'\*(.*?)\*', r'<em>\1</em>', line)
        
        if line.startswith('### '):
            html_lines.append(f"<h3>{line[4:]}</h3>")
        elif line.startswith('## '):
            html_lines.append(f"<h2>{line[3:]}</h2>")
        elif line.startswith('# '):
            html_lines.append(f"<h1>{line[2:]}</h1>")
        elif line.startswith('* ') or re.match(r'^\d+\.\s', line):
            if not in_list:
                html_lines.append("<ul>")
                in_list = True
            content = re.sub(r'^\d+\.\s|\*\s', '', line)
            html_lines.append(f"  <li>{content}</li>")
        elif line.startswith('|'):
            if not in_table:
                html_lines.append("<table>")
                in_table = True
            cells = [c.strip() for c in line.strip('|').split('|')]
            if '---' not in line:
                html_lines.append("  <tr>" + "".join([f"<td>{c}</td>" for c in cells]) + "</tr>")
        else:
            if in_list:
                html_lines.append("</ul>")
                in_list = False
            html_lines.append(f"<p>{line}</p>")
            
    if in_list:
        html_lines.append("</ul>")
    if in_table:
        html_lines.append("</table>")
        
    return "\n".join(html_lines)


for bf in blog_files:
    path = os.path.join(artifacts_dir, bf)
    if not os.path.exists(path):
        continue
    
    with open(path, 'r') as f:
        md = f.read()
    
    fm_match = re.search(r'^---\n(.*?)\n---\n(.*)', md, re.DOTALL)
    if not fm_match:
        continue
        
    fm = fm_match.group(1)
    body = fm_match.group(2).strip()
    
    title_match = re.search(r'title:\s*"(.*?)"', fm)
    desc_match = re.search(r'meta_description:\s*"(.*?)"', fm)
    slug_match = re.search(r'slug:\s*"(.*?)"', fm)
    keyword_match = re.search(r'focus_keyword:\s*"(.*?)"', fm)
    
    if not all([title_match, desc_match, slug_match, keyword_match]):
        continue
        
    title = title_match.group(1)
    desc = desc_match.group(1)
    slug = slug_match.group(1)
    keyword = keyword_match.group(1)
    
    if f"slug: '{slug}'" in content or f'slug: "{slug}"' in content:
        print(f"Skipping {slug}, already exists")
        continue
        
    html_body = md_to_html(body)
    
    post_code = f"""
    {{
        slug: '{slug}',
        title: '{title.replace("'", "\\'")}',
        description: '{desc.replace("'", "\\'")}',
        keywords: [
            '{keyword}',
            'mandi software',
            '{keyword} india'
        ],
        publishedAt: '2026-05-24',
        author: 'MandiGrow Team',
        readMinutes: 6,
        body: `
{html_body}
`
    }},"""
    new_posts_code.append(post_code)

if new_posts_code:
    # Insert before the last ];
    insert_pos = content.rfind('];')
    if insert_pos != -1:
        new_content = content[:insert_pos] + "\n".join(new_posts_code) + "\n" + content[insert_pos:]
        with open('app/blog/posts.ts', 'w') as f:
            f.write(new_content)
        print("Updated posts.ts")
else:
    print("No new posts to add")

