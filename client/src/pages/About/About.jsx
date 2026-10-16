import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Brain, 
  Target, 
  Compass, 
  Sparkles, 
  Award, 
  Users, 
  ArrowRight, 
  Rocket, 
  ShieldCheck, 
  Heart 
} from 'lucide-react';
import './About.css';

export default function About() {
  const teamMembers = [
    {
      name: "Dr. Evelyn Vance",
      role: "Co-Founder & Chief AI Officer",
      bio: "Former AI research lead with a Ph.D. in NLP. Dedicated to making assessment generation intuitive and pedagogically sound.",
      avatar: "EV",
      gradient: "linear-gradient(135deg, #05C46B 0%, #FF9F43 100%)",
      socials: { github: "#", linkedin: "#", twitter: "#" }
    },
    {
      name: "Marcus Chen",
      role: "Co-Founder & Head of Product",
      bio: "EdTech innovator with 10+ years of experience designing platforms that empower teachers and engage students.",
      avatar: "MC",
      gradient: "linear-gradient(135deg, #05C46B 0%, #121218 100%)",
      socials: { github: "#", linkedin: "#", twitter: "#" }
    },
    {
      name: "Sarah Jenkins",
      role: "Lead Full-Stack Architect",
      bio: "Passionate about building scalable systems, high-performance APIs, and fluid, responsive interfaces.",
      avatar: "SJ",
      gradient: "linear-gradient(135deg, #FF9F43 0%, #121218 100%)",
      socials: { github: "#", linkedin: "#", twitter: "#" }
    }
  ];

  const values = [
    {
      icon: <Sparkles className="value-icon" size={24} />,
      title: "Pioneering Innovation",
      description: "We harness the power of advanced large language models to deliver state-of-the-art diagnostic evaluations in seconds."
    },
    {
      icon: <ShieldCheck className="value-icon" size={24} />,
      title: "Academic Integrity",
      description: "We are committed to delivering high-accuracy, pedagogically verified questions that align with standardized cognitive domains."
    },
    {
      icon: <Users className="value-icon" size={24} />,
      title: "Universal Design",
      description: "We build intuitive platforms designed to empower teachers, trainers, and self-learners regardless of technical proficiency."
    },
    {
      icon: <Heart className="value-icon" size={24} />,
      title: "Learner-Centricity",
      description: "Our features are designed to stimulate curiosities, provide instant explanatory feedback, and enable structured skill growth."
    }
  ];

  const milestones = [
    {
      year: "2025",
      title: "The Genesis",
      description: "Founded with the mission to solve standard assessment creation fatigue by automating high-quality curriculum evaluation using generative AI."
    },
    {
      year: "Late 2025",
      title: "QuestAI Engine v1.0",
      description: "Developed and fine-tuned our specialized contextual parsing models to extract question taxonomies across multiple difficulty thresholds."
    },
    {
      year: "2026",
      title: "Global Classroom Expansion",
      description: "Deployed globally, helping over 50,000 instructors automate quiz-creation workflows and gain real-time performance analytics."
    }
  ];

  return (
    <div className="about-page">
      {/* Background Orbs */}
      <div className="bg-gradient-orb orb-1"></div>
      <div className="bg-gradient-orb orb-2"></div>
      <div className="bg-gradient-orb orb-3"></div>

      {/* Hero Section */}
      <section className="about-hero">
        <div className="hero-container">
          <div className="about-badge">
            <Brain size={14} className="about-badge-icon" />
            <span>Behind the Assessment Engine</span>
          </div>
          <h1 className="about-title">
            Revolutionizing How the World <br />
            <span className="gradient-text">Measures Knowledge</span>
          </h1>
          <p className="about-subtitle">
            QuestAI was built to bridge the gap between educational content and interactive, multi-dimensional assessment. We use artificial intelligence to automate creation, so you can focus on comprehension.
          </p>
          <div className="about-stats-grid">
            <div className="stat-card">
              <span className="stat-number">5M+</span>
              <span className="stat-label">Quizzes Generated</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">99.8%</span>
              <span className="stat-label">System Uptime</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">50K+</span>
              <span className="stat-label">Active Educators</span>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="about-mission-vision">
        <div className="mission-vision-container">
          <div className="mission-card shimmer-card-glow">
            <div className="card-icon-wrapper purple">
              <Sparkles size={28} />
            </div>
            <h2>Our Mission</h2>
            <p>
              To democratize standard assessments by empowering instructors with high-accuracy, personalized, and robust AI creation tools. We want to convert static reading lists, study guides, and lecture transcripts into highly engaging, dynamic feedback loops instantly.
            </p>
            <div className="card-bg-glow"></div>
          </div>

          <div className="mission-card shimmer-card-glow">
            <div className="card-icon-wrapper cyan">
              <Compass size={28} />
            </div>
            <h2>Our Vision</h2>
            <p>
              To lead the paradigm shift toward automated instruction design, building a universe where customized assessments are dynamically generated in real-time to match each individual learner's unique pace, cognitive style, and strengths.
            </p>
            <div className="card-bg-glow"></div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="about-values">
        <div className="section-header">
          <h2 className="section-title">Values That Drive Us</h2>
          <p className="section-subtitle">
            We hold ourselves to rigorous engineering and pedagogical standards to deliver a product you can trust blindly.
          </p>
        </div>
        <div className="values-grid">
          {values.map((v, i) => (
            <div key={i} className="value-card shimmer-card-glow">
              <div className="value-icon-box">{v.icon}</div>
              <h3>{v.title}</h3>
              <p>{v.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline Section */}
      <section className="about-timeline">
        <div className="section-header">
          <h2 className="section-title">Our Growth Story</h2>
          <p className="section-subtitle">
            From a localized prototype to a globally adopted assessment generation infrastructure.
          </p>
        </div>
        <div className="timeline-container">
          <div className="timeline-line"></div>
          {milestones.map((m, i) => (
            <div key={i} className={`timeline-item ${i % 2 === 0 ? 'left' : 'right'}`}>
              <div className="timeline-content">
                <div className="timeline-year">{m.year}</div>
                <h3>{m.title}</h3>
                <p>{m.description}</p>
              </div>
              <div className="timeline-dot">
                <Rocket size={14} className="dot-icon" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Team Section */}
      <section className="about-team">
        <div className="section-header">
          <h2 className="section-title">Meet the Visionaries</h2>
          <p className="section-subtitle">
            The collection of researchers, product builders, and educators behind QuestAI.
          </p>
        </div>
        <div className="team-grid">
           {teamMembers.map((member, idx) => (
            <div key={idx} className="team-card shimmer-card-glow">
              <div className="avatar-wrapper">
                <div 
                  className="team-avatar-initials" 
                  style={{ background: member.gradient }}
                >
                  {member.avatar}
                </div>
                <div className="avatar-ring"></div>
              </div>
              <h3 className="member-name">{member.name}</h3>
              <span className="member-role">{member.role}</span>
              <p className="member-bio">{member.bio}</p>
              <div className="member-socials">
                <a href={member.socials.github} className="team-social-icon" aria-label="GitHub">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path></svg>
                </a>
                <a href={member.socials.linkedin} className="team-social-icon" aria-label="LinkedIn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect width="4" height="12" x="2" y="9"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                </a>
                <a href={member.socials.twitter} className="team-social-icon" aria-label="Twitter">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="about-cta">
        <div className="cta-container">
          <div className="cta-glow"></div>
          <h2>Accelerate Assessment Workflows</h2>
          <p>
            Join thousands of instructors using QuestAI to create multiple-choice, fill-in-the-blank, and short-answer evaluations instantly.
          </p>
          <Link 
            to="/demo"
            className="cta-btn"
          >
            Try Interactive Demo
            <ArrowRight size={16} className="cta-btn-arrow" />
          </Link>
        </div>
      </section>
    </div>
  );
}
