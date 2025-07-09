// src/components/cv/CvDocument.jsx

import React from 'react';
import { Page, Text, View, Document, StyleSheet, Link } from '@react-pdf/renderer';

const FONT_FAMILY = 'Helvetica';

const CvDocument = ({ data, primaryColor, sectionStyles, sectionOrder = [] }) => {
  const styles = StyleSheet.create({
    page: { padding: 30, fontFamily: FONT_FAMILY, fontSize: 10, color: '#333', lineHeight: 1.5 },
    section: { marginBottom: 10, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
    heading: { fontSize: 14, fontWeight: 'bold', color: primaryColor || '#2563EB', marginBottom: 8, borderBottomWidth: 2, borderBottomColor: primaryColor || '#2563EB', paddingBottom: 4 },
    personalInfo: { textAlign: 'center', marginBottom: 20 },
    name: { fontSize: 24, fontWeight: 800, color: '#111' },
    contact: { fontSize: 10, color: '#444' },
    link: { color: '#007BFF', textDecoration: 'none' },
    subHeading: { fontSize: 11, fontWeight: 'bold', marginBottom: 4, marginTop: 6 },
    text: { marginBottom: 2 },
    listItem: { flexDirection: 'row', marginBottom: 3 },
    bullet: { width: 10, fontSize: 10, marginRight: 5 },
    itemContent: { flex: 1 },
    entry: { marginBottom: 8 },
    entryHeader: { flexDirection: 'row', justifyContent: 'space-between', fontSize: 11, fontWeight: 'bold' },
    keywords: { fontSize: 8, color: '#555', marginTop: 4 },
    skillTextContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 4 },
  });

  const getAlignment = (title) => (sectionStyles && sectionStyles[title]) || 'left';

  const BulletList = ({ content }) => {
    try {
      const contentAsString = String(content || '');
      return contentAsString
        .split('\n')
        .filter(line => line.trim() !== '')
        .map((item, i) => (
          <View key={i} style={styles.listItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.itemContent}>{item.replace(/^[-•]\s*/, '')}</Text>
          </View>
        ));
    } catch (e) {
      console.error("❌ BulletList error:", e);
      return <Text>Error rendering list</Text>;
    }
  };

  const PersonalInfo = () => {
    const info = data.personalInformation || {};
    return info.name ? (
      <View style={styles.personalInfo}>
        <Text style={styles.name}>{String(info.name || '')}</Text>
        <Text style={styles.contact}>{String(info.contact || '')}</Text>
        <Text style={styles.contact}>
          {`${String(info.city || '')}${info.city && info.country ? ', ' : ''}${String(info.country || '')}`}
        </Text>
        {info.portfolioLink ? (
          <Link style={styles.link} src={info.portfolioLink}>
            {String(info.portfolioLink)}
          </Link>
        ) : null}
      </View>
    ) : null;
  };

  const ProfessionalSummary = () => {
    return data.summary ? (
      <View style={{ ...styles.section, textAlign: getAlignment('Professional Summary') }}>
        <Text style={styles.heading}>Professional Summary</Text>
        <Text style={styles.text}>{String(data.summary || '')}</Text>
      </View>
    ) : null;
  }

  const WorkExperience = () => {
    const list = data.experience || [];
    return (Array.isArray(list) && list.length > 0 && list.some(e => e.jobTitle || e.title)) ? (
      <View style={{ ...styles.section, textAlign: getAlignment('Work Experience') }}>
        <Text style={styles.heading}>Work Experience</Text>
        {list.map((exp, i) => {
          return (exp && (exp.jobTitle || exp.title)) ? (
            <View key={i} style={styles.entry}>
              <View style={styles.entryHeader}>
                <Text>{`${String(exp.jobTitle || exp.title || '')} at ${String(exp.company || '')}`}</Text>
                <Text>{String(exp.duration || exp.years || '')}</Text>
              </View>
              
              {(exp.responsibilities || exp.description) ? (
                <>
                  <Text style={styles.subHeading}>Responsibilities:</Text>
                  <BulletList content={exp.responsibilities || exp.description} />
                </>
              ) : null}

              {exp.achievements ? (
                <>
                  <Text style={styles.subHeading}>Achievements:</Text>
                  <BulletList content={exp.achievements} />
                </>
              ) : null}

              {exp.keywords ? (
                <Text style={styles.keywords}>Keywords: {String(exp.keywords)}</Text>
              ) : null}
            </View>
          ) : null;
        })}
      </View>
    ) : null;
  };

  const Education = () => {
    const list = data.education || [];
    return (Array.isArray(list) && list.length > 0 && list.some(e => e.degree)) ? (
      <View style={{ ...styles.section, textAlign: getAlignment('Education') }}>
        <Text style={styles.heading}>Education</Text>
        {list.map((edu, i) => {
          return (edu && edu.degree) ? (
            <View key={i} style={styles.entry}>
              <View style={styles.entryHeader}>
                <Text>{`${String(edu.degree || '')} - ${String(edu.institution || edu.university || '')}`}</Text>
                <Text>{String(edu.gradDate || edu.year || '')}</Text>
              </View>
              
              {/* THE CRITICAL FIX IS HERE */}
              {edu.gpa ? (
                <Text style={{ fontSize: 9 }}>GPA: {String(edu.gpa)}</Text>
              ) : null}
              
              {edu.relevantCoursework ? (
                <Text style={{ fontSize: 9 }}>Relevant Coursework: {String(edu.relevantCoursework)}</Text>
              ) : null}
            </View>
          ) : null;
        })}
      </View>
    ) : null;
  };

  const Skills = () => {
    const skills = data.skills || {};
    return (skills.technical || skills.soft || skills.languages) ? (
      <View style={{ ...styles.section, textAlign: getAlignment('Skills') }}>
        <Text style={styles.heading}>Skills</Text>
        
        {skills.technical ? (
          <View style={styles.skillTextContainer}>
            <Text><Text style={{ fontWeight: 'bold' }}>Technical: </Text>{String(skills.technical)}</Text>
          </View>
        ) : null}
        
        {skills.soft ? (
          <View style={styles.skillTextContainer}>
            <Text><Text style={{ fontWeight: 'bold' }}>Soft: </Text>{String(skills.soft)}</Text>
          </View>
        ) : null}
        
        {skills.languages ? (
          <View style={styles.skillTextContainer}>
            <Text><Text style={{ fontWeight: 'bold' }}>Languages: </Text>{String(skills.languages)}</Text>
          </View>
        ) : null}

      </View>
    ) : null;
  };

  const Projects = () => {
    const list = data.projects || [];
    return (Array.isArray(list) && list.length > 0 && list.some(p => p.projectName)) ? (
      <View style={{ ...styles.section, textAlign: getAlignment('Projects') }}>
        <Text style={styles.heading}>Projects</Text>
        {list.map((proj, i) => {
          return (proj && proj.projectName) ? (
            <View key={i} style={styles.entry}>
              <Text style={styles.subHeading}>{String(proj.projectName || '')}</Text>
              <BulletList content={proj.projectDescription || ''} />
              <Text style={styles.keywords}>Technologies: {String(proj.technologiesUsed || '')}</Text>
            </View>
          ) : null;
        })}
      </View>
    ) : null;
  };

  const sectionComponentMap = {
    'Personal Information': PersonalInfo,
    'Professional Summary': ProfessionalSummary,
    'Work Experience': WorkExperience,
    'Education': Education,
    'Skills': Skills,
    'Projects': Projects,
  };

  const availableSections = sectionOrder.filter(title => sectionComponentMap[title]);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {availableSections.map((sectionTitle) => {
          const Component = sectionComponentMap[sectionTitle];
          return Component ? <Component key={sectionTitle} /> : null;
        })}
      </Page>
    </Document>
  );
};

export default CvDocument;