// src/components/cv/PrintableCv.jsx
import React, { forwardRef } from 'react';
import './PrintableCv.css'; // Your CSS file

// Reusable Section Component for consistent styling and dividers
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

// Helper component for rendering bulleted lists AND general HTML
const BulletList = ({ content }) => {
  // Check for null/undefined or empty HTML content before rendering
  if (!content || content === '<p></p>' || content === '<p><br></p>') {
      return null;
  }
  // Safely render content that is already HTML
  return <div dangerouslySetInnerHTML={{ __html: content }} />;
};

// Main PrintableCv component, wrapped with forwardRef
const PrintableCv = forwardRef(({ data, primaryColor: propPrimaryColor, settings = {} }, ref) => {
  if (!data) {
    return (
      <div ref={ref} className="cv-container printable-content">
        <p>No CV data available to display.</p>
      </div>
    );
  }

  const {
    personalInformation = {},
    summary = '',
    experience = [],
    education = [],
    skills = {}, 
    languages = '', 
    projects = [], 
    references = [],
    awards = [],
    courses = [],
    certifications = [],
    customSections = []
  } = data;

  const effectivePrimaryColor = settings.primaryColor || propPrimaryColor || '#2563EB';
  const effectiveDividerColor = settings.dividerColor || '#e0e0e0';
  const effectiveParagraphFontSize = settings.paragraphFontSize || '11pt';
  const effectiveHeaderFontSize = settings.headerFontSize || '14pt';
  const effectiveLineHeight = settings.lineHeight || '1.4';
  const effectiveFontFamily = settings.fontFamily || 'Inter, sans-serif';
  const effectiveTemplateId = settings.templateId || 'modern';

  const effectiveSectionOrder = settings.sectionOrder || [
    'summary', 'experience', 'education', 'projects', 'skills', 'languages', 'references',
    'awards', 'courses', 'certifications', 'customSections'
  ];

  const formatContact = () => {
    const parts = [];
    if (personalInformation.email) parts.push(personalInformation.email);
    if (personalInformation.phone) parts.push(personalInformation.phone);
    if (personalInformation.linkedin) parts.push(personalInformation.linkedin);
    return parts.length > 0 ? parts.join(' | ') : '';
  };

  const formatLocation = () => {
    const parts = [];
    if (personalInformation.city) parts.push(personalInformation.city);
    if (personalInformation.country) parts.push(personalInformation.country);
    return parts.join(', ');
  };

  const renderSectionContent = (sectionId) => {
    switch (sectionId) {
      case 'summary':
        return summary && (
          <Section title="Professional Summary" primaryColor={effectivePrimaryColor} dividerColor={effectiveDividerColor}>
            <div className="summary-content" dangerouslySetInnerHTML={{ __html: summary }} />
          </Section>
        );
      
      case 'experience':
        return experience.length > 0 && (
          <Section title="Work Experience" primaryColor={effectivePrimaryColor} dividerColor={effectiveDividerColor}>
            {experience.map((exp, i) => (
              <div key={exp.id || i} className="entry">
                <div className="entry-header">
                  <h3>
                    {/* FIXED: Use 'role' as primary, fallback to old 'jobTitle' */}
                    {exp.role || exp.jobTitle}
                    {/* FIXED: Display company and new 'location' field */}
                    {exp.company && ` at ${exp.company}${exp.location ? `, ${exp.location}` : ''}`}
                  </h3>
                  {/* FIXED: Use 'startDate' and 'endDate' */}
                  {(exp.startDate || exp.endDate) && (
                    <span className="duration">
                      {`${exp.startDate || ''} - ${exp.endDate || 'Present'}`}
                    </span>
                  )}
                </div>

                {/* This part was already correct and respects the visibility flags */}
                {(exp.showResponsibilities !== false && exp.responsibilities) && (
                  <>
                    <h4>Responsibilities:</h4>
                    <BulletList content={exp.responsibilities} />
                  </>
                )}

                {(exp.showAchievements !== false && exp.achievements) && (
                  <>
                    <h4>Achievements:</h4>
                    <BulletList content={exp.achievements} />
                  </>
                )}
              </div>
            ))}
          </Section>
        );

      case 'education':
        return education.length > 0 && (
          <Section title="Education" primaryColor={effectivePrimaryColor} dividerColor={effectiveDividerColor}>
            {education.map((edu, i) => (
              <div key={i} className="entry">
                <div className="entry-header">
                  <h3>
                    {edu.degree}
                     {/* FIXED: Display institution and new 'location' field */}
                    {edu.institution && ` - ${edu.institution}${edu.location ? `, ${edu.location}` : ''}`}
                  </h3>
                   {/* FIXED: Use 'graduationYear' as primary, with fallbacks for old data */}
                  {(edu.graduationYear || edu.gradDate || edu.year) && <span className="date">{edu.graduationYear || edu.gradDate || edu.year}</span>}
                </div>
              </div>
            ))}
          </Section>
        );

      case 'projects':
        return projects.length > 0 && (
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
        );
        
      case 'skills':
        return (skills.technical || skills.soft) && (
          <Section title="Skills" primaryColor={effectivePrimaryColor} dividerColor={effectiveDividerColor}>
            {skills.technical && <div className="skills-group"><strong>Technical:</strong> {skills.technical}</div>}
            {skills.soft && <div className="skills-group"><strong>Soft:</strong> {skills.soft}</div>}
          </Section>
        );

      case 'languages': 
        return languages && (
          <Section title="Languages" primaryColor={effectivePrimaryColor} dividerColor={effectiveDividerColor}>
            <p className="languages-text">{languages}</p>
          </Section>
        );

      case 'references':
        return references.length > 0 && (
          <Section title="References" primaryColor={effectivePrimaryColor} dividerColor={effectiveDividerColor}>
            <p className="mt-2 text-xs text-gray-600">References available upon request.</p>
          </Section>
        );
        
      case 'awards':
        return awards.length > 0 && (
          <Section title="Awards & Recognitions" primaryColor={effectivePrimaryColor} dividerColor={effectiveDividerColor}>
            <ul className="bullet-list-plain">
              {awards.map((item, i) => (
                <li key={i}>
                  <p className="font-semibold">{item.title}</p>
                  {(item.year || item.issuer) && (<span className="text-sm text-gray-700">{item.issuer && <span>{item.issuer}</span>}{item.year && <span> ({item.year})</span>}</span>)}
                  {item.description && <p className="text-sm">{item.description}</p>}
                </li>
              ))}
            </ul>
          </Section>
        );
        
      case 'courses':
        return courses.length > 0 && (
          <Section title="Courses" primaryColor={effectivePrimaryColor} dividerColor={effectiveDividerColor}>
            <ul className="bullet-list-plain">
              {courses.map((item, i) => (
                <li key={i}>
                  <p className="font-semibold">{item.title}</p>
                  {(item.institution || item.year) && (<span className="text-sm text-gray-700">{item.institution && <span> - {item.institution}</span>}{item.year && <span> ({item.year})</span>}</span>)}
                </li>
              ))}
            </ul>
          </Section>
        );
        
      case 'certifications':
        return certifications.length > 0 && (
          <Section title="Certifications" primaryColor={effectivePrimaryColor} dividerColor={effectiveDividerColor}>
            <ul className="bullet-list-plain">
              {certifications.map((item, i) => (
                <li key={i}>
                  <p className="font-semibold">{item.title}</p>
                  {(item.issuingBody || item.year) && (<span className="text-sm text-gray-700">{item.issuingBody && <span> - {item.issuingBody}</span>}{item.year && <span> ({item.year})</span>}</span>)}
                </li>
              ))}
            </ul>
          </Section>
        );
        
      case 'customSections':
        return customSections.length > 0 && (
          <>
            {customSections.map((item, i) => (
              item.header && item.content &&
              <Section key={i} title={item.header} primaryColor={effectivePrimaryColor} dividerColor={effectiveDividerColor}>
                <div dangerouslySetInnerHTML={{ __html: item.content }} />
              </Section>
            ))}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div
      ref={ref}
      className={`cv-container printable-content template-${effectiveTemplateId}`}
      style={{
        '--paragraph-font-size': effectiveParagraphFontSize,
        '--header-font-size': effectiveHeaderFontSize,
        lineHeight: effectiveLineHeight,
        fontFamily: effectiveFontFamily,
        '--primary-color': effectivePrimaryColor,
        '--divider-color': effectiveDividerColor
      }}
    >
      <header className="cv-header">
        <h1>{personalInformation.name || 'Your Name'}</h1>
        {personalInformation.professionalTitle && <p className="professional-title">{personalInformation.professionalTitle}</p>}
        {formatContact() && <p className="contact-info">{formatContact()}</p>}
        {formatLocation() && <p className="location">{formatLocation()}</p>}
        {personalInformation.portfolioLink && (
          <a href={personalInformation.portfolioLink.includes('://') ? personalInformation.portfolioLink : `https://${personalInformation.portfolioLink}`} target="_blank" rel="noopener noreferrer" className="portfolio-link">
            {personalInformation.portfolioLink}
          </a>
        )}
      </header>

      {effectiveSectionOrder.map(sectionId => (
        <React.Fragment key={sectionId}>
          {renderSectionContent(sectionId)}
        </React.Fragment>
      ))}

    </div>
  );
});

PrintableCv.displayName = 'PrintableCv';

export default PrintableCv;