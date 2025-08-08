// src/components/cv/PrintableCv.jsx
import React, { forwardRef } from 'react';
import './PrintableCv.css'; // Your CSS file

// Reusable Section Component for consistent styling and dividers
const Section = ({ title, children, primaryColor, dividerColor, headerFontSize, paragraphFontSize, lineHeight, fontFamily }) => (
  <section className="cv-section">
    <h2 style={{ color: primaryColor, fontSize: headerFontSize, fontFamily: fontFamily }}>
        {title}
    </h2>
    <div 
      className="section-divider" 
      style={{ backgroundColor: dividerColor }}
    ></div>
    <div 
        className="prose prose-sm max-w-none" 
        style={{ fontSize: paragraphFontSize, lineHeight: lineHeight, fontFamily: fontFamily }}
    >
        {children}
    </div>
  </section>
);

// Main PrintableCv component, wrapped with forwardRef
const PrintableCv = forwardRef(({ data, primaryColor: propPrimaryColor, settings = {} }, ref) => {
  if (!data) {
    return (
      <div ref={ref} className="cv-container printable-content">
        <p>No CV data available to print.</p>
      </div>
    );
  }

  // Destructure data with robust fallbacks
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

  // Combine passed settings with defaults for a complete style object
  const effectiveSettings = {
    primaryColor: settings.primaryColor || propPrimaryColor || '#2563EB',
    dividerColor: settings.dividerColor || '#e0e0e0',
    paragraphFontSize: settings.paragraphFontSize || '11pt',
    headerFontSize: settings.headerFontSize || '14pt',
    lineHeight: settings.lineHeight || '1.4',
    fontFamily: settings.fontFamily || 'Inter, sans-serif',
    templateId: settings.templateId || 'modern',
    sectionOrder: settings.sectionOrder || [
      'summary', 'experience', 'education', 'projects', 'skills', 
      'languages', 'references', 'awards', 'courses', 'certifications', 'customSections'
    ],
    sectionVisibility: settings.sectionVisibility || {},
    showExperienceHeaders: settings.showExperienceHeaders !== false, // Default to true if not defined
  };

  const formatContact = () => {
    const parts = [
        personalInformation.email, 
        personalInformation.phone, 
        personalInformation.linkedin
    ].filter(Boolean); // Filter out any empty/null values
    return parts.join(' | ');
  };

  const formatLocation = () => {
    const parts = [personalInformation.city, personalInformation.country].filter(Boolean);
    return parts.join(', ');
  };

  // Helper function to render a specific section
  const renderSectionContent = (sectionId) => {
    // 1. Hide section if visibility is set to false
    if (!effectiveSettings.sectionVisibility[sectionId]) {
        return null;
    }

    const sectionData = data[sectionId];
    
    // 2. Hide section if it has no content
    if (!sectionData || 
        (Array.isArray(sectionData) && sectionData.length === 0) ||
        (typeof sectionData === 'string' && sectionData.replace(/<[^>]*>?/gm, '').trim() === '') ||
        (sectionId === 'skills' && !sectionData.technical && !sectionData.soft)
       ) {
        return null;
    }
    
    switch (sectionId) {
      case 'summary':
        return (
          <Section title="Professional Summary" {...effectiveSettings}>
            <div dangerouslySetInnerHTML={{ __html: sectionData }} />
          </Section>
        );
      
      case 'experience':
        return (
          <Section title="Work Experience" {...effectiveSettings}>
            {sectionData.map((exp, i) => (
              <div key={i} className="entry mb-4 last:mb-0">
                <div className="entry-header flex justify-between items-baseline">
                  <h3 className="font-bold text-base m-0">
                    {exp.jobTitle}
                  </h3>
                  <span className="date text-gray-600 text-sm whitespace-nowrap">
                    {exp.startDate} {exp.isCurrent ? ' - Present' : (exp.endDate ? ` - ${exp.endDate}` : '')}
                  </span>
                </div>
                {exp.company && <p className="text-base italic m-0 mb-1">{exp.company}</p>}
                
                {exp.showResponsibilities && exp.responsibilities && exp.responsibilities.replace(/<[^>]*>?/gm, '').trim() && (
                    <div className="sub-section">
                        {effectiveSettings.showExperienceHeaders && <h4 className="sub-header">Responsibilities:</h4>}
                        <div dangerouslySetInnerHTML={{ __html: exp.responsibilities }} />
                    </div>
                )}
                {exp.showAchievements && exp.achievements && exp.achievements.replace(/<[^>]*>?/gm, '').trim() && (
                    <div className="sub-section mt-1">
                        {effectiveSettings.showExperienceHeaders && <h4 className="sub-header">Achievements:</h4>}
                        <div dangerouslySetInnerHTML={{ __html: exp.achievements }} />
                    </div>
                )}
              </div>
            ))}
          </Section>
        );
        
      case 'education':
        return (
          <Section title="Education" {...effectiveSettings}>
            {sectionData.map((edu, i) => (
              <div key={i} className="entry mb-3 last:mb-0">
                <div className="entry-header flex justify-between items-baseline">
                  <h3 className="font-bold text-base m-0">{edu.degree}</h3>
                  <span className="date text-gray-600 text-sm">{edu.gradDate || edu.year}</span>
                </div>
                <p className="text-base italic m-0">{edu.institution}</p>
                {edu.gpa && <p className="gpa m-0 text-sm">GPA: {edu.gpa}</p>}
              </div>
            ))}
          </Section>
        );
        
      case 'projects':
        return (
          <Section title="Projects" {...effectiveSettings}>
            {sectionData.map((project, i) => (
              <div key={i} className="entry mb-3 last:mb-0">
                <div className="entry-header flex justify-between items-baseline">
                  <h3 className="font-bold text-base m-0">{project.name}</h3>
                  {project.technologies && <span className="tech text-gray-600 text-sm">{project.technologies}</span>}
                </div>
                {project.description && <div dangerouslySetInnerHTML={{ __html: project.description }} />}
              </div>
            ))}
          </Section>
        );
        
      case 'skills':
        return (
          <Section title="Skills" {...effectiveSettings}>
            {sectionData.technical && (
              <p className="m-0"><strong>Technical:</strong> {sectionData.technical}</p>
            )}
            {sectionData.soft && (
              <p className="m-0"><strong>Soft:</strong> {sectionData.soft}</p>
            )}
          </Section>
        );
        
      case 'languages': 
        return (
          <Section title="Languages" {...effectiveSettings}>
            <p className="m-0">{sectionData}</p>
          </Section>
        );
        
      case 'references':
        return (
          <Section title="References" {...effectiveSettings}>
            <p className="m-0 text-center">References available upon request.</p>
          </Section>
        );
        
      case 'awards':
        return (
          <Section title="Awards & Recognitions" {...effectiveSettings}>
            <ul className="list-none p-0 m-0">
              {sectionData.map((item, i) => (
                <li key={i} className="mb-2 last:mb-0">
                  <p className="font-bold m-0">{item.title}</p>
                  {(item.year || item.issuer) && (
                      <span className="text-sm text-gray-700">
                          {item.issuer}{item.issuer && item.year && ', '}{item.year}
                      </span>
                  )}
                  {item.description && <p className="text-sm m-0">{item.description}</p>}
                </li>
              ))}
            </ul>
          </Section>
        );
        
      case 'courses':
        return (
          <Section title="Courses" {...effectiveSettings}>
            <ul className="list-none p-0 m-0">
              {sectionData.map((item, i) => (
                <li key={i} className="mb-1 last:mb-0">
                  <span className="font-bold">{item.title}</span>
                  {(item.institution || item.year) && (
                      <span className="text-sm text-gray-700">
                          {item.institution && ` - ${item.institution}`}
                          {item.year && ` (${item.year})`}
                      </span>
                  )}
                </li>
              ))}
            </ul>
          </Section>
        );
        
      case 'certifications':
        return (
          <Section title="Certifications" {...effectiveSettings}>
            <ul className="list-none p-0 m-0">
              {sectionData.map((item, i) => (
                <li key={i} className="mb-1 last:mb-0">
                  <span className="font-bold">{item.title}</span>
                  {(item.issuingBody || item.year) && (
                      <span className="text-sm text-gray-700">
                          {item.issuingBody && ` - ${item.issuingBody}`}
                          {item.year && ` (${item.year})`}
                      </span>
                  )}
                </li>
              ))}
            </ul>
          </Section>
        );
        
      case 'customSections':
        return (
          <>
            {sectionData.map((item, i) => (
              <Section key={i} title={item.header || "Custom Section"} {...effectiveSettings}>
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
      className={`cv-container printable-content template-${effectiveSettings.templateId}`}
      style={{
        '--primary-color': effectiveSettings.primaryColor,
        '--divider-color': effectiveSettings.dividerColor,
        fontFamily: effectiveSettings.fontFamily,
      }}
    >
      <header className="cv-header text-center mb-4">
        <h1 className="text-3xl font-bold m-0" style={{ color: effectiveSettings.primaryColor, fontFamily: effectiveSettings.fontFamily }}>
            {personalInformation.name || 'Your Name'}
        </h1>
        {personalInformation.professionalTitle && <p className="professional-title text-lg m-0">{personalInformation.professionalTitle}</p>}
        
        <div className="contact-details mt-2 text-sm">
            <p className="m-0">{formatContact()}</p>
            <p className="m-0">{formatLocation()}</p>
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
                style={{ color: effectiveSettings.primaryColor }}
            >
                {personalInformation.portfolioLink}
            </a>
            )}
        </div>
      </header>

      {effectiveSettings.sectionOrder.map(sectionId => (
        <React.Fragment key={sectionId}>
          {renderSectionContent(sectionId)}
        </React.Fragment>
      ))}

    </div>
  );
});

PrintableCv.displayName = 'PrintableCv';

export default PrintableCv;