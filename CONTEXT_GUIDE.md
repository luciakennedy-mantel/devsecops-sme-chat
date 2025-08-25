# Context Files Guide for DevSecOps SME Platform

## Quick Reference

You can store all your context files in the following locations for me to access directly without using the UI upload:

### 📁 Primary Context Directory: `/context/`

```
context/
├── README.md                           # Complete organization guide
├── docs/                              # Documentation & specifications
│   └── devsecops-best-practices.md    # DevSecOps best practices
├── examples/                          # Code examples & configurations
├── knowledge-base/                    # Structured knowledge (CUJs, SLIs, SLOs)
│   ├── CBA OBSERVABILITY WIP.pdf      # CBA Observability Framework (your PDF)
│   ├── cba-observability-summary.md   # Structured summary of CBA framework
│   └── cujs-template.json            # Generic CUJ template
└── templates/                         # Reusable templates
    ├── cba-cuj-template.json         # CBA-specific CUJ template
    └── slo-template.yaml             # SLO definition template
```

### 📄 Alternative Locations

1. **Project Root**: Place files like `KNOWLEDGE.md`, `CONTEXT.txt` directly in `/Users/luciakennedy/Documents/devsecops-sme-platform/`

2. **Uploads Directory**: `/uploads/` - Already configured for PDF processing

3. **Custom Directories**: Create any directory structure you need (e.g., `/config/`, `/data/`)

## How I Access Your Files

### Direct Reading
```bash
# I can read any file you place:
read_file("context/docs/your-document.md")
read_file("your-context-file.txt")
read_file("uploads/your-pdf.pdf")
```

### Search Across Files
```bash
# I can search for patterns across all your context:
search_files("context/", "SLO|monitoring|security")
search_files(".", "vulnerability|compliance")
```

### Explore Structure
```bash
# I can explore and discover your files:
list_files("context/knowledge-base/")
list_files(".", recursive=true)
```

## File Types I Can Process

- **Text Files**: `.md`, `.txt`, `.json`, `.yaml`, `.yml`
- **Code Files**: `.js`, `.py`, `.sh`, `.sql`, `.html`, `.css`
- **Configuration**: `.toml`, `.ini`, `.conf`
- **PDFs**: Automatic text extraction
- **Any text-based format**

## Best Practices

### 1. **Organize by Purpose**
- Use the `/context/` subdirectories for different types of content
- Group related files together
- Use descriptive file names

### 2. **Structure Your Content**
- Add metadata at the top of files (version, date, author)
- Use clear headings and sections
- Include context and explanations

### 3. **Make Files Discoverable**
- Use consistent naming conventions
- Include keywords in filenames
- Cross-reference related files

## Example Usage

### Storing DevSecOps Knowledge
```
context/knowledge-base/
├── cujs-production.json        # Your actual CUJs
├── slis-monitoring.yaml        # Your SLI definitions
├── slos-targets.yaml          # Your SLO targets
└── security-policies.md       # Security policies
```

### Storing Documentation
```
context/docs/
├── architecture-decisions.md   # ADRs
├── runbooks.md                # Operational procedures
├── compliance-requirements.md  # Compliance docs
└── team-guidelines.md         # Team processes
```

### Storing Examples and Templates
```
context/examples/
├── ci-cd-pipeline.yaml        # Pipeline configurations
├── monitoring-setup.sh        # Setup scripts
└── security-configs.json     # Security configurations

context/templates/
├── incident-response.md       # Response templates
├── security-checklist.md     # Review checklists
└── slo-definition.yaml       # SLO templates
```

## Integration with Platform

Your context files will:
- ✅ Be directly accessible to me for reading and analysis
- ✅ Be searchable across all content
- ✅ Enhance the knowledge base alongside uploaded PDFs
- ✅ Be referenced in chat conversations
- ✅ Support the MCP server functionality

## Getting Started

1. **Choose your preferred location** (recommend `/context/` for organization)
2. **Create your first context file** with relevant content
3. **Reference it in our conversation** by mentioning the file path
4. **I'll automatically access and process** the content as needed

## Example Commands to Get Started

```bash
# Create a knowledge file
echo "# My DevSecOps Knowledge" > context/docs/my-knowledge.md

# Create a CUJ definition
echo '{"cujs": []}' > context/knowledge-base/my-cujs.json

# Create a simple context file in project root
echo "Key information for AI assistant" > CONTEXT.txt
```

---

**Ready to start?** Place your first context file in any of these locations and reference it in our conversation!
