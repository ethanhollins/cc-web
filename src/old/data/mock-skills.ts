import { Objective, Skill, SkillStage, SkillStageNode } from "@/types/skills";

/**
 * Mock data for skills system
 */

export const MOCK_SKILLS: Skill[] = [
    {
        skill_id: "skill-1",
        skill_type: "mastery",
        name: "Generative AI SME",
        description:
            "Subject matter expert in generative AI technologies, including LLMs, diffusion models, and practical applications in enterprise settings.",
        current_stage: "Practitioner",
        stage_progress: {
            Foundation: 100,
            Practitioner: 65,
            Expert: 0,
            Authority: 0,
            Master: 0,
        },
        rubrics: [
            {
                stage: "Foundation",
                estimated_duration: "3-6 months",
                requirements: [
                    "Complete foundational courses in ML and AI",
                    "Build basic understanding of transformer architecture",
                    "Experiment with popular AI APIs",
                ],
                criteria: [
                    {
                        criterion_id: "f1",
                        name: "Theoretical Understanding",
                        description: "Demonstrate understanding of fundamental AI concepts including neural networks, training, and inference.",
                        weight: 30,
                        score: 100,
                    },
                    {
                        criterion_id: "f2",
                        name: "Tool Familiarity",
                        description: "Use common AI tools and frameworks (OpenAI API, Anthropic, etc.) for basic tasks.",
                        weight: 40,
                        score: 100,
                    },
                    {
                        criterion_id: "f3",
                        name: "Problem Recognition",
                        description: "Identify opportunities where generative AI can add value.",
                        weight: 30,
                        score: 100,
                    },
                ],
            },
            {
                stage: "Practitioner",
                estimated_duration: "6-12 months",
                requirements: [
                    "Build and deploy at least 3 production AI features",
                    "Demonstrate prompt engineering expertise",
                    "Understand model selection and trade-offs",
                ],
                criteria: [
                    {
                        criterion_id: "p1",
                        name: "Implementation Skills",
                        description: "Build production-ready AI features with proper error handling, monitoring, and user experience.",
                        weight: 35,
                        score: 75,
                    },
                    {
                        criterion_id: "p2",
                        name: "Prompt Engineering",
                        description: "Design effective prompts with context management, chain-of-thought, and few-shot learning.",
                        weight: 25,
                        score: 80,
                    },
                    {
                        criterion_id: "p3",
                        name: "System Integration",
                        description: "Integrate AI capabilities into existing systems with proper architecture and data flows.",
                        weight: 25,
                        score: 60,
                    },
                    {
                        criterion_id: "p4",
                        name: "Performance Optimization",
                        description: "Optimize for cost, latency, and quality trade-offs.",
                        weight: 15,
                        score: 40,
                    },
                ],
            },
            {
                stage: "Expert",
                estimated_duration: "1-2 years",
                requirements: [
                    "Lead major AI initiatives from concept to production",
                    "Publish technical articles or speak at conferences",
                    "Mentor others in AI implementation",
                    "Build custom solutions beyond standard APIs",
                ],
                criteria: [
                    {
                        criterion_id: "e1",
                        name: "Advanced Techniques",
                        description: "Implement advanced patterns like RAG, fine-tuning, agent systems, and multi-model orchestration.",
                        weight: 30,
                        score: 0,
                    },
                    {
                        criterion_id: "e2",
                        name: "Architecture Design",
                        description: "Design scalable AI systems with proper abstractions, monitoring, and fail-safes.",
                        weight: 25,
                        score: 0,
                    },
                    {
                        criterion_id: "e3",
                        name: "Knowledge Sharing",
                        description: "Create educational content, presentations, or documentation that helps others learn.",
                        weight: 20,
                        score: 0,
                    },
                    {
                        criterion_id: "e4",
                        name: "Business Impact",
                        description: "Deliver measurable business value through AI implementations.",
                        weight: 25,
                        score: 0,
                    },
                ],
            },
            {
                stage: "Authority",
                estimated_duration: "2-3 years",
                requirements: [
                    "Recognized externally as a thought leader",
                    "Published multiple in-depth articles or papers",
                    "Built innovative AI solutions that push boundaries",
                    "Established track record of successful AI projects",
                ],
                criteria: [
                    {
                        criterion_id: "a1",
                        name: "Innovation",
                        description: "Create novel approaches or solutions that advance the field.",
                        weight: 30,
                        score: 0,
                    },
                    {
                        criterion_id: "a2",
                        name: "Thought Leadership",
                        description: "Regular publication of high-quality content that shapes industry conversation.",
                        weight: 25,
                        score: 0,
                    },
                    {
                        criterion_id: "a3",
                        name: "Strategic Vision",
                        description: "Guide organizational AI strategy with deep technical and business understanding.",
                        weight: 25,
                        score: 0,
                    },
                    {
                        criterion_id: "a4",
                        name: "Community Impact",
                        description: "Active contribution to the broader AI community through mentoring, open source, or speaking.",
                        weight: 20,
                        score: 0,
                    },
                ],
            },
            {
                stage: "Master",
                estimated_duration: "3-5+ years",
                requirements: [
                    "Industry-recognized expert with significant influence",
                    "Published books, research papers, or extensive body of work",
                    "Built transformative AI systems used by thousands",
                    "Mentored multiple experts who are authorities themselves",
                    "Contributing to the advancement of the field",
                ],
                criteria: [
                    {
                        criterion_id: "m1",
                        name: "Field Advancement",
                        description: "Make significant contributions that advance the state of generative AI.",
                        weight: 30,
                        score: 0,
                    },
                    {
                        criterion_id: "m2",
                        name: "Proven Excellence",
                        description: "Extensive portfolio of successful, impactful AI implementations across domains.",
                        weight: 25,
                        score: 0,
                    },
                    {
                        criterion_id: "m3",
                        name: "Knowledge Dissemination",
                        description: "Created comprehensive educational resources (books, courses, frameworks) used widely.",
                        weight: 25,
                        score: 0,
                    },
                    {
                        criterion_id: "m4",
                        name: "Legacy Building",
                        description: "Developed next generation of AI experts through mentorship and leadership.",
                        weight: 20,
                        score: 0,
                    },
                ],
            },
        ],
        connected_stage_ids: ["stage-1-practitioner"],
        created_at: "2024-01-15T10:00:00Z",
        updated_at: "2024-11-20T14:30:00Z",
        position: { x: 1300, y: 263 },
        color: "#06b6d4", // cyan-500
    },
    {
        skill_id: "skill-2",
        skill_type: "mastery",
        name: "Full-Stack Engineering",
        description: "Comprehensive mastery of modern full-stack development including frontend, backend, databases, and DevOps practices.",
        current_stage: "Expert",
        stage_progress: {
            Foundation: 100,
            Practitioner: 100,
            Expert: 45,
            Authority: 0,
            Master: 0,
        },
        rubrics: [
            {
                stage: "Foundation",
                estimated_duration: "6-12 months",
                requirements: ["Build full applications from scratch", "Understand HTTP, databases, and authentication", "Deploy applications to production"],
                criteria: [
                    {
                        criterion_id: "fs-f1",
                        name: "Core Technologies",
                        description: "Proficiency in HTML, CSS, JavaScript, and at least one backend language.",
                        weight: 40,
                        score: 100,
                    },
                    {
                        criterion_id: "fs-f2",
                        name: "Database Skills",
                        description: "Work with both SQL and NoSQL databases effectively.",
                        weight: 30,
                        score: 100,
                    },
                    {
                        criterion_id: "fs-f3",
                        name: "Deployment",
                        description: "Deploy and maintain applications in cloud environments.",
                        weight: 30,
                        score: 100,
                    },
                ],
            },
            {
                stage: "Practitioner",
                estimated_duration: "1-2 years",
                requirements: [
                    "Build scalable applications handling real traffic",
                    "Implement proper testing and CI/CD",
                    "Work effectively in team environments",
                ],
                criteria: [
                    {
                        criterion_id: "fs-p1",
                        name: "Architecture",
                        description: "Design maintainable application architecture with proper separation of concerns.",
                        weight: 30,
                        score: 100,
                    },
                    {
                        criterion_id: "fs-p2",
                        name: "Testing & Quality",
                        description: "Implement comprehensive testing strategies and quality assurance practices.",
                        weight: 25,
                        score: 100,
                    },
                    {
                        criterion_id: "fs-p3",
                        name: "Performance",
                        description: "Optimize applications for speed, efficiency, and user experience.",
                        weight: 25,
                        score: 100,
                    },
                    {
                        criterion_id: "fs-p4",
                        name: "Collaboration",
                        description: "Work effectively in teams using git, code review, and agile practices.",
                        weight: 20,
                        score: 100,
                    },
                ],
            },
            {
                stage: "Expert",
                estimated_duration: "2-3 years",
                requirements: [
                    "Lead technical decisions for major projects",
                    "Establish engineering standards and practices",
                    "Mentor junior and mid-level developers",
                    "Contribute to technical strategy",
                ],
                criteria: [
                    {
                        criterion_id: "fs-e1",
                        name: "System Design",
                        description: "Design complex distributed systems with proper scalability and reliability.",
                        weight: 35,
                        score: 50,
                    },
                    {
                        criterion_id: "fs-e2",
                        name: "Technical Leadership",
                        description: "Guide technical decisions and establish engineering excellence standards.",
                        weight: 30,
                        score: 60,
                    },
                    {
                        criterion_id: "fs-e3",
                        name: "Mentorship",
                        description: "Develop other engineers through effective mentoring and knowledge sharing.",
                        weight: 20,
                        score: 40,
                    },
                    {
                        criterion_id: "fs-e4",
                        name: "Innovation",
                        description: "Introduce new technologies and practices that improve team effectiveness.",
                        weight: 15,
                        score: 30,
                    },
                ],
            },
            {
                stage: "Authority",
                estimated_duration: "3-4 years",
                requirements: [
                    "Recognized industry expert through content and speaking",
                    "Built systems handling millions of users",
                    "Shaped engineering culture at organizational level",
                    "Published technical content or open source tools",
                ],
                criteria: [
                    {
                        criterion_id: "fs-a1",
                        name: "Technical Excellence",
                        description: "Demonstrated mastery across the full stack at scale.",
                        weight: 30,
                        score: 0,
                    },
                    {
                        criterion_id: "fs-a2",
                        name: "Industry Recognition",
                        description: "External recognition through conference talks, articles, or open source contributions.",
                        weight: 25,
                        score: 0,
                    },
                    {
                        criterion_id: "fs-a3",
                        name: "Cultural Impact",
                        description: "Shape engineering culture and practices at organizational scale.",
                        weight: 25,
                        score: 0,
                    },
                    {
                        criterion_id: "fs-a4",
                        name: "Strategic Influence",
                        description: "Influence technical strategy and long-term architectural decisions.",
                        weight: 20,
                        score: 0,
                    },
                ],
            },
            {
                stage: "Master",
                estimated_duration: "5+ years",
                requirements: [
                    "Industry-wide recognition as a leading expert",
                    "Significant open source contributions or products",
                    "Published books or extensive technical content",
                    "Mentored multiple engineers to expert level",
                    "Shaped the direction of web technologies",
                ],
                criteria: [
                    {
                        criterion_id: "fs-m1",
                        name: "Industry Leadership",
                        description: "Recognized globally as a thought leader in full-stack engineering.",
                        weight: 30,
                        score: 0,
                    },
                    {
                        criterion_id: "fs-m2",
                        name: "Lasting Contributions",
                        description: "Created frameworks, tools, or content that benefits thousands of developers.",
                        weight: 30,
                        score: 0,
                    },
                    {
                        criterion_id: "fs-m3",
                        name: "Knowledge Legacy",
                        description: "Published comprehensive educational resources (books, courses, documentation).",
                        weight: 20,
                        score: 0,
                    },
                    {
                        criterion_id: "fs-m4",
                        name: "Ecosystem Impact",
                        description: "Influenced the evolution of web development practices and standards.",
                        weight: 20,
                        score: 0,
                    },
                ],
            },
        ],
        connected_stage_ids: ["stage-2-expert"],
        created_at: "2023-06-10T08:00:00Z",
        updated_at: "2024-11-18T16:45:00Z",
        position: { x: 721, y: 704 },
        color: "#f97316", // orange-500
    },
    {
        skill_id: "skill-3",
        skill_type: "mastery",
        name: "Product Management",
        description: "Strategic product thinking, user research, roadmap planning, and cross-functional leadership to deliver impactful products.",
        current_stage: "Foundation",
        stage_progress: {
            Foundation: 35,
            Practitioner: 0,
            Expert: 0,
            Authority: 0,
            Master: 0,
        },
        rubrics: [
            {
                stage: "Foundation",
                estimated_duration: "6-12 months",
                requirements: ["Learn product management frameworks", "Conduct user research and interviews", "Create product documentation and roadmaps"],
                criteria: [
                    {
                        criterion_id: "pm-f1",
                        name: "Product Thinking",
                        description: "Understand user needs, market dynamics, and product-market fit.",
                        weight: 35,
                        score: 50,
                    },
                    {
                        criterion_id: "pm-f2",
                        name: "Communication",
                        description: "Effectively communicate product vision and requirements to stakeholders.",
                        weight: 35,
                        score: 40,
                    },
                    {
                        criterion_id: "pm-f3",
                        name: "Analytical Skills",
                        description: "Use data and metrics to inform product decisions.",
                        weight: 30,
                        score: 20,
                    },
                ],
            },
            {
                stage: "Practitioner",
                estimated_duration: "1-2 years",
                requirements: [
                    "Own at least one product or major feature",
                    "Lead cross-functional teams effectively",
                    "Demonstrate successful product launches",
                ],
                criteria: [
                    {
                        criterion_id: "pm-p1",
                        name: "Product Ownership",
                        description: "Take full ownership of product decisions and outcomes.",
                        weight: 30,
                        score: 0,
                    },
                    {
                        criterion_id: "pm-p2",
                        name: "Stakeholder Management",
                        description: "Build consensus and manage expectations across diverse stakeholders.",
                        weight: 25,
                        score: 0,
                    },
                    {
                        criterion_id: "pm-p3",
                        name: "Execution",
                        description: "Drive products from concept to launch with quality and timeliness.",
                        weight: 25,
                        score: 0,
                    },
                    {
                        criterion_id: "pm-p4",
                        name: "Metrics & Iteration",
                        description: "Define success metrics and iterate based on data and feedback.",
                        weight: 20,
                        score: 0,
                    },
                ],
            },
            {
                stage: "Expert",
                estimated_duration: "2-3 years",
                requirements: [
                    "Lead multiple products or a product portfolio",
                    "Define product strategy for business unit",
                    "Mentor other product managers",
                    "Demonstrate significant business impact",
                ],
                criteria: [
                    {
                        criterion_id: "pm-e1",
                        name: "Strategic Thinking",
                        description: "Define product strategy aligned with business goals and market opportunities.",
                        weight: 30,
                        score: 0,
                    },
                    {
                        criterion_id: "pm-e2",
                        name: "Leadership",
                        description: "Lead and influence teams without direct authority.",
                        weight: 25,
                        score: 0,
                    },
                    {
                        criterion_id: "pm-e3",
                        name: "Business Acumen",
                        description: "Deep understanding of business models, economics, and competitive dynamics.",
                        weight: 25,
                        score: 0,
                    },
                    {
                        criterion_id: "pm-e4",
                        name: "Innovation",
                        description: "Identify and validate new opportunities that drive growth.",
                        weight: 20,
                        score: 0,
                    },
                ],
            },
            {
                stage: "Authority",
                estimated_duration: "3-5 years",
                requirements: [
                    "Define product vision for entire organization",
                    "Industry recognition through content or speaking",
                    "Track record of successful product launches",
                    "Built and led product teams",
                ],
                criteria: [
                    {
                        criterion_id: "pm-a1",
                        name: "Visionary Leadership",
                        description: "Set bold product vision that inspires teams and captures market opportunities.",
                        weight: 30,
                        score: 0,
                    },
                    {
                        criterion_id: "pm-a2",
                        name: "Organizational Impact",
                        description: "Shape product culture and practices across the organization.",
                        weight: 25,
                        score: 0,
                    },
                    {
                        criterion_id: "pm-a3",
                        name: "Industry Influence",
                        description: "Share insights that influence product management practices broadly.",
                        weight: 25,
                        score: 0,
                    },
                    {
                        criterion_id: "pm-a4",
                        name: "Team Development",
                        description: "Build and develop high-performing product teams.",
                        weight: 20,
                        score: 0,
                    },
                ],
            },
            {
                stage: "Master",
                estimated_duration: "5+ years",
                requirements: [
                    "Led transformative product initiatives",
                    "Published books or extensive thought leadership",
                    "Mentored numerous PMs to senior levels",
                    "Recognized industry-wide as a product leader",
                    "Shaped product management as a discipline",
                ],
                criteria: [
                    {
                        criterion_id: "pm-m1",
                        name: "Transformative Impact",
                        description: "Led products that fundamentally changed industries or user behaviors.",
                        weight: 30,
                        score: 0,
                    },
                    {
                        criterion_id: "pm-m2",
                        name: "Thought Leadership",
                        description: "Published frameworks, books, or content that shapes PM practice globally.",
                        weight: 30,
                        score: 0,
                    },
                    {
                        criterion_id: "pm-m3",
                        name: "Discipline Advancement",
                        description: "Advanced product management as a discipline through research and practice.",
                        weight: 20,
                        score: 0,
                    },
                    {
                        criterion_id: "pm-m4",
                        name: "Legacy Building",
                        description: "Developed multiple product leaders who are experts themselves.",
                        weight: 20,
                        score: 0,
                    },
                ],
            },
        ],
        connected_stage_ids: ["stage-3-foundation"],
        created_at: "2024-08-20T12:00:00Z",
        updated_at: "2024-11-15T09:20:00Z",
        position: { x: 1409, y: 704 },
        color: "#a855f7", // purple-500
    },
];

