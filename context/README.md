# Context Files Organization Guide

This directory contains all context files that can be referenced without using the UI upload feature. Files placed here can be directly read and processed by the AI assistant.

## Directory Structure

### 📚 `/context/docs/`
**Purpose**: Documentation, specifications, and reference materials
**File Types**: `.md`, `.txt`, `.json`, `.yaml`
**Examples**:
- `devsecops-standards.md` - DevSecOps standards and guidelines
- `architecture-decisions.md` - ADRs and design decisions
- `api-specifications.yaml` - API documentation
- `compliance-requirements.txt` - Security and compliance docs

### 🎯 `/context/examples/`
**Purpose**: Code examples, configuration samples, and templates
**File Types**: `.js`, `.py`, `.yaml`, `.json`, `.sh`
**Examples**:
- `ci-cd-pipeline.yaml` - Example CI/CD configurations
- `security-policies.json` - Security policy examples
- `monitoring-configs.yaml` - Monitoring setup examples
- `deployment-scripts.sh` - Deployment automation scripts

### 🧠 `/context/knowledge-base/`
**Purpose**: Structured knowledge, CUJs, SLIs, SLOs, and best practices
**File Types**: `.json`, `.md`, `.yaml`
**Examples**:
- `cujs.json` - Critical User Journeys definitions
- `slis-slos.yaml` - Service Level Indicators and Objectives
- `best-practices.md` - DevSecOps best practices
- `risk-assessments.json` - Security risk assessments

### 📋 `/context/templates/`
**Purpose**: Reusable templates and boilerplates
**File Types**: `.md`, `.json`, `.yaml`, `.txt`
**Examples**:
- `incident-response-template.md` - Incident response templates
- `security-checklist.md` - Security review checklists
- `slo-template.yaml` - SLO definition templates
- `runbook-template.md` - Operational runbook templates

## Alternative Locations

### 📁 `/uploads/` (Existing)
- Already configured for PDF processing
- Files here are automatically processed by the platform
- Good for documents that need PDF parsing

### 📄 Project Root Files
- Place standalone context files directly in the project root
- Examples: `CONTEXT.md`, `KNOWLEDGE.json`, `GUIDELINES.txt`
- Easily accessible and visible

### 🔧 `/config/` (Create if needed)
- Configuration files and environment-specific context
- Examples: `environments.json`, `feature-flags.yaml`

## File Naming Conventions

### Recommended Patterns:
- `{topic}-{type}.{ext}` - e.g., `security-guidelines.md`
- `{domain}-{purpose}.{ext}` - e.g., `monitoring-best-practices.yaml`
- `{date}-{description}.{ext}` - e.g., `2025-01-security-review.md`

### File Types by Purpose:
- **Documentation**: `.md`, `.txt`
- **Structured Data**: `.json`, `.yaml`, `.yml`
- **Code/Scripts**: `.js`, `.py`, `.sh`, `.sql`
- **Configuration**: `.yaml`, `.json`, `.toml`

## Access Methods

### Direct File Reading
```bash
# I can read any file directly:
read_file("context/docs/security-standards.md")
read_file("context/knowledge-base/cujs.json")
```

### Search Across Files
```bash
# I can search for patterns across all context files:
search_files("context/", "SLO|SLI|monitoring")
```

### List and Explore
```bash
# I can explore the structure and find relevant files:
list_files("context/knowledge-base/")
```

## Best Practices

### 1. **Organize by Domain**
- Group related files together
- Use clear directory names
- Maintain consistent structure

### 2. **Use Descriptive Names**
- Make file purposes clear from names
- Include version dates when relevant
- Use consistent naming patterns

### 3. **Structure Content Well**
- Use clear headings and sections
- Include metadata at the top of files
- Add context and explanations

### 4. **Keep Files Focused**
- One topic per file when possible
- Break large files into smaller, focused ones
- Use cross-references between related files

### 5. **Maintain Currency**
- Update files regularly
- Include last-modified dates
- Archive outdated content

## Example File Structures

### DevSecOps Knowledge Base (`knowledge-base/cujs.json`):
```json
{
  "metadata": {
    "version": "1.0",
    "lastUpdated": "2025-01-18",
    "description": "Critical User Journeys for DevSecOps platform"
  },
  "cujs": [
    {
      "id": "cuj-001",
      "name": "Secure Code Deployment",
      "description": "End-to-end secure deployment process",
      "steps": [...],
      "slis": [...],
      "slos": [...]
    }
  ]
}
```

### Best Practices (`docs/security-guidelines.md`):
```markdown
# Security Guidelines

## Overview
This document outlines security best practices for DevSecOps.

## Guidelines
1. **Shift Left Security**
   - Integrate security early in development
   - Automated security scanning in CI/CD
   
2. **Zero Trust Architecture**
   - Never trust, always verify
   - Implement least privilege access
```

## Quick Start

1. **Choose the appropriate directory** based on your content type
2. **Create well-structured files** with clear naming
3. **Add metadata** and context to your files
4. **Reference files** by their path when asking questions

## Integration with Platform

Files in this context directory can be:
- Read directly by the AI assistant
- Searched across using pattern matching
- Referenced in chat conversations
- Used to enhance the knowledge base
- Processed alongside uploaded PDFs

The platform will automatically have access to all files placed in these directories without requiring UI uploads.
