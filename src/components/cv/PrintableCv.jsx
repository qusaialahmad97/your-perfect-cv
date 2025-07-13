// src/components/cv/PrintableCv.jsx
import React, { forwardRef } from 'react';
import './PrintableCv.css'; // Your CSS file

// Reusable Section Component for consistent styling and dividers
// This component now takes primaryColor and dividerColor directly for its own styling
const Section = ({ title, children, primaryColor, dividerColor }) => (
  <section className="cv-section">
    <h2 style={{ color: 'var(--primary-color)' }}>{title}</h2>
    <div 
      className="section-divider" 
      style={{ backgroundColor: 'var(--divider-color)' }}
    ></div>
    {children}
  </section>
);

// Helper component for rendering bulleted lists
const BulletList = ({ content }) => {
  if (!content) return null;

  // Split by newline, filter empty lines, and remove common bullet prefixes if any
  const items = String(content)
    .split('\n')
    .filter(line => line.trim() !== '')
    .map(line => line.replace(/^[-•*]\s*/, '').trim()); // Added '*' to catch more bullet types

  if (items.length === 0) return null;

  return (
    <ul className="bullet-list">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
};

// Main PrintableCv component, wrapped with forwardRef
const PrintableCv = forwardRef(({ data, primaryColor: propPrimaryColor, settings = {} }, ref) => {
  // Defensive check if data is null (e.g., during initial load)
  if (!data) {
    return (
      <div ref={ref} className="cv-container printable-content">
        <p>No CV data available to print.</p>
      </div>
    );
  }

  // Destructure CV data with default empty objects/arrays to prevent errors
  const {
    personalInformation = {},
    summary = '',
    experience = [],
    education = [],
    skills = {},
    projects = [],
    references = [],
    awards = [],
    courses = [],
    certifications = [],
    customSections = []
  } = data;

  // Use settings for dynamic styles, fallback to propPrimaryColor then a hardcoded default
  const effectivePrimaryColor = settings.primaryColor || propPrimaryColor || '#2563EB';
  const effectiveDividerColor = settings.dividerColor || '#e0e0e0';
  const effectiveFontSize = settings.fontSize || '11pt';
  const effectiveLineHeight = settings.lineHeight || '1.4';
  const effectiveFontFamily = settings.fontFamily || 'Inter, sans-serif';
  const effectiveTemplateId = settings.templateId || 'modern'; // Get the template ID

  // --- FIX FOR formatContact (Option A) ---
  const formatContact = () => {
    const parts = [];
    if (personalInformation.email) parts.push(personalInformation.email);
    if (personalInformation.phone) parts.push(personalInformation.phone);
    if (personalInformation.linkedin) parts.push(personalInformation.linkedin);

    if (parts.length > 0) {
      return parts.join(' | ');
    }
    return personalInformation.contact || '';
  };
  // --- END FIX ---

  const formatLocation = () => {
    const parts = [];
    if (personalInformation.city) parts.push(personalInformation.city);
    if (personalInformation.country) parts.push(personalInformation.country);
    return parts.join(', ');
  };

  return (
    <div
      ref={ref}
      // Add the template-specific class name here
      className={`cv-container printable-content template-${effectiveTemplateId}`}
      style={{
        fontSize: effectiveFontSize,
        lineHeight: effectiveLineHeight,
        fontFamily: effectiveFontFamily,
        '--primary-color': effectivePrimaryColor,
        '--divider-color': effectiveDividerColor
      }}
    >
      {/* Header */}
      <header className="cv-header">
        <h1>{personalInformation.name || 'Your Name'}</h1>
        {formatContact() && <p className="contact-info">{formatContact()}</p>}
        {formatLocation() && <p className="location">{formatLocation()}</p>}
        {personalInformation.portfolioLink && (
          <a
            href={
              personalInformation.portfolioLink.includes('://')
                ? personalInformation.portfolioLink
                : `https://${personalInformation.portfolioLink}`
            }
            target="_blank"
            rel="noopener noreferrer"
            className="portfolio-link"
          >
            {personalInformation.portfolioLink}
          </a>
        )}
      </header>

      {/* Professional Summary */}
      {summary && (
        <Section title="Professional Summary" primaryColor={effectivePrimaryColor} dividerColor={effectiveDividerColor}>
          <p className="summary-text">{summary}</p>
        </Section>
      )}

      {/* Work Experience */}
      {experience.length > 0 && (
        <Section title="Work Experience" primaryColor={effectivePrimaryColor} dividerColor={effectiveDividerColor}>
          {experience.map((exp, i) => (
            <div key={i} className="entry">
              <div className="entry-header">
                <h3>
                  {exp.jobTitle || exp.title}
                  {exp.company && ` at ${exp.company}`}
                </h3>
                {(exp.duration || exp.startDate || exp.endDate) && (
                  <span className="duration">
                    {exp.duration || `${exp.startDate || ''} - ${exp.endDate || 'Present'}`}
                  </span>
                )}
              </div>
              {(exp.responsibilities || exp.description) && (
                <>
                  <h4>Responsibilities:</h4>
                  <BulletList content={exp.responsibilities || exp.description} />
                </>
              )}
              {exp.achievements && (
                <>
                  <h4>Achievements:</h4>
                  <BulletList content={exp.achievements} />
                </>
              )}
            </div>
          ))}
        </Section>
      )}

      {/* Education */}
      {education.length > 0 && (
        <Section title="Education" primaryColor={effectivePrimaryColor} dividerColor={effectiveDividerColor}>
          {education.map((edu, i) => (
            <div key={i} className="entry">
              <div className="entry-header">
                <h3>
                  {edu.degree}
                  {edu.institution && ` - ${edu.institution}`}
                  {!edu.institution && edu.university && ` - ${edu.university}`} {/* Fallback for university */}
                </h3>
                {(edu.gradDate || edu.year) && (
                  <span className="date">
                    {edu.gradDate || edu.year}
                  </span>
                )}
              </div>
              {edu.gpa && <p className="gpa">GPA: {edu.gpa}</p>}
              {edu.field && <p className="field-of-study">{edu.field}</p>}
            </div>
          ))}
        </Section>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <Section title="Projects" primaryColor={effectivePrimaryColor} dividerColor={effectiveDividerColor}>
          {projects.map((project, i) => (
            <div key={i} className="entry">
              <div className="entry-header">
                <h3>{project.name}</h3>
                {project.technologies && <span className="tech">{project.technologies}</span>}
              </div>
              {project.description && <BulletList content={project.description} />}
            </div>
          ))}
        </Section>
      )}

      {/* Skills */}
      {(skills.technical || skills.soft || skills.languages) && (
        <Section title="Skills" primaryColor={effectivePrimaryColor} dividerColor={effectiveDividerColor}>
          {skills.technical && (
            <div className="skills-group">
              <strong>Technical:</strong> {skills.technical}
            </div>
          )}
          {skills.soft && (
            <div className="skills-group">
              <strong>Soft:</strong> {skills.soft}
            </div>
          )}
          {skills.languages && (
            <div className="skills-group">
              <strong>Languages:</strong> {skills.languages}
            </div>
          )}
        </Section>
      )}

      {/* --- NEW SECTIONS --- */}
      {/* References */}
      {references.length > 0 && (
        <Section title="References" primaryColor={effectivePrimaryColor} dividerColor={effectiveDividerColor}>
          <ul className="bullet-list">
            {references.map((refItem, i) => (
              <li key={i}>
                {refItem.name && <p className="font-semibold">{refItem.name}</p>}
                {refItem.position && <p className="text-sm text-gray-700">{refItem.position}</p>}
                {refItem.phone && <p className="text-sm text-gray-700">Phone: {refItem.phone}</p>}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-gray-600">References available upon request.</p>
        </Section>
      )}

      {/* Awards & Recognitions */}
      {awards.length > 0 && (
        <Section title="Awards & Recognitions" primaryColor={effectivePrimaryColor} dividerColor={effectiveDividerColor}>
          <ul className="bullet-list">
            {awards.map((item, i) => (
              <li key={i}>
                <p className="font-semibold">{item.title}</p>
                {(item.year || item.issuer) && (
                    <span className="text-sm text-gray-700">
                        {item.issuer && <span>{item.issuer}</span>}
                        {item.year && <span> ({item.year})</span>}
                    </span>
                )}
                {item.description && <p className="text-sm">{item.description}</p>}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Courses */}
      {courses.length > 0 && (
        <Section title="Courses" primaryColor={effectivePrimaryColor} dividerColor={effectiveDividerColor}>
          <ul className="bullet-list">
            {courses.map((item, i) => (
              <li key={i}>
                <p className="font-semibold">{item.title}</p>
                {(item.institution || item.year) && (
                    <span className="text-sm text-gray-700">
                        {item.institution && <span> - {item.institution}</span>}
                        {item.year && <span> ({item.year})</span>}
                    </span>
                )}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Certifications */}
      {certifications.length > 0 && (
        <Section title="Certifications" primaryColor={effectivePrimaryColor} dividerColor={effectiveDividerColor}>
          <ul className="bullet-list">
            {certifications.map((item, i) => (
              <li key={i}>
                <p className="font-semibold">{item.title}</p>
                {(item.issuingBody || item.year) && (
                    <span className="text-sm text-gray-700">
                        {item.issuingBody && <span> - {item.issuingBody}</span>}
                        {item.year && <span> ({item.year})</span>}
                    </span>
                )}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Custom Sections */}
      {customSections.length > 0 && (
        <>
          {customSections.map((item, i) => (
            <Section key={i} title={item.header || "Custom Section"} primaryColor={effectivePrimaryColor} dividerColor={effectiveDividerColor}>
              <p>{item.content}</p>
            </Section>
          ))}
        </>
      )}

    </div>
  );
});

PrintableCv.displayName = 'PrintableCv';

export default PrintableCv;