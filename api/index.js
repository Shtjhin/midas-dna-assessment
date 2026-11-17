const express = require("express");
const { Pool } = require("pg");

// Profiling Test: 16 type profiles (internal, served to admin only).
const PROFILES = {"INTJ": {"title": "Profile INTJ", "sub": "The nickname Architect comes from 16Personalities and Mastermind from Keirsey. Neither is an official MBTI term.", "blocks": [{"h": "Meaning", "p": "A long-term strategist and systems designer. Energy comes from within (I), sees patterns and possibilities (N), decides with logic (T), and likes plans that are completed (J)."}, {"h": "Work style", "ul": ["Starts from the end goal, then works backward to the steps.", "Works best independently, with deep focus and minimal interruption.", "Likes building systems and processes rather than doing the same thing repeatedly.", "High standards, dislikes small talk, a small but close circle."]}, {"h": "Strengths", "ul": ["Long-term strategy and sharp analysis.", "Simplifies complex matters into clear systems.", "Independent and decisive.", "Evaluates ideas critically, including their own."]}, {"h": "Weaknesses", "ul": ["Gives direction without context, so people do not understand the reason.", "Can seem cold or demanding.", "Finds it hard to delegate because of high standards.", "Impatient with those who are slow or seem illogical.", "Overly confident in the model in their own head."]}, {"h": "Good at", "ul": ["Designing strategy.", "Breaking down complex problems.", "Building systems.", "Working without supervision."]}, {"h": "Weak at", "ul": ["Repetitive work that has no meaning for them.", "Small talk and routine rapport-building.", "Managing team emotions.", "Improvising without a plan."]}], "jobs": [{"h": "Strategy and business", "items": ["Founder / CEO", "Chief Strategy Officer", "Management Consultant", "Business Strategist"]}, {"h": "Systems and technology", "items": ["Systems / Enterprise Architect", "Software Architect", "Data Scientist", "Product Strategist"]}, {"h": "Analysis and research", "items": ["Investment Analyst", "Researcher", "Economist"]}, {"h": "Expert professionals", "items": ["Headhunter / Executive Search Consultant", "Talent Strategy Consultant", "Corporate Lawyer"]}], "jobNote": "Tends to work best in roles built around strategy, systems, and independent problem-solving. Roles heavy on routine relationship upkeep or constant pleasing of others may need extra energy or support.", "avoid": "Less suitable: customer service, roles that require constantly pleasing people, rigid hierarchies without autonomy.", "note": "This is a tendency drawn from type literature, not a prediction of performance. Skills and experience matter more than four letters."}, "INTP": {"title": "Profile INTP", "sub": "16Personalities nickname: Logician. Keirsey nickname: Architect. Neither is an official MBTI term.", "blocks": [{"h": "Meaning", "p": "A conceptual analyst. Energy from within (I), sees patterns and possibilities (N), decides with logic (T), and is comfortable keeping options open (P)."}, {"h": "Work style", "ul": ["Thinks deeply about a problem before speaking or acting.", "Works well with autonomy and time to think.", "Interested in theories, models, and how things work.", "Flexible about plans, strict about logic."]}, {"h": "Strengths", "ul": ["Sharp analysis and looks for root causes.", "Creative at building conceptual solutions.", "Objective and open to new ideas.", "Quick to spot gaps in logic."]}, {"h": "Weaknesses", "ul": ["Analyzes for too long before deciding.", "Postpones finishing and struggles with consistent routines.", "Less sensitive in communicating with others.", "Can appear distant or indifferent."]}, {"h": "Good at", "ul": ["Analyzing complex systems and problems.", "Formulating theories and models.", "Finding inconsistencies.", "Independent research."]}, {"h": "Weak at", "ul": ["Administration and routine tasks.", "Rigid deadlines and procedures.", "Small talk and other people's emotional matters.", "Making quick decisions with minimal data."]}], "jobs": [{"h": "Analysis and research", "items": ["Researcher", "Data Scientist", "Economist"]}, {"h": "Technology", "items": ["Software Engineer", "Systems Analyst"]}, {"h": "Strategy", "items": ["Strategy Analyst"]}, {"h": "Academic", "items": ["Lecturer / Researcher"]}], "jobNote": "Tends to work best in roles built around analysis, research, and conceptual problem-solving with room to think. Roles heavy on administration, rigid deadlines, or daily social interaction may need extra support.", "avoid": "Less suitable: jobs full of administrative routine, roles with rigid deadlines and procedures, tasks that demand intense social interaction every day.", "note": "This is a tendency drawn from type literature, not a prediction of performance. Skills and experience matter more than four letters."}, "ENTJ": {"title": "Profile ENTJ", "sub": "16Personalities nickname: Commander. Keirsey nickname: Fieldmarshal. Neither is an official MBTI term.", "blocks": [{"h": "Meaning", "p": "A decisive leader who sets direction and organizes people and resources. Energy from interaction (E), sees the big picture (N), decides with logic (T), and likes plans that are completed (J)."}, {"h": "Work style", "ul": ["Takes charge and sets clear targets.", "Decides quickly and drives execution.", "Likes building structures and long-term plans.", "Speaks directly and demands results."]}, {"h": "Strengths", "ul": ["Leadership and decisive judgment.", "Structured strategy and planning.", "Confident and efficient.", "Able to mobilize people toward a target."]}, {"h": "Weaknesses", "ul": ["Overly dominant or impatient with those who are slow.", "Gives little room to other people's feelings.", "Criticism that sounds harsh.", "Finds it hard to accept direction from someone seen as less competent."]}, {"h": "Good at", "ul": ["Leading and setting direction.", "Building organizational structure.", "Negotiation and difficult decisions.", "Managing large projects."]}, {"h": "Weak at", "ul": ["Listening without interrupting.", "Repetitive detail tasks.", "Managing emotional conflict.", "Working under an authority seen as less competent."]}], "jobs": [{"h": "Leadership", "items": ["CEO / Director", "General Manager", "Chief Operating Officer"]}, {"h": "Business", "items": ["Management Consultant", "Entrepreneur"]}, {"h": "Law and finance", "items": ["Corporate Lawyer", "Investment Banker"]}, {"h": "Strategic sales", "items": ["Business Development Director"]}], "jobNote": "Tends to work best in roles with authority, clear targets, and room to lead and decide. Roles that are purely executional or heavy on routine detail may need extra support.", "avoid": "Less suitable: executor roles without authority, routine administrative work, highly bureaucratic environments.", "note": "This is a tendency drawn from type literature, not a prediction of performance. Skills and experience matter more than four letters."}, "ENTP": {"title": "Profile ENTP", "sub": "16Personalities nickname: Debater. Keirsey nickname: Inventor. Neither is an official MBTI term.", "blocks": [{"h": "Meaning", "p": "An idea challenger who quickly spots opportunities. Energy from interaction (E), sees patterns and possibilities (N), decides with logic (T), and is flexible (P)."}, {"h": "Work style", "ul": ["Many ideas and enjoys testing them through debate.", "Quickly moves on to new challenges.", "Flexible and enjoys improvising.", "Likes questioning the usual way of doing things."]}, {"h": "Strengths", "ul": ["Creative and innovative.", "Learns and adapts quickly.", "Good at arguing and persuading.", "Sees many points of view."]}, {"h": "Weaknesses", "ul": ["Struggles to finish projects that are no longer new.", "Likes to argue to the point of irritating people.", "Inconsistent with routines and details.", "Easily distracted by new ideas."]}, {"h": "Good at", "ul": ["Generating ideas and alternatives.", "Solving problems that have not existed before.", "Presentation and persuasion.", "Reading market opportunities."]}, {"h": "Weak at", "ul": ["Follow-up and administrative tasks.", "Following rigid procedures.", "Repetitive work.", "Sustaining a long-term commitment to one thing."]}], "jobs": [{"h": "Business and innovation", "items": ["Entrepreneur", "Business Development", "Product Strategist"]}, {"h": "Consulting", "items": ["Management Consultant"]}, {"h": "Communication", "items": ["Marketing Strategist", "Public Speaker"]}, {"h": "Law", "items": ["Lawyer / Litigator"]}], "jobNote": "Tends to work best in roles that involve new ideas, persuasion, and varied challenges. Roles heavy on routine follow-up, administration, or long single-track commitments may need extra support.", "avoid": "Less suitable: routine and repetitive work, environments with rigid procedures, roles with little room to experiment.", "note": "This is a tendency drawn from type literature, not a prediction of performance. Skills and experience matter more than four letters."}, "INFJ": {"title": "Profile INFJ", "sub": "16Personalities nickname: Advocate. Keirsey nickname: Counselor. Neither is an official MBTI term.", "blocks": [{"h": "Meaning", "p": "A calm, perceptive guide. Energy from within (I), sees meaning and patterns (N), decides with values and care for people (F), and likes plans that are completed (J)."}, {"h": "Work style", "ul": ["Considers the long-term impact of decisions on people.", "Works well in deep one-on-one relationships.", "Organized and consistent with the values they believe in.", "Needs time alone to recover energy."]}, {"h": "Strengths", "ul": ["Empathy and intuition about people.", "A meaningful long-term vision.", "Calm, deep communication.", "Persistent on what they believe in."]}, {"h": "Weaknesses", "ul": ["Absorbs other people's feelings too much.", "Perfectionist and finds it hard to let go.", "Avoids conflict until it builds up.", "Tires easily when forced to be social constantly."]}, {"h": "Good at", "ul": ["Understanding people's motivations.", "Mentoring individuals.", "Writing and formulating a vision.", "Calm mediation."]}, {"h": "Weak at", "ul": ["Direct confrontation.", "Noisy, constantly changing environments.", "Decisions that conflict with their values.", "Turning down other people's requests."]}], "jobs": [{"h": "People development", "items": ["Psychologist", "Counselor", "HR / Talent Development"]}, {"h": "Education and writing", "items": ["Trainer", "Writer"]}, {"h": "Organization", "items": ["Organizational Development Consultant"]}, {"h": "Social sector", "items": ["Program Manager (nonprofit)"]}], "jobNote": "Tends to work best in roles centered on understanding people, developing them, and working toward meaningful goals. Roles with aggressive selling or frequent open conflict may need extra energy.", "avoid": "Less suitable: aggressive selling, competitive environments full of open conflict, work that conflicts with personal values.", "note": "This is a tendency drawn from type literature, not a prediction of performance. Skills and experience matter more than four letters."}, "INFP": {"title": "Profile INFP", "sub": "16Personalities nickname: Mediator. Keirsey nickname: Healer. Neither is an official MBTI term.", "blocks": [{"h": "Meaning", "p": "A reflective idealist. Energy from within (I), sees meaning and possibilities (N), decides with personal values (F), and is flexible (P)."}, {"h": "Work style", "ul": ["Strongest when work aligns with personal values.", "Needs room to work in their own way.", "Sensitive to atmosphere and people.", "Prefers flexibility over a tight schedule."]}, {"h": "Strengths", "ul": ["Empathy and integrity to their values.", "Creative and imaginative.", "Loyal to people and goals they believe in.", "A good listener."]}, {"h": "Weaknesses", "ul": ["Finds harsh criticism hard to handle.", "Postpones tasks that feel meaningless.", "Finds it hard to set boundaries or say no.", "Too idealistic about reality."]}, {"h": "Good at", "ul": ["Understanding other people's perspectives.", "Writing and creative work.", "Building sincere relationships.", "Finding meaning in work."]}, {"h": "Weak at", "ul": ["Rigid administrative tasks.", "Fierce competition and open conflict.", "Decisions based purely on numbers.", "Following a very tight schedule."]}], "jobs": [{"h": "Creative", "items": ["Writer", "Designer", "Content Creator"]}, {"h": "People development", "items": ["Counselor", "HR Partner", "Coach"]}, {"h": "Social sector", "items": ["Nonprofit Program Officer"]}, {"h": "Research", "items": ["Humanities Researcher"]}], "jobNote": "Tends to work best in roles aligned with personal values, with room to work independently and creatively. Roles with fierce competition, rigid administration, or tight schedules may need extra support.", "avoid": "Less suitable: aggressive target-driven sales, competitive environments, rigid administrative work.", "note": "This is a tendency drawn from type literature, not a prediction of performance. Skills and experience matter more than four letters."}, "ENFJ": {"title": "Profile ENFJ", "sub": "16Personalities nickname: Protagonist. Keirsey nickname: Teacher. Neither is an official MBTI term.", "blocks": [{"h": "Meaning", "p": "A mover of people. Energy from interaction (E), sees potential and meaning (N), decides with values and care (F), and likes plans that are completed (J)."}, {"h": "Work style", "ul": ["Builds relationships and mobilizes groups.", "Pays attention to the development of people on the team.", "Organized and oriented toward team cohesion.", "Communicative and inspiring."]}, {"h": "Strengths", "ul": ["Builds rapport quickly.", "Motivates and mentors people.", "Persuasive communication.", "Organizes groups warmly."]}, {"h": "Weaknesses", "ul": ["Puts other people's needs first too much.", "Finds it hard to deliver unpleasant messages.", "Overly sensitive to criticism.", "Can be too controlling of others."]}, {"h": "Good at", "ul": ["Building long-term relationships.", "Facilitating and coaching.", "Uniting a team.", "Reading group dynamics."]}, {"h": "Weak at", "ul": ["Cold decisions based on numbers alone.", "Working alone for a long time.", "Giving harsh feedback.", "Ignoring people's feelings for the sake of efficiency."]}], "jobs": [{"h": "People development", "items": ["HR / Talent Partner", "Trainer", "Coach"]}, {"h": "Business relations", "items": ["Business Development", "Account Manager"]}, {"h": "Education", "items": ["Teacher", "Program Director"]}, {"h": "Leadership", "items": ["Team Lead"]}], "jobNote": "Tends to work best in roles centered on building relationships, developing people, and bringing a group together. Roles with long stretches of solo analysis or cold, numbers-only decisions may need extra support.", "avoid": "Less suitable: long stretches of solo analytical work, roles that demand cold decisions without relationships, environments full of open conflict.", "note": "This is a tendency drawn from type literature, not a prediction of performance. Skills and experience matter more than four letters."}, "ENFP": {"title": "Profile ENFP", "sub": "16Personalities nickname: Campaigner. Keirsey nickname: Champion. Neither is an official MBTI term.", "blocks": [{"h": "Meaning", "p": "An enthusiastic initiator. Energy from interaction (E), sees possibilities (N), decides with values and care (F), and is flexible (P)."}, {"h": "Work style", "ul": ["Enthusiastic about starting projects and meeting new people.", "Flexible and likes variety.", "Connects people and ideas.", "Motivated by meaning and novelty."]}, {"h": "Strengths", "ul": ["Energetic and spreads enthusiasm.", "Creative with many ideas.", "Builds relationships easily.", "Adaptive to change."]}, {"h": "Weaknesses", "ul": ["Struggles to finish once the novelty is gone.", "Inconsistent with routines and details.", "Easily distracted.", "Takes on too many commitments at once."]}, {"h": "Good at", "ul": ["Starting and promoting ideas.", "Building networks.", "Motivating people.", "Creative thinking across fields."]}, {"h": "Weak at", "ul": ["Administration and routine follow-up.", "Long-term repetitive tasks.", "Working alone without interaction.", "Rigid schedules and procedures."]}], "jobs": [{"h": "Marketing and communication", "items": ["Marketing", "Content", "Public Relations"]}, {"h": "Relations", "items": ["Business Development", "Recruiter"]}, {"h": "People development", "items": ["Trainer", "Coach"]}, {"h": "Entrepreneurship and creative", "items": ["Entrepreneur", "Creative Lead"]}], "jobNote": "Tends to work best in roles with variety, people contact, and room to start and promote ideas. Roles heavy on routine administration and follow-up may need support from systems or colleagues.", "avoid": "Less suitable: routine and administrative work, roles with rigid procedures, solo work without interaction.", "note": "This is a tendency drawn from type literature, not a prediction of performance. Skills and experience matter more than four letters."}, "ISTJ": {"title": "Profile ISTJ", "sub": "16Personalities nickname: Logistician. Keirsey nickname: Inspector. Neither is an official MBTI term.", "blocks": [{"h": "Meaning", "p": "A reliable executor. Energy from within (I), relies on facts and experience (S), decides with logic (T), and likes plans that are completed (J)."}, {"h": "Work style", "ul": ["Works systematically, in sequence, and by procedure.", "Keeps promises and deadlines.", "Relies on data and proven experience.", "Prefers clear, measurable roles."]}, {"h": "Strengths", "ul": ["Thorough and consistent.", "Dependable in completing tasks.", "Disciplined and organized.", "Objective and sticks to facts."]}, {"h": "Weaknesses", "ul": ["Rigid about sudden change.", "Finds it hard to accept new, unproven ways.", "Less expressive about feelings.", "Too harsh on those who break procedure."]}, {"h": "Good at", "ul": ["Managing processes and administration.", "Maintaining quality and compliance.", "Long-term detailed work.", "Keeping commitments."]}, {"h": "Weak at", "ul": ["Improvising in fast-changing situations.", "Work without clear structure.", "Abstract thinking without data.", "Adapting to sudden change."]}], "jobs": [{"h": "Operations", "items": ["Operations Manager", "Project Coordinator"]}, {"h": "Finance and law", "items": ["Accountant", "Auditor", "Compliance Officer"]}, {"h": "Administration and analysis", "items": ["Administrator", "Research / Data Analyst"]}, {"h": "Technical", "items": ["Engineer"]}], "jobNote": "Tends to work best in roles with clear structure, defined procedures, and measurable outcomes. Fast-changing roles that need constant improvisation may need extra energy.", "avoid": "Less suitable: roles without structure, fast-changing environments full of improvisation, work that demands many abstract ideas.", "note": "This is a tendency drawn from type literature, not a prediction of performance. Skills and experience matter more than four letters."}, "ISFJ": {"title": "Profile ISFJ", "sub": "16Personalities nickname: Defender. Keirsey nickname: Protector. Neither is an official MBTI term.", "blocks": [{"h": "Meaning", "p": "A loyal guardian. Energy from within (I), relies on facts and experience (S), decides with values and care (F), and likes plans that are completed (J)."}, {"h": "Work style", "ul": ["Painstaking and attentive to the needs of people around them.", "Works steadily and consistently.", "Remembers details about people and their habits.", "Prefers a harmonious work atmosphere."]}, {"h": "Strengths", "ul": ["Thorough and dependable.", "Caring and supportive.", "Loyal and committed.", "Patient with repetitive work."]}, {"h": "Weaknesses", "ul": ["Finds it hard to say no.", "Avoids conflict and holds on to complaints.", "Reluctant to face big changes.", "Underestimates their own contribution."]}, {"h": "Good at", "ul": ["Providing support and service.", "Maintaining detail and consistency.", "Nurturing long-term relationships.", "Neat administrative tasks."]}, {"h": "Weak at", "ul": ["Confrontation and tough negotiation.", "Putting themselves forward.", "Fast change without preparation.", "Decisions that ignore people."]}], "jobs": [{"h": "Service", "items": ["Customer Success", "Administrator"]}, {"h": "Health and education", "items": ["Nurse", "Teacher"]}, {"h": "HR", "items": ["HR Administration", "Payroll"]}, {"h": "Support operations", "items": ["Office Manager"]}], "jobNote": "Tends to work best in supportive, service-oriented roles with stable routines and a harmonious team. Roles with tough negotiation, strong self-promotion, or rapid change without preparation may need extra energy.", "avoid": "Less suitable: aggressive selling, competitive and conflict-heavy environments, roles that demand rapid change without preparation.", "note": "This is a tendency drawn from type literature, not a prediction of performance. Skills and experience matter more than four letters."}, "ESTJ": {"title": "Profile ESTJ", "sub": "16Personalities nickname: Executive. Keirsey nickname: Supervisor. Neither is an official MBTI term.", "blocks": [{"h": "Meaning", "p": "A decisive manager. Energy from interaction (E), relies on facts (S), decides with logic (T), and likes plans that are completed (J)."}, {"h": "Work style", "ul": ["Likes clear structure, targets, and rules.", "Leads with direct instruction.", "Oriented toward results and efficiency.", "Monitors execution through to completion."]}, {"h": "Strengths", "ul": ["Organized and decisive.", "Upholds standards and accountability.", "Practical and realistic.", "Consistent in executing plans."]}, {"h": "Weaknesses", "ul": ["Rigid about new ways.", "Less patient with those who do not follow rules.", "Overlooks the team's emotional side.", "Can be too controlling."]}, {"h": "Good at", "ul": ["Managing operations and teams.", "Setting targets and monitoring them.", "Enforcing procedures.", "Making practical decisions."]}, {"h": "Weak at", "ul": ["Accepting unproven ideas.", "Being flexible about sudden change.", "Listening to personal problems.", "Work without structure."]}], "jobs": [{"h": "Management", "items": ["Operations Manager", "General Manager", "Project Manager"]}, {"h": "Sales", "items": ["Sales Manager"]}, {"h": "Finance", "items": ["Banking", "Auditor"]}, {"h": "Public administration", "items": ["Administrator / Supervisor"]}], "jobNote": "Tends to work best in roles with clear structure, targets, and authority to manage operations and people. Roles without structure or that demand exploring unproven ideas may need extra support.", "avoid": "Less suitable: work without structure, environments that often change direction, roles that demand exploring abstract ideas.", "note": "This is a tendency drawn from type literature, not a prediction of performance. Skills and experience matter more than four letters."}, "ESFJ": {"title": "Profile ESFJ", "sub": "16Personalities nickname: Consul. Keirsey nickname: Provider. Neither is an official MBTI term.", "blocks": [{"h": "Meaning", "p": "A team nurturer. Energy from interaction (E), relies on facts and experience (S), decides with values and care (F), and likes plans that are completed (J)."}, {"h": "Work style", "ul": ["Warm and attentive to the group's atmosphere.", "Organized and keeps commitments.", "Likes working in a team and maintaining cohesion.", "Values appreciation and cooperation."]}, {"h": "Strengths", "ul": ["Builds relationships and trust.", "Organized and attentive to people's needs.", "Loyal to the team.", "Neat coordination."]}, {"h": "Weaknesses", "ul": ["Too sensitive to criticism and rejection.", "Finds open conflict hard to face.", "Over-follows group norms.", "Less comfortable with ambiguity."]}, {"h": "Good at", "ul": ["Coordinating events and teams.", "Service and customer relations.", "Maintaining group morale.", "Completing tasks together with people."]}, {"h": "Weak at", "ul": ["Working alone for a long time.", "Sharp criticism and conflict.", "Decisions based purely on cold logic.", "Ambiguity without direction."]}], "jobs": [{"h": "Service and relations", "items": ["Account Manager", "Customer Success"]}, {"h": "HR", "items": ["HR Generalist", "Recruiter"]}, {"h": "Education and health", "items": ["Teacher", "Nurse"]}, {"h": "Coordination", "items": ["Event Coordinator", "Office Manager"]}], "jobNote": "Tends to work best in team-based, people-facing roles with clear direction and appreciation. Roles with long solo work, sharp criticism, or high ambiguity may need extra support.", "avoid": "Less suitable: solo work for long periods, environments full of sharp criticism, roles with high ambiguity and no direction.", "note": "This is a tendency drawn from type literature, not a prediction of performance. Skills and experience matter more than four letters."}, "ISTP": {"title": "Profile ISTP", "sub": "16Personalities nickname: Virtuoso. Keirsey nickname: Crafter. Neither is an official MBTI term.", "blocks": [{"h": "Meaning", "p": "A practical problem solver. Energy from within (I), relies on facts (S), decides with logic (T), and is flexible (P)."}, {"h": "Work style", "ul": ["Calm, economical with words, acts when needed.", "Learns by trying things directly.", "Flexible and independent.", "Focuses on how things work."]}, {"h": "Strengths", "ul": ["Quick-handed in real situations and crises.", "Logical and efficient.", "Independent and calm under pressure.", "Skilled with tools and systems."]}, {"h": "Weaknesses", "ul": ["Communicates feelings and plans too little.", "Easily bored by routine.", "Avoids long-term commitments.", "Sometimes takes risks without considering others."]}, {"h": "Good at", "ul": ["Troubleshooting and repair.", "Technical analysis.", "Acting fast in a crisis.", "Working independently."]}, {"h": "Weak at", "ul": ["Long meetings and small talk.", "Abstract long-term planning.", "Administrative tasks.", "Expressing feelings."]}], "jobs": [{"h": "Technical", "items": ["Engineer", "Technician", "Systems Administrator"]}, {"h": "Analysis", "items": ["Data Analyst", "Security Analyst"]}, {"h": "Field operations", "items": ["Logistics", "Operations"]}, {"h": "Hands-on craft", "items": ["Mechanic / Craftsperson"]}], "jobNote": "Tends to work best in hands-on, technical, or analytical roles with independence and room to act. Roles heavy on administration, long meetings, or intense daily social contact may need extra energy.", "avoid": "Less suitable: heavy administrative work, long meetings, roles that demand intense social relations.", "note": "This is a tendency drawn from type literature, not a prediction of performance. Skills and experience matter more than four letters."}, "ISFP": {"title": "Profile ISFP", "sub": "16Personalities nickname: Adventurer. Keirsey nickname: Composer. Neither is an official MBTI term.", "blocks": [{"h": "Meaning", "p": "A flexible doer. Energy from within (I), relies on real experience (S), decides with values (F), and is flexible (P)."}, {"h": "Work style", "ul": ["Calm and works in their own way.", "Sensitive to surroundings and people.", "Prefers to act rather than talk a lot.", "Values freedom and personal space."]}, {"h": "Strengths", "ul": ["Sensitive and attentive.", "Flexible and adapts easily.", "Aesthetic sense and practical skills.", "Loyal to values and those close to them."]}, {"h": "Weaknesses", "ul": ["Avoids conflict and confrontation.", "Does not showcase their own achievements.", "Dislikes deadline pressure and rigid plans.", "Finds it hard to voice their wishes."]}, {"h": "Good at", "ul": ["Creative and practical work.", "Caring for and supporting people.", "Adapting quickly.", "Working with hands and senses."]}, {"h": "Weak at", "ul": ["Competition and open conflict.", "Rigid long-term planning.", "Presentations that put themselves in the spotlight.", "Heavy administration."]}], "jobs": [{"h": "Creative", "items": ["Designer", "Photographer"]}, {"h": "Health and care", "items": ["Nurse", "Therapist"]}, {"h": "Service", "items": ["Hospitality"]}, {"h": "Practical", "items": ["Craft / Technical"]}], "jobNote": "Tends to work best in practical, creative, or caring roles with personal space and flexibility. Competitive environments, constant self-promotion, or heavy administration may need extra energy.", "avoid": "Less suitable: competitive, conflict-heavy environments, roles that demand constant self-promotion, heavy administration.", "note": "This is a tendency drawn from type literature, not a prediction of performance. Skills and experience matter more than four letters."}, "ESTP": {"title": "Profile ESTP", "sub": "16Personalities nickname: Entrepreneur. Keirsey nickname: Promoter. Neither is an official MBTI term.", "blocks": [{"h": "Meaning", "p": "A fast mover. Energy from interaction (E), relies on facts and experience (S), decides with logic (T), and is flexible (P)."}, {"h": "Work style", "ul": ["Spontaneous and likes acting directly.", "Realistic and focused on tangible results.", "Comfortable in fast-moving situations.", "Learns through experience."]}, {"h": "Strengths", "ul": ["Quick to read situations and opportunities.", "Persuasive and confident.", "Pragmatic in facing problems.", "Calm under pressure."]}, {"h": "Weaknesses", "ul": ["Impatient with theory and long plans.", "Takes risks without careful thought.", "Overlooks long-term consequences.", "Bored by routine."]}, {"h": "Good at", "ul": ["Negotiation and selling.", "Handling a crisis.", "Building connections quickly.", "Taking action."]}, {"h": "Weak at", "ul": ["Long-term planning.", "Administrative tasks.", "Abstract theory.", "Commitment to slow processes."]}], "jobs": [{"h": "Sales", "items": ["Sales", "Business Development"]}, {"h": "Entrepreneurship", "items": ["Entrepreneur"]}, {"h": "Field operations", "items": ["Operations", "Logistics"]}, {"h": "Finance", "items": ["Trader"]}], "jobNote": "Tends to work best in fast-moving, action-oriented roles with tangible results and people contact. Roles with slow processes, heavy documentation, or long-term planning may need extra support.", "avoid": "Less suitable: heavy administrative work, roles with slow processes and lots of documentation, theoretical research.", "note": "This is a tendency drawn from type literature, not a prediction of performance. Skills and experience matter more than four letters."}, "ESFP": {"title": "Profile ESFP", "sub": "16Personalities nickname: Entertainer. Keirsey nickname: Performer. Neither is an official MBTI term.", "blocks": [{"h": "Meaning", "p": "A livener of the atmosphere. Energy from interaction (E), relies on real experience (S), decides with values (F), and is flexible (P)."}, {"h": "Work style", "ul": ["Warm and spontaneous.", "Learns from direct experience.", "Enjoys working with people.", "Flexible and likes variety."]}, {"h": "Strengths", "ul": ["Easily becomes friendly and lifts the mood.", "Practical and adaptive.", "Sensitive to people's needs.", "Enthusiastic and optimistic."]}, {"h": "Weaknesses", "ul": ["Struggles with long-term plans and administration.", "Avoids unpleasant problems.", "Easily distracted.", "Prioritizes present enjoyment."]}, {"h": "Good at", "ul": ["Relationships with people and customers.", "Presentation and performance.", "Energizing a team.", "Adapting quickly."]}, {"h": "Weak at", "ul": ["Lonely solo work.", "Planning and documentation.", "Long abstract analysis.", "Repetitive tasks."]}], "jobs": [{"h": "Service", "items": ["Customer Service", "Hospitality"]}, {"h": "Sales", "items": ["Sales"]}, {"h": "Entertainment and communication", "items": ["MC", "Event"]}, {"h": "Education and health", "items": ["Teacher", "Caregiver"]}], "jobNote": "Tends to work best in lively, people-facing roles with variety and hands-on experience. Roles with isolated solo work, heavy documentation, or long abstract analysis may need extra support.", "avoid": "Less suitable: solo, isolated work, heavy documentation and long analysis, repetitive tasks.", "note": "This is a tendency drawn from type literature, not a prediction of performance. Skills and experience matter more than four letters."}};

