# Hiking Logbook – Documentation

Welcome to the documentation hub for the **Hiking Logbook** project.  
This file serves as a **table of contents** and guide to navigate both **product documentation** (what we are building) and **process documentation** (how we are building it).  

> ⚠️ **Note:**  
> This documentation is a **living document**.  
> It may evolve as the project progresses and new requirements, features, or feedback are introduced.  
> All updates will be traceable through Git history.


---

##  Table of Contents

        ### Product Documentation
        1. [Functional & Non-Functional Requirements](https://hikers-for-life.github.io/Hiking-Logbook/product/requirements.html)
        2. [UX Documentation](https://hikers-for-life.github.io/Hiking-Logbook/product/ux.html)
        3. **Architecture**
            - [API Documentation](https://hikers-for-life.github.io/Hiking-Logbook/product/architecture/api_documentation.html)
            - [Public API Documentation](https://hikers-for-life.github.io/Hiking-Logbook/product/architecture/public_api_documentation.html)
            - [Database Documentation](https://hikers-for-life.github.io/Hiking-Logbook/product/architecture/database_documentation.html)
            - **Developer Guides**
              - [Database Setup](https://hikers-for-life.github.io/Hiking-Logbook/product/architecture/developer_guides/database_setup.html)
              - [API Setup](https://hikers-for-life.github.io/Hiking-Logbook/product/architecture/developer_guides/api_setup.html)
              - [Site Setup](https://hikers-for-life.github.io/Hiking-Logbook/product/architecture/developer_guides/site_setup.html)
              - [Deployment](https://hikers-for-life.github.io/Hiking-Logbook/product/architecture/developer_guides/deployment.html)
            - [Tech Stack](https://hikers-for-life.github.io/Hiking-Logbook/process/technology.html)
            - [Third-Party Code Documentation](https://hikers-for-life.github.io/Hiking-Logbook/product/architecture/third_party_documentation.html)
        4. [Testing Documentation](https://hikers-for-life.github.io/Hiking-Logbook/product/testing.html)

### Process Documentation
5. [Strategy Roadmap](https://hikers-for-life.github.io/Hiking-Logbook/process/strategy.html) : Project structure, project management methodology, goals, project alignment, and development roadmap. 
6. [Technology Roadmap](https://hikers-for-life.github.io/Hiking-Logbook/process/technology.html) : Tech Stack
7. [Release Roadmap](https://hikers-for-life.github.io/Hiking-Logbook/process/release.html)
8. [Standards](https://hikers-for-life.github.io/Hiking-Logbook/process/standards.html) : Coding standards, commit conventions, Git methodology, testing standards, documentation standards, branch rules and CI pipeline.



---

##  Documentation Structure

### Current Structure (Updated for Marking Rubric Compliance)

```
docs/
├── product/                          # Product Documentation
│   ├── requirements.html            # Functional & Non-Functional Requirements
│   ├── ux.html                      # UX Documentation
│   ├── testing.html                 # Testing Documentation
│   └── architecture/                # Architecture & Design
│       ├── api_documentation.html   # Internal API Documentation
│       ├── public_api_documentation.html  # Public API Documentation
│       ├── database_documentation.html    # Database Schema & Structure
│       ├── third_party_documentation.html # Third-Party Code Documentation
│       ├── technology.html          # Tech Stack Documentation
│       └── developer_guides/        # Developer Setup Guides
│           ├── database_setup.html  # Database Setup Instructions
│           ├── api_setup.html       # API Setup Instructions
│           ├── site_setup.html      # Frontend Setup Instructions
│           └── deployment.html      # Deployment Instructions
└── process/                         # Process Documentation
    ├── strategy.html                # Strategy Roadmap
    ├── technology.html              # Technology Roadmap
    ├── release.html                 # Release Roadmap
    └── standards.html               # Development Standards
```

### Architecture Documentation Alignment

The architecture documentation is now structured to match the marking rubric requirements:

- **API Documentation** - Complete internal API reference
- **Public API Documentation** - External developer API with examples
- **Database Documentation** - Complete schema and data structures
- **Developer Guides** - Setup instructions for all components
- **Tech Stack** - Technology choices and rationale
- **Third-Party Code Documentation** - All external integrations (25+ libraries)



---

##  Documentation Standards

- **File Format**: Markdown (`.md`) for readability on GitHub and easy conversion to PDF if required.  
- **Naming Conventions**: Lowercase filenames with underscores if needed (e.g., `architecture_design.md`).  
- **Cross-Referencing**: Each requirement is traceable to UX artifacts, architecture components, and test cases.  
- **Versioning**: Documentation evolves with each sprint and release. Previous versions are tracked in Git history.  

---

##  Metrics Approach

To measure project quality and progress, we track:
- Story points completed per sprint.  
- Number of test cases written vs. passed.  
- Bugs logged and resolved.  
- Deployment success rate.  

---

##  Glossary

- **Logbook**: A digital record of hikes including notes, weather, and GPS routes.  
- **Planned Hike**: A scheduled hike with route, checklist, and invited friends.  
- **Achievements**: User-defined goals (e.g., total distance, number of hikes) with tracked progress.  
- **Activity Feed**: Timeline showing hikes and milestones from friends.  

---

##  Purpose of this Documentation

This documentation is designed not just to explain the final product but to demonstrate the **process, quality standards, and intentionality** behind its development. It reflects both the *engineering mindset* and *collaborative teamwork* that went into the Hiking Logbook project.




