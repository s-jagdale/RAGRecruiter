"""
Curated knowledge base for the Interview Trainer Agent's RAG pipeline.

Each entry is a "document" — a chunk of text tagged with a role/category —
that gets embedded and stored in Chroma. When a user provides their job role,
the retriever fetches the most relevant chunks from here to ground Granite's
question generation and feedback in real interview-prep content, rather than
relying purely on the model's own training knowledge.

Structure: list of dicts, each with:
  - id: unique string identifier
  - role: which job role this applies to (or "general" for all roles)
  - category: "technical_question" | "behavioral_question" | "soft_skills_question" | "star_example" | "hr_guideline"
  - content: the actual text chunk
"""

KNOWLEDGE_BASE = [

    # ============ GENERAL / ALL ROLES ============
    {
        "id": "gen_001",
        "role": "general",
        "category": "hr_guideline",
        "content": "The STAR method structures behavioral answers into four parts: "
                   "Situation (context of the event), Task (your responsibility or goal), "
                   "Action (specific steps you personally took), and Result (the outcome, "
                   "ideally with measurable impact). Strong answers spend most time on Action and Result."
    },
    {
        "id": "gen_002",
        "role": "general",
        "category": "behavioral_question",
        "content": "Tell me about a time you disagreed with a teammate or manager. How did you handle it, "
                   "and what was the outcome? This assesses conflict resolution and communication skills."
    },
    {
        "id": "gen_003",
        "role": "general",
        "category": "behavioral_question",
        "content": "Describe a project where you had to meet a tight deadline. What tradeoffs did you make, "
                   "and how did you prioritize your work? This assesses time management and decision-making under pressure."
    },
    {
        "id": "gen_004",
        "role": "general",
        "category": "behavioral_question",
        "content": "Tell me about a mistake you made at work or in a project, and how you handled it afterward. "
                   "This assesses accountability, self-awareness, and growth mindset."
    },
    {
        "id": "gen_005",
        "role": "general",
        "category": "behavioral_question",
        "content": "Describe a situation where you had to learn a new technology or skill quickly. "
                   "What was your approach? This assesses adaptability and self-directed learning ability."
    },
    {
        "id": "gen_006",
        "role": "general",
        "category": "hr_guideline",
        "content": "Common red flags in interview answers include vague responses with no specifics, "
                   "blaming others entirely for failures without acknowledging one's own role, "
                   "and inability to explain the reasoning behind past decisions."
    },
    {
        "id": "gen_007",
        "role": "general",
        "category": "behavioral_question",
        "content": "Why do you want to work here, and why this role specifically? Strong answers connect "
                   "the candidate's skills and career goals to the specific company's mission or product, "
                   "rather than giving a generic answer that could apply to any employer."
    },
    {
        "id": "gen_008",
        "role": "general",
        "category": "hr_guideline",
        "content": "When evaluating an answer's depth, look for specific numbers, named technologies, "
                   "concrete timelines, and named outcomes. Generic language like 'I worked hard and it went well' "
                   "indicates shallow depth even if the structure (STAR) is followed."
    },

    # ============ SOFT SKILLS / GENERAL (all roles) ============
    {
        "id": "soft_001",
        "role": "general",
        "category": "soft_skills_question",
        "content": "How do you explain a complex technical concept to someone with no technical background? "
                   "This assesses communication clarity and the ability to adapt language to your audience."
    },
    {
        "id": "soft_002",
        "role": "general",
        "category": "soft_skills_question",
        "content": "Describe your approach to giving constructive feedback to a teammate whose work needs improvement. "
                   "This assesses tact, empathy, and directness in communication."
    },
    {
        "id": "soft_003",
        "role": "general",
        "category": "soft_skills_question",
        "content": "How do you build trust and rapport with a new team when you join a project? "
                   "This assesses relationship-building and collaboration style."
    },
    {
        "id": "soft_004",
        "role": "general",
        "category": "soft_skills_question",
        "content": "Tell me about a time you had to motivate a team member who was disengaged or struggling. "
                   "This assesses leadership, empathy, and coaching ability."
    },
    {
        "id": "soft_005",
        "role": "general",
        "category": "soft_skills_question",
        "content": "How do you handle receiving critical feedback about your own work? "
                   "This assesses self-awareness, openness to growth, and emotional regulation."
    },
    {
        "id": "soft_006",
        "role": "general",
        "category": "soft_skills_question",
        "content": "Describe how you balance listening to others' ideas with advocating for your own point of view "
                   "in a group discussion. This assesses collaboration and active listening skills."
    },
    {
        "id": "soft_007",
        "role": "general",
        "category": "hr_guideline",
        "content": "When evaluating soft-skills answers, focus on tone, empathy, clarity of communication, "
                   "and how the candidate manages other people's emotions and perspectives — rather than "
                   "technical correctness or step-by-step problem solving."
    },
    {
        "id": "soft_008",
        "role": "general",
        "category": "star_example",
        "content": "Example strong answer for 'motivating a disengaged teammate': I noticed a teammate had "
                   "gone quiet in standups and was missing small deadlines. I asked to grab coffee one-on-one "
                   "rather than raising it in front of the team, and learned they felt overwhelmed and unsure "
                   "who to ask for help. I offered to pair on their next task and checked in weekly afterward. "
                   "Within a month they were re-engaged and later told me that conversation was what kept them on the team."
    },

    # ============ SOFTWARE ENGINEER / DEVELOPER ============
    {
        "id": "swe_001",
        "role": "software_engineer",
        "category": "technical_question",
        "content": "Explain the difference between a process and a thread, and describe a scenario where "
                   "you would choose multithreading over multiprocessing in an application you built."
    },
    {
        "id": "swe_002",
        "role": "software_engineer",
        "category": "technical_question",
        "content": "How would you design a URL shortening service? Discuss database schema, "
                   "hashing/encoding approach, handling collisions, and how you would scale it to handle "
                   "high read traffic."
    },
    {
        "id": "swe_003",
        "role": "software_engineer",
        "category": "technical_question",
        "content": "What is the difference between SQL and NoSQL databases, and when would you choose one "
                   "over the other for a given project's data model and access patterns?"
    },
    {
        "id": "swe_004",
        "role": "software_engineer",
        "category": "technical_question",
        "content": "Explain RESTful API design principles. What makes an API RESTful, and what are common "
                   "mistakes developers make when designing REST endpoints?"
    },
    {
        "id": "swe_005",
        "role": "software_engineer",
        "category": "technical_question",
        "content": "Describe the time and space complexity tradeoffs between using a hash map versus a "
                   "balanced binary search tree for a lookup-heavy application."
    },
    {
        "id": "swe_006",
        "role": "software_engineer",
        "category": "behavioral_question",
        "content": "Tell me about a time you had to refactor or fix poorly written legacy code. "
                   "What was your approach to understanding the existing system before making changes?"
    },
    {
        "id": "swe_007",
        "role": "software_engineer",
        "category": "star_example",
        "content": "Example STAR answer for 'debugging a production issue': Situation - a critical API endpoint "
                   "started timing out in production. Task - I was responsible for identifying and fixing the root "
                   "cause within an SLA window. Action - I checked logs, identified an unindexed database query "
                   "causing full table scans under load, added an index, and added query monitoring. Result - "
                   "response time dropped from 8s to 200ms, and I set up alerting to catch similar issues earlier."
    },

    # ============ DATA ANALYST / DATA SCIENTIST ============
    {
        "id": "data_001",
        "role": "data_analyst",
        "category": "technical_question",
        "content": "Explain the difference between correlation and causation, and describe a scenario where "
                   "you identified a spurious correlation in a dataset and how you handled it."
    },
    {
        "id": "data_002",
        "role": "data_analyst",
        "category": "technical_question",
        "content": "How do you handle missing data in a dataset? Compare approaches such as deletion, "
                   "mean/median imputation, and model-based imputation, and discuss when each is appropriate."
    },
    {
        "id": "data_003",
        "role": "data_analyst",
        "category": "technical_question",
        "content": "Walk through how you would evaluate whether a machine learning model is overfitting, "
                   "and what techniques you would use to address it."
    },
    {
        "id": "data_004",
        "role": "data_analyst",
        "category": "technical_question",
        "content": "Write a SQL query to find the second-highest salary in an employee table, "
                   "and explain edge cases such as duplicate salary values."
    },
    {
        "id": "data_005",
        "role": "data_analyst",
        "category": "behavioral_question",
        "content": "Tell me about a time your data analysis led to a business decision. How did you "
                   "communicate technical findings to non-technical stakeholders?"
    },
    {
        "id": "data_006",
        "role": "data_analyst",
        "category": "star_example",
        "content": "Example STAR answer for 'communicating data insights': Situation - leadership wanted to know "
                   "why customer churn increased. Task - I needed to analyze the churn data and present actionable "
                   "findings to non-technical executives. Action - I segmented customers by behavior, found a "
                   "correlation between churn and a recent pricing change, and built a simple visual dashboard. "
                   "Result - leadership reversed the pricing change for the affected segment, reducing churn by 15% "
                   "over the next quarter."
    },

    # ============ DEVOPS ENGINEER ============
    {
        "id": "devops_001",
        "role": "devops_engineer",
        "category": "technical_question",
        "content": "Explain the difference between continuous integration and continuous deployment, "
                   "and describe a CI/CD pipeline you have built or worked with."
    },
    {
        "id": "devops_002",
        "role": "devops_engineer",
        "category": "technical_question",
        "content": "What is Infrastructure as Code, and what are the benefits of using tools like Terraform "
                   "or CloudFormation over manually provisioning cloud resources?"
    },
    {
        "id": "devops_003",
        "role": "devops_engineer",
        "category": "technical_question",
        "content": "Describe the difference between containers and virtual machines, and explain a scenario "
                   "where you would choose Docker/Kubernetes over traditional VM-based deployment."
    },
    {
        "id": "devops_004",
        "role": "devops_engineer",
        "category": "behavioral_question",
        "content": "Tell me about a time a deployment or release caused an outage. How did you respond, "
                   "and what did you change afterward to prevent recurrence?"
    },

    # ============ QA / TEST ENGINEER ============
    {
        "id": "qa_001",
        "role": "qa_engineer",
        "category": "technical_question",
        "content": "Explain the difference between manual and automated testing, and describe how you decide "
                   "which test cases are worth automating."
    },
    {
        "id": "qa_002",
        "role": "qa_engineer",
        "category": "technical_question",
        "content": "What is the difference between unit testing, integration testing, and end-to-end testing? "
                   "Give an example of what you would test at each level for a login feature."
    },
    {
        "id": "qa_003",
        "role": "qa_engineer",
        "category": "behavioral_question",
        "content": "Tell me about a critical bug you found close to a release deadline. How did you handle "
                   "reporting it and balancing quality against schedule pressure?"
    },

    # ============ CYBERSECURITY ANALYST ============
    {
        "id": "sec_001",
        "role": "cybersecurity_analyst",
        "category": "technical_question",
        "content": "Explain the difference between symmetric and asymmetric encryption, and describe a "
                   "real-world scenario where each is used."
    },
    {
        "id": "sec_002",
        "role": "cybersecurity_analyst",
        "category": "technical_question",
        "content": "What is a SQL injection attack, and what are the best practices to prevent it in "
                   "application development?"
    },
    {
        "id": "sec_003",
        "role": "cybersecurity_analyst",
        "category": "behavioral_question",
        "content": "Tell me about a time you identified a security vulnerability or incident. "
                   "What was your incident response process?"
    },

    # ============ CLOUD ENGINEER ============
    {
        "id": "cloud_001",
        "role": "cloud_engineer",
        "category": "technical_question",
        "content": "Compare IaaS, PaaS, and SaaS cloud service models, and give an example of when you "
                   "would choose each for a given project."
    },
    {
        "id": "cloud_002",
        "role": "cloud_engineer",
        "category": "technical_question",
        "content": "How do you design a cloud architecture for high availability and fault tolerance? "
                   "Discuss concepts like multi-region deployment, load balancing, and auto-scaling."
    },
    {
        "id": "cloud_003",
        "role": "cloud_engineer",
        "category": "behavioral_question",
        "content": "Tell me about a time you had to optimize cloud infrastructure costs without sacrificing "
                   "performance or reliability."
    },

    # ============ IT SUPPORT / HELPDESK ============
    {
        "id": "itsup_001",
        "role": "it_support",
        "category": "technical_question",
        "content": "Walk me through how you would troubleshoot a user's computer that cannot connect to the "
                   "network. What steps would you take in order?"
    },
    {
        "id": "itsup_002",
        "role": "it_support",
        "category": "behavioral_question",
        "content": "Tell me about a time you had to explain a technical issue to a frustrated, non-technical user. "
                   "How did you handle the conversation?"
    },
    {
        "id": "itsup_003",
        "role": "it_support",
        "category": "star_example",
        "content": "Example STAR answer for 'handling a frustrated user': Situation - a user was locked out of "
                   "their account during a critical deadline and was very frustrated. Task - I needed to resolve "
                   "access quickly while following security verification procedures. Action - I calmly explained "
                   "the verification steps, expedited the password reset process, and stayed on the call until they "
                   "confirmed access. Result - the user regained access within 10 minutes and later commented on the "
                   "support quality in a customer satisfaction survey."
    },
]


def get_documents_by_role(role: str) -> list[dict]:
    """
    Returns all knowledge base entries matching a specific role, plus all
    'general' entries (which apply regardless of role).
    """
    normalized_role = role.lower().strip().replace(" ", "_")
    return [
        doc for doc in KNOWLEDGE_BASE
        if doc["role"] == normalized_role or doc["role"] == "general"
    ]


def get_all_documents() -> list[dict]:
    """Returns the entire knowledge base — used when building/rebuilding the vector index."""
    return KNOWLEDGE_BASE