const app = express();
const ADMIN_CODE = process.env.ADMIN_CODE || "MIDAS2026";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : undefined,
});

let schemaPromise = null;
function ensureSchema() {
  if (!schemaPromise) {
    schemaPromise = pool.query(`
      CREATE TABLE IF NOT EXISTS submissions (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        role TEXT,
        email TEXT,
        stage TEXT,
        assessor TEXT,
        date TIMESTAMPTZ NOT NULL,
        value_scores JSONB NOT NULL,
        total INTEGER NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      ALTER TABLE submissions ADD COLUMN IF NOT EXISTS gender TEXT;
      ALTER TABLE submissions ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ;
      CREATE TABLE IF NOT EXISTS profiling_results (
        candidate_id TEXT PRIMARY KEY REFERENCES submissions(id) ON DELETE CASCADE,
        answers JSONB NOT NULL,
        score_ei INTEGER NOT NULL,
        score_sn INTEGER NOT NULL,
        score_tf INTEGER NOT NULL,
        score_jp INTEGER NOT NULL,
        type TEXT NOT NULL,
        completed_at TIMESTAMPTZ NOT NULL,
        test_version TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);
  }
  return schemaPromise;
}

app.use(express.json({ limit: "1mb" }));

app.use(async (req, res, next) => {
  try {
    await ensureSchema();
    next();
  } catch (err) {
    console.error("Schema init failed:", err);
    res.status(500).json({ error: "Database not ready" });
  }
});

function requireAdmin(req, res, next) {
  const code = req.get("x-admin-code");
  if (!code || code !== ADMIN_CODE) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

function rowToEntry(r) {
  return {
    id: r.id,
    name: r.name,
    gender: r.gender || "",
    role: r.role || "",
    email: r.email || "",
    stage: r.stage || "",
    assessor: r.assessor || "",
    date: r.date,
    startedAt: r.started_at,
    valueScores: r.value_scores,
    total: r.total,
  };
}

app.post("/api/submissions", async (req, res) => {
  try {
    const e = req.body || {};
    if (!e.id || !e.name || !e.valueScores || typeof e.total !== "number") {
      return res.status(400).json({ error: "Invalid submission payload" });
    }
    await pool.query(
      `INSERT INTO submissions (id, name, gender, role, email, stage, assessor, date, started_at, value_scores, total)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       ON CONFLICT (id) DO NOTHING`,
      [e.id, e.name, e.gender || "", e.role || "", e.email || "", e.stage || "", e.assessor || "",
       e.date || new Date().toISOString(), e.startedAt || null, JSON.stringify(e.valueScores), e.total]
    );
    res.status(201).json({ ok: true });
  } catch (err) {
    console.error("POST /api/submissions failed:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/submissions", requireAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, name, gender, role, email, stage, assessor, date, started_at, value_scores, total FROM submissions ORDER BY date DESC"
    );
    res.json(rows.map(rowToEntry));
  } catch (err) {
    console.error("GET /api/submissions failed:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.delete("/api/submissions/:id", requireAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM submissions WHERE id=$1", [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/submissions/:id failed:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.delete("/api/submissions", requireAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM submissions");
    res.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/submissions failed:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/profiling", async (req, res) => {
  try {
    const b = req.body || {};
    const a = b.answers, s = b.scores;
    // Admin-only manual import (result taken from another source, no raw answers).
    const isManual = b.testVersion === "manual-import";
    if (isManual && req.get("x-admin-code") !== ADMIN_CODE) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const okAnswers = isManual ? true : (a && typeof a === "object" &&
      Array.from({ length: 32 }, (_, i) => "q" + String(i + 1).padStart(2, "0"))
        .every(k => Number.isInteger(a[k]) && a[k] >= 1 && a[k] <= 4));
    const okScores = s && ["EI", "SN", "TF", "JP"].every(k => Number.isInteger(s[k]) && Math.abs(s[k]) <= 24);
    if (!b.candidateId || !okAnswers || !okScores || !/^[A-Z]{4}$/.test(b.type || "")) {
      return res.status(400).json({ error: "Invalid profiling payload" });
    }
    await pool.query(
      `INSERT INTO profiling_results (candidate_id, answers, score_ei, score_sn, score_tf, score_jp, type, completed_at, test_version)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       ON CONFLICT (candidate_id) DO NOTHING`,
      [b.candidateId, JSON.stringify(isManual ? {} : a), s.EI, s.SN, s.TF, s.JP, b.type,
       b.completedAt || new Date().toISOString(), b.testVersion || "profiling-v1"]
    );
    res.status(201).json({ ok: true });
  } catch (err) {
    if (err && err.code === "23503") return res.status(404).json({ error: "Candidate not found" });
    console.error("POST /api/profiling failed:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/profiling", requireAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT candidate_id, answers, score_ei, score_sn, score_tf, score_jp, type, completed_at, test_version FROM profiling_results"
    );
    res.json(rows.map(r => ({
      candidateId: r.candidate_id,
      answers: r.answers,
      scores: { EI: r.score_ei, SN: r.score_sn, TF: r.score_tf, JP: r.score_jp },
      type: r.type,
      completedAt: r.completed_at,
      testVersion: r.test_version,
    })));
  } catch (err) {
    console.error("GET /api/profiling failed:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Public, minimal: tells the personal Profiling link whether the id is valid / already done.
app.get("/api/profiling-status/:id", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT (SELECT COUNT(*) FROM submissions WHERE id=$1) AS s, (SELECT COUNT(*) FROM profiling_results WHERE candidate_id=$1) AS p",
      [req.params.id]
    );
    res.json({ exists: Number(rows[0].s) > 0, done: Number(rows[0].p) > 0 });
  } catch (err) {
    console.error("GET /api/profiling-status failed:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/profiling-profiles", requireAdmin, (req, res) => res.json(PROFILES));

app.get("/healthz", (req, res) => res.json({ ok: true }));

module.exports = app;
