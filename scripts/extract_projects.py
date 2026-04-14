#!/usr/bin/env python3
"""Extract project data from career_sheet_converted_retry.md and generate JSON"""

import re
import json
from pathlib import Path


def extract_projects_from_md(md_file):
    """Extract project data from Markdown file"""
    with open(md_file, 'r', encoding='utf-8') as f:
        content = f.read()

    projects = []

    # Find all project sections (### NUMBER. PROJECT_NAME)
    project_pattern = r'### (\d+)\. (.+?)\n\n- 原票番号: (\d+)'
    matches = re.finditer(project_pattern, content)

    for match in matches:
        section_num = int(match.group(1))
        project_name = match.group(2).strip()
        project_id = int(match.group(3))

        # Extract from this project start to next project or end
        start_pos = match.start()
        next_project = re.search(r'\n### \d+\. ', content[start_pos + 1:])
        end_pos = start_pos + next_project.start() if next_project else len(content)
        project_section = content[start_pos:end_pos]

        # Extract fields
        period_match = re.search(
            r'- 期間: (\d{4}/\d{2}) - (\d{4}/\d{2})', project_section)
        role_match = re.search(r'- 役割: (.+)', project_section)
        team_match = re.search(r'- チーム: (\d+)名', project_section)
        dev_match = re.search(r'- 開発: (\d+)名', project_section)
        lang_match = re.search(r'- 使用言語: (.+)', project_section)
        db_match = re.search(r'- DB: (.+)', project_section)
        os_match = re.search(r'- サーバOS: (.+)', project_section)
        fw_match = re.search(r'- FW・MW・ツール等: (.+)', project_section)
        processes_match = re.search(r'- 担当工程: (.+)', project_section)

        # Extract description (from 担当業務 section)
        desc_match = re.search(
            r'#### 担当業務\n\n(.+?)(?=#### |### |\Z)', project_section, re.DOTALL)
        description = desc_match.group(1).strip().replace(
            '\n\n', ' ') if desc_match else ''
        # Limit to 200 chars
        if len(description) > 200:
            description = description[:197] + '...'

        # Extract technologies (parse from multiple sources)
        technologies = []
        if lang_match:
            techs = [t.strip() for t in lang_match.group(1).split(',')]
            technologies.extend([t for t in techs if t])
        if fw_match:
            fw_str = fw_match.group(1)
            # Parse framework string
            for tech in fw_str.split(','):
                tech = tech.strip()
                if tech and not tech.startswith('ツール') and tech not in technologies:
                    technologies.append(tech)

        # Calculate month count
        if period_match:
            start_str = period_match.group(1)  # YYYY/MM
            end_str = period_match.group(2)    # YYYY/MM
            start_y, start_m = map(int, start_str.split('/'))
            end_y, end_m = map(int, end_str.split('/'))
            months = (end_y - start_y) * 12 + (end_m - start_m + 1)
        else:
            months = 0

        project = {
            'id': project_id,
            'name': project_name,
            'period': {
                'start': period_match.group(1) if period_match else '',
                'end': period_match.group(2) if period_match else ''
            },
            'monthCount': months,
            'teamSize': int(team_match.group(1)) if team_match else 0,
            'technologies': technologies[:10],  # Limit to 10 top techs
            'description': description,
            'role': role_match.group(1) if role_match else '',
        }

        projects.append(project)

    return sorted(projects, key=lambda x: x['id'])


def main():
    md_file = Path(__file__).parent.parent / 'docs' / \
        'career_sheet_converted_retry.md'
    output_file = Path(__file__).parent.parent / 'src' / \
        'lib' / 'projects_extracted.json'

    print(f"Extracting projects from {md_file}...")
    projects = extract_projects_from_md(md_file)

    print(f"Found {len(projects)} projects")

    # Save to JSON
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(projects, f, ensure_ascii=False, indent=2)

    print(f"Saved to {output_file}")

    # Print first 3 projects as sample
    print("\n=== First 3 Projects ===")
    for p in projects[:3]:
        print(
            f"ID {p['id']}: {p['name']} ({p['period']['start']} - {p['period']['end']})")
        print(f"   Team: {p['teamSize']}, Role: {p['role']}")
        print(f"   Tech: {', '.join(p['technologies'][:5])}")
        print()


if __name__ == '__main__':
    main()