/**
 * Generate stage nodes for all stages up to and including the current stage
 */
function generateStageNodesForSkills(): SkillStageNode[] {
    const stageOrder: SkillStage[] = ["Foundation", "Practitioner", "Expert", "Authority", "Master"];
    const stageNodes: SkillStageNode[] = [];

    // Fixed positions for stage nodes
    const stagePositions: Record<string, { x: number; y: number }> = {
        "skill-1-foundation": { x: 1023, y: 149 },
        "skill-1-practitioner": { x: 1474, y: 102 },
        "skill-2-foundation": { x: 548, y: 563 },
        "skill-2-practitioner": { x: 899, y: 511 },
        "skill-2-expert": { x: 1041, y: 784 },
        "skill-3-foundation": { x: 1594, y: 592 },
    };

    MOCK_SKILLS.forEach((skill, skillIndex) => {
        const currentStageIndex = stageOrder.indexOf(skill.current_stage);

        // Create stage nodes for all stages up to and including the current stage
        for (let i = 0; i <= currentStageIndex; i++) {
            const stage = stageOrder[i];
            const progress = skill.stage_progress[stage];
            const stageNodeId = `${skill.skill_id}-${stage.toLowerCase()}`;

            stageNodes.push({
                stage_node_id: stageNodeId,
                skill_id: skill.skill_id,
                stage: stage,
                name: stage,
                description: `${stage} stage for ${skill.name}`,
                progress: progress,
                connected_ticket_ids: [], // Will be populated with actual ticket connections
                position: stagePositions[stageNodeId] || { x: 400, y: 300 },
            });
        }
    });

    return stageNodes;
}

