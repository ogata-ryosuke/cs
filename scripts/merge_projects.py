#!/usr/bin/env python3
"""Merge extracted projects with existing sample data"""

import json
from pathlib import Path


def main():
    extracted_file = Path(__file__).parent.parent / \
        'src' / 'lib' / 'projects_extracted.json'
    sample_file = Path(__file__).parent.parent / \
        'src' / 'lib' / 'sample-data.json'

    # Load extracted projects
    with open(extracted_file, 'r', encoding='utf-8') as f:
        extracted = json.load(f)

    # Load existing sample data
    with open(sample_file, 'r', encoding='utf-8') as f:
        sample = json.load(f)

    # Get existing projects map by ID for rich descriptions
    existing_by_id = {p['id']: p for p in sample['projects']}

    # Merge: use extracted data, but supplement with existing rich data
    merged_projects = []
    for proj in extracted:
        proj_id = proj['id']
        if proj_id in existing_by_id:
            # Merge with existing data, preferring existing rich fields
            existing = existing_by_id[proj_id]
            merged = {
                **proj,  # Start with extracted
                # Use existing desc if richer
                'description': existing.get('description', proj['description']),
                # Use existing techs if better
                'technologies': existing.get('technologies', proj['technologies']),
            }
        else:
            merged = proj

        merged_projects.append(merged)

    # Sort by ID
    merged_projects = sorted(merged_projects, key=lambda x: x['id'])

    # Create new sample data with merged projects
    new_sample = {
        **sample,
        'projects': merged_projects
    }

    # Save back
    with open(sample_file, 'w', encoding='utf-8') as f:
        json.dump(new_sample, f, ensure_ascii=False, indent=2)

    print(f"✅ Merged {len(merged_projects)} projects into sample-data.json")
    print(
        f"   - Projects with ID 1-31: {len([p for p in merged_projects if p['id'] <= 31])} (newly added)")
    print(
        f"   - Projects with ID 32-41: {len([p for p in merged_projects if p['id'] >= 32])} (updated)")


if __name__ == '__main__':
    main()
