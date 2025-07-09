// src/components/cv/LivePreview.jsx

import React from 'react';

const LivePreview = ({ data, primaryColor, fontFamily, sectionStyles, sectionOrder = [], isFinal = false }) => {
    
    const Section = ({ title, children, isVisible = true }) => {
        if (!isVisible) return null;
        const alignment = sectionStyles[title] || 'left';

        const hasContent = React.Children.count(children) > 0 && 
                           React.Children.toArray(children).some(child => child !== null);

        return (
            <div className="mb-4">
                <h3 className="text-lg font-bold border-b-2 pb-1 mb-2" style={{ color: primaryColor, borderColor: primaryColor + '60' }}>
                    {title}
                </h3>
                <div style={{ textAlign: alignment }} className="text-sm text-gray-700 space-y-2 min-h-[20px]">
                    {hasContent ? children : (
                        <p className="text-gray-400 italic">[Your {title.toLowerCase()} will appear here]</p>
                    )}
                </div>
            </div>
        );
    };

    const BulletList = ({ content }) => {
        if (!content) return null;
        return (
            <ul className="list-disc list-inside pl-2">
                {content.split('\n').filter(Boolean).map((item, i) => <li key={i}>{item.replace(/^- ?/, '')}</li>)}
            </ul>
        );
    };

    const sectionComponents = {
        'Personal Information': (
            <Section title="Personal Information" sectionStyles={sectionStyles}>
                {data.personalInformation?.name && <p className="font-bold text-lg">{data.personalInformation.name}</p>}
                {data.personalInformation?.contact && <p className="whitespace-pre-wrap">{data.personalInformation.contact}</p>}
                {(data.personalInformation?.city || data.personalInformation?.country) && <p>{`${data.personalInformation.city || ''}${data.personalInformation.city && data.personalInformation.country ? ', ' : ''}${data.personalInformation.country || ''}`}</p>}
                {data.personalInformation?.portfolioLink && <p className="text-blue-600 hover:underline">{data.personalInformation.portfolioLink}</p>}
            </Section>
        ),
        'Professional Summary': (
            <Section title="Professional Summary" sectionStyles={sectionStyles}>
                {data.summary && <p className="whitespace-pre-wrap">{data.summary}</p>}
            </Section>
        ),
        'Work Experience': (
            <Section title="Work Experience" isVisible={true} sectionStyles={sectionStyles}>
                {data.experience?.some(e => Object.values(e).some(v => v)) ? (
                    (data.experience || []).map((exp, i) => (
                        <div key={i} className="mb-3 pb-2 border-b border-gray-100 last:border-b-0">
                            <div className="font-bold flex justify-between">
                                <span>{exp.jobTitle || '[Job Title]'} {exp.company && `at ${exp.company}`}</span>
                                <span className="font-normal italic text-xs">{exp.duration || ''}</span>
                            </div>
                            {exp.responsibilities && <div><p className="font-semibold mt-1">Responsibilities:</p><BulletList content={exp.responsibilities} /></div>}
                            {exp.achievements && <div><p className="font-semibold mt-1">Achievements:</p><BulletList content={exp.achievements} /></div>}
                            {exp.keywords && <p className="text-xs mt-1 text-gray-500">Keywords: {exp.keywords}</p>}
                        </div>
                    ))
                ) : null}
            </Section>
        ),
        'Education': (
            <Section title="Education" isVisible={true} sectionStyles={sectionStyles}>
                 {data.education?.some(e => Object.values(e).some(v => v)) ? (
                    (data.education || []).map((edu, i) => (
                        <div key={i} className="mb-2 pb-2 border-b border-gray-100 last:border-b-0">
                            <div className="font-bold flex justify-between">
                                <span>{edu.degree || '[Degree]'} {edu.institution && `from ${edu.institution}`}</span>
                                <span className="font-normal italic text-xs">{edu.gradDate || ''}</span>
                            </div>
                            {edu.gpa && <p className="text-xs">GPA: {edu.gpa}</p>}
                            {edu.relevantCoursework && <p className="text-xs">Coursework: {edu.relevantCoursework}</p>}
                        </div>
                    ))
                 ) : null}
            </Section>
        ),
        // --- START OF THE FIX ---
        'Skills': (
            <Section title="Skills" isVisible={true} sectionStyles={sectionStyles}>
                {data.skills?.technical || data.skills?.soft || data.skills?.languages ? (
                    <>
                        {data.skills.technical && <div><span className="font-semibold">Technical Skills:</span> <p className="whitespace-pre-wrap inline">{data.skills.technical}</p></div>}
                        {data.skills.soft && <div><span className="font-semibold">Soft Skills:</span> <p className="whitespace-pre-wrap inline">{data.skills.soft}</p></div>}
                        {data.skills.languages && <div><span className="font-semibold">Languages:</span> <p className="whitespace-pre-wrap inline">{data.skills.languages}</p></div>}
                    </>
                ) : null}
            </Section>
        ),
        // --- END OF THE FIX ---
        'Projects': (
            <Section title="Projects" isVisible={true} sectionStyles={sectionStyles}>
                {data.projects?.some(p => Object.values(p).some(v => v)) ? (
                    (data.projects || []).map((proj, i) => (
                         <div key={i} className="mb-3 pb-2 border-b border-gray-100 last:border-b-0">
                            <p className="font-bold">{proj.projectName || '[Project Name]'} {proj.projectLink && <span className="font-normal text-xs">({proj.projectLink})</span>}</p>
                            {proj.technologiesUsed && <p className="text-xs">Tech: {proj.technologiesUsed}</p>}
                            {proj.projectDescription && <BulletList content={proj.projectDescription} />}
                        </div>
                    ))
                ) : null}
            </Section>
        ),
    };

    // I also noticed the Personal Information section was accessing data from the top-level
    // `data` object, but it should be accessing it from `data.personalInformation`.
    // I've corrected that above as well for consistency.

    return (
        <div id={isFinal ? 'cv-preview-content' : 'live-cv-preview'} className="p-4 bg-white shadow-inner rounded-lg border border-gray-200 min-h-[600px]" style={{ fontFamily }}>
            {sectionOrder.map(sectionTitle => 
                sectionComponents[sectionTitle] ? React.cloneElement(sectionComponents[sectionTitle], { key: sectionTitle }) : null
            )}
        </div>
    );
};

export default LivePreview;