export const MOCK_STAGE_NODES: SkillStageNode[] = generateStageNodesForSkills();

// Update skills to reference their generated stage nodes
MOCK_SKILLS.forEach((skill) => {
    const stageOrder: SkillStage[] = ["Foundation", "Practitioner", "Expert", "Authority", "Master"];
    const currentStageIndex = stageOrder.indexOf(skill.current_stage);

    skill.connected_stage_ids = [];
    for (let i = 0; i <= currentStageIndex; i++) {
        const stage = stageOrder[i];
        skill.connected_stage_ids.push(`${skill.skill_id}-${stage.toLowerCase()}`);
    }
});

// Assign tickets to stage nodes
const ticketAssignments: Record<string, string> = {
    "ticket-1": "skill-1-foundation",
    "ticket-2": "skill-1-foundation",
    "ticket-3": "skill-1-practitioner",
    "ticket-4": "skill-2-foundation",
    "ticket-5": "skill-2-practitioner",
    "ticket-6": "skill-3-foundation",
};

Object.entries(ticketAssignments).forEach(([ticketId, stageNodeId]) => {
    const stageNode = MOCK_STAGE_NODES.find((s) => s.stage_node_id === stageNodeId);
    if (stageNode && !stageNode.connected_ticket_ids.includes(ticketId)) {
        stageNode.connected_ticket_ids.push(ticketId);
    }
});

