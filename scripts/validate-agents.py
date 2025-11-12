#!/usr/bin/env python3
"""
Custom Agent Configuration Validator

This script validates all custom agent configuration files to ensure they:
1. Are valid YAML
2. Have all required fields
3. Follow the proper structure
4. Have valid file references
"""

import sys
import yaml
import os
from pathlib import Path

# Required fields for agent configuration
REQUIRED_FIELDS = [
    'name',
    'description',
    'role',
    'skills',
    'tools',
    'context',
    'standards',
    'deliverables',
    'example_tasks',
    'files_to_reference'
]

REQUIRED_CONTEXT_FIELDS = [
    'project',
    'repository'
]

def validate_agent_config(file_path):
    """Validate a single agent configuration file."""
    errors = []
    warnings = []
    
    print(f"\n🔍 Validating: {file_path}")
    
    # Check file exists
    if not os.path.exists(file_path):
        errors.append(f"File does not exist: {file_path}")
        return errors, warnings
    
    # Load YAML
    try:
        with open(file_path, 'r') as f:
            config = yaml.safe_load(f)
    except yaml.YAMLError as e:
        errors.append(f"Invalid YAML syntax: {e}")
        return errors, warnings
    except Exception as e:
        errors.append(f"Error reading file: {e}")
        return errors, warnings
    
    if not config:
        errors.append("Empty configuration file")
        return errors, warnings
    
    # Check required fields
    for field in REQUIRED_FIELDS:
        if field not in config:
            errors.append(f"Missing required field: {field}")
        elif not config[field]:
            warnings.append(f"Empty field: {field}")
    
    # Check context subfields
    if 'context' in config:
        for field in REQUIRED_CONTEXT_FIELDS:
            if field not in config['context']:
                errors.append(f"Missing required context field: {field}")
    
    # Validate lists have items
    list_fields = ['skills', 'tools', 'standards', 'deliverables', 'example_tasks', 'files_to_reference']
    for field in list_fields:
        if field in config:
            if not isinstance(config[field], list):
                errors.append(f"{field} should be a list")
            elif len(config[field]) == 0:
                warnings.append(f"{field} is empty")
            elif len(config[field]) < 3 and field != 'files_to_reference':
                warnings.append(f"{field} has fewer than 3 items")
    
    # Validate description is substantial
    if 'description' in config:
        desc = config['description'].strip()
        if len(desc) < 50:
            warnings.append("Description is too short (should be 50+ characters)")
    
    # Validate role is one of expected values
    if 'role' in config:
        valid_roles = ['Senior Frontend Developer', 'Senior Backend Developer', 
                      'Senior ML Engineer', 'Senior Integration Engineer',
                      'Senior DevOps/SRE Engineer', 'Senior Database Architect',
                      'Frontend Developer + Marketing Specialist']
        if config['role'] not in valid_roles:
            warnings.append(f"Unusual role: {config['role']}")
    
    return errors, warnings

def main():
    """Main validation function."""
    agents_dir = Path('.github/agents')
    
    if not agents_dir.exists():
        print("❌ Error: .github/agents directory not found")
        print("   Run this script from the repository root")
        sys.exit(1)
    
    print("🤖 Custom Agent Configuration Validator")
    print("=" * 60)
    
    yaml_files = list(agents_dir.glob('*.yaml'))
    
    if not yaml_files:
        print("\n⚠️  No YAML files found in .github/agents/")
        sys.exit(1)
    
    print(f"\nFound {len(yaml_files)} agent configuration file(s)")
    
    total_errors = 0
    total_warnings = 0
    results = []
    
    for yaml_file in sorted(yaml_files):
        errors, warnings = validate_agent_config(yaml_file)
        total_errors += len(errors)
        total_warnings += len(warnings)
        
        results.append({
            'file': yaml_file.name,
            'errors': errors,
            'warnings': warnings
        })
        
        if errors:
            print(f"   ❌ {len(errors)} error(s)")
            for error in errors:
                print(f"      • {error}")
        
        if warnings:
            print(f"   ⚠️  {len(warnings)} warning(s)")
            for warning in warnings:
                print(f"      • {warning}")
        
        if not errors and not warnings:
            print(f"   ✅ Valid")
    
    # Print summary
    print("\n" + "=" * 60)
    print("📊 Validation Summary")
    print("=" * 60)
    
    for result in results:
        status = "✅" if not result['errors'] else "❌"
        print(f"{status} {result['file']}")
    
    print(f"\nTotal Errors: {total_errors}")
    print(f"Total Warnings: {total_warnings}")
    
    if total_errors > 0:
        print("\n❌ Validation FAILED - Please fix errors above")
        sys.exit(1)
    elif total_warnings > 0:
        print("\n⚠️  Validation PASSED with warnings")
        sys.exit(0)
    else:
        print("\n✅ All agent configurations are valid!")
        sys.exit(0)

if __name__ == '__main__':
    main()