/**
 * Mock objectives - single-stage goals like promotions
 */
export const MOCK_OBJECTIVES: Objective[] = [
    {
        skill_id: "objective-1",
        skill_type: "objective",
        name: "Associate Principal Engineer",
        description:
            "Achieve promotion to Associate Principal Engineer - demonstrating technical leadership, architectural expertise, and significant business impact.",
        progress: 65,
        is_achieved: false,
        rubric: {
            estimated_duration: "12-18 months",
            requirements: [
                "Lead architecture for 2+ major systems or initiatives",
                "Demonstrate technical leadership across multiple teams",
                "Mentor senior engineers and influence technical direction",
                "Drive measurable business impact through technical excellence",
                "Establish engineering standards and best practices",
            ],
            criteria: [
                {
                    criterion_id: "ape-1",
                    name: "Technical Excellence",
                    description: "Demonstrate deep expertise across multiple domains and ability to solve complex technical challenges.",
                    weight: 30,
                    score: 75,
                },
                {
                    criterion_id: "ape-2",
                    name: "System Design & Architecture",
                    description: "Design and deliver scalable, reliable systems that handle significant user load and business requirements.",
                    weight: 25,
                    score: 70,
                },
                {
                    criterion_id: "ape-3",
                    name: "Technical Leadership",
                    description: "Lead technical decisions, mentor engineers, and influence engineering culture and practices.",
                    weight: 25,
                    score: 60,
                },
                {
                    criterion_id: "ape-4",
                    name: "Business Impact",
                    description: "Deliver projects that drive measurable business outcomes and strategic value.",
                    weight: 20,
                    score: 50,
                },
            ],
        },
        connected_ticket_ids: ["ticket-1", "ticket-3"],
        created_at: "2024-09-01T10:00:00Z",
        updated_at: "2024-11-21T11:30:00Z",
        position: { x: 886, y: -285 },
        color: "#10b981", // emerald-500
    },
    {
        skill_id: "objective-2",
        skill_type: "objective",
        name: "Published Technical Author",
        description: "Establish a reputation as a published technical author with regular high-quality content reaching thousands of developers.",
        progress: 40,
        is_achieved: false,
        rubric: {
            estimated_duration: "18-24 months",
            requirements: [
                "Publish 20+ technical articles or blog posts",
                "Reach 50,000+ readers across content",
                "Receive recognition from community (shares, comments, followers)",
                "Cover in-depth technical topics with practical value",
                "Establish consistent publishing cadence",
            ],
            criteria: [
                {
                    criterion_id: "pta-1",
                    name: "Content Quality",
                    description: "Produce well-researched, clear, and valuable technical content that helps readers solve real problems.",
                    weight: 35,
                    score: 50,
                },
                {
                    criterion_id: "pta-2",
                    name: "Reach & Engagement",
                    description: "Build and engage an audience, with measurable impact through views, shares, and feedback.",
                    weight: 30,
                    score: 35,
                },
                {
                    criterion_id: "pta-3",
                    name: "Consistency",
                    description: "Maintain regular publishing schedule and build a substantial body of work.",
                    weight: 20,
                    score: 40,
                },
                {
                    criterion_id: "pta-4",
                    name: "Breadth & Depth",
                    description: "Cover diverse topics while demonstrating deep expertise in key areas.",
                    weight: 15,
                    score: 30,
                },
            ],
        },
        connected_ticket_ids: ["ticket-2"],
        created_at: "2024-07-15T14:00:00Z",
        updated_at: "2024-11-20T16:45:00Z",
        position: { x: 380, y: 26 },
        color: "#06b6d4", // cyan-500
    },
    {
        skill_id: "objective-3",
        skill_type: "objective",
        name: "Conference Speaker",
        description: "Become an experienced conference speaker, delivering talks at major technical conferences and building a speaker reputation.",
        progress: 15,
        is_achieved: false,
        rubric: {
            estimated_duration: "24-36 months",
            requirements: [
                "Deliver 5+ talks at technical conferences or meetups",
                "Speak at least one major conference (1000+ attendees)",
                "Receive positive feedback and speaker ratings",
                "Develop compelling presentations and speaking skills",
                "Submit proposals to multiple conferences",
            ],
            criteria: [
                {
                    criterion_id: "cs-1",
                    name: "Speaking Experience",
                    description: "Build experience through multiple speaking engagements at various venues.",
                    weight: 30,
                    score: 20,
                },
                {
                    criterion_id: "cs-2",
                    name: "Presentation Quality",
                    description: "Create engaging, well-structured presentations that deliver value to audiences.",
                    weight: 25,
                    score: 15,
                },
                {
                    criterion_id: "cs-3",
                    name: "Audience Impact",
                    description: "Receive positive feedback and demonstrate impact on attendees.",
                    weight: 25,
                    score: 10,
                },
                {
                    criterion_id: "cs-4",
                    name: "Topic Expertise",
                    description: "Demonstrate deep knowledge of speaking topics and ability to field questions.",
                    weight: 20,
                    score: 15,
                },
            ],
        },
        connected_ticket_ids: [],
        created_at: "2024-10-01T09:00:00Z",
        updated_at: "2024-11-18T13:20:00Z",
        position: { x: 1679, y: 307 },
        color: "#f59e0b", // amber-500
    },
];
