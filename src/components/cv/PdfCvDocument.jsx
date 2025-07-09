// src/components/cv/PdfCvDocument.jsx
import React from 'react';
import { Page, Text, View, Document, StyleSheet, Link } from '@react-pdf/renderer';

// --- Style Translation from PrintableCv.css ---

// We define all styles here, mimicking your CSS file.
// Note: Units like 'pt', 'cm', 'rem' are not used. We use unitless numbers.
const styles = StyleSheet.create({
  // .cv-container
  page: {
    backgroundColor: 'white',
    paddingVertical: 56, // Corresponds to approx 2cm
    paddingHorizontal: 56, // Corresponds to approx 2cm
    color: '#333',
    fontFamily: 'Helvetica', // A safe default. For custom fonts, see library docs.
    fontSize: 11, // Default font size (11pt)
    lineHeight: 1.4,
  },
  // .cv-header
  header: {
    textAlign: 'center',
    marginBottom: 28, // Corresponds to 2rem
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 14, // Corresponds to 1rem
  },
  // .cv-header h1
  name: {
    fontSize: 22, // 22pt
    fontFamily: 'Helvetica-Bold',
    color: '#111',
    marginBottom: 4,
  },
  // .cv-header p, .cv-header a
  contactInfo: {
    fontSize: 11, // 11pt
    marginVertical: 2.8, // Corresponds to 0.2rem
  },
  // .cv-section
  section: {
    marginBottom: 21, // Corresponds to 1.5rem
  },
  // .cv-section h2
  sectionTitle: {
    fontSize: 14, // 14pt
    fontFamily: 'Helvetica-Bold',
    color: '#222',
    borderBottomWidth: 2,
    borderBottomColor: '#333', // Default color
    paddingBottom: 4.2, // Corresponds to 0.3rem
    marginBottom: 14, // Corresponds to 1rem
  },
  // .entry
  entry: {
    marginBottom: 14, // Corresponds to 1rem
  },
  // .entry-header
  entryHeader: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end', // 'baseline' is not supported, 'flex-end' is a good alternative
    marginBottom: 3.5, // Corresponds to 0.25rem
  },
  // .entry-header h3
  entryTitle: {
    fontSize: 12, // 12pt
    fontFamily: 'Helvetica-Bold',
  },
  // .entry-header span
  entrySubtitle: {
    fontSize: 11, // 11pt
    fontFamily: 'Helvetica-Oblique', // Italic
    color: '#555',
  },
  // .entry h4 (Used for sub-headings like Responsibilities/Achievements)
  subheading: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    marginTop: 7, // Corresponds to 0.5rem
    marginBottom: 2.8, // Corresponds to 0.2rem
    color: '#444',
  },
  // .gpa
  gpa: {
    fontSize: 10, // 10pt
    color: '#666',
  },
  // .bullet-list and its items
  bulletItem: {
    display: 'flex',
    flexDirection: 'row',
  },
  bulletPoint: {
    width: 10,
    fontSize: 10,
  },
  bulletText: {
    flex: 1,
  },
});

// --- Helper Component for Bulleted Lists ---
const BulletList = ({ text }) => {
  const items = text.split('\n').filter(item => item.trim() !== '');
  return (
    <View>
      {items.map((item, i) => (
        <View key={i} style={styles.bulletItem}>
          <Text style={styles.bulletPoint}>•</Text>
          <Text style={styles.bulletText}>{item.replace(/^[-•]\s*/, '')}</Text>
        </View>
      ))}
    </View>
  );
};

// --- Main PDF Document Component ---
export const PdfCvDocument = ({ data, primaryColor }) => {
  if (!data) return null;

  const { personalInformation, summary, experience, education, skills } = data;

  return (
    <Document author={personalInformation?.name || 'User'} title={`${personalInformation?.name || 'CV'}`}>
      <Page size="A4" style={styles.page}>
        
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.name}>{personalInformation?.name}</Text>
          <Text style={styles.contactInfo}>{personalInformation?.contact}</Text>
          <Text style={styles.contactInfo}>
            {`${personalInformation?.city || ''}${personalInformation?.city && personalInformation?.country ? ', ' : ''}${personalInformation?.country || ''}`}
          </Text>
          {personalInformation?.portfolioLink && (
            <Link style={[styles.contactInfo, { color: primaryColor }]} src={personalInformation.portfolioLink}>
              <Text>{personalInformation.portfolioLink}</Text>
            </Link>
          )}
        </View>

        {/* Summary Section */}
        {summary && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { borderBottomColor: primaryColor }]}>Professional Summary</Text>
            <Text>{summary}</Text>
          </View>
        )}

        {/* Experience Section */}
        {experience?.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { borderBottomColor: primaryColor }]}>Work Experience</Text>
            {experience.map((exp, i) => (
              <View key={i} style={styles.entry} wrap={false}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryTitle}>{exp.jobTitle} at {exp.company}</Text>
                  <Text style={styles.entrySubtitle}>{exp.duration}</Text>
                </View>
                {exp.responsibilities && (
                    <>
                        <Text style={styles.subheading}>Responsibilities:</Text>
                        <BulletList text={exp.responsibilities} />
                    </>
                )}
                {exp.achievements && (
                    <>
                        <Text style={styles.subheading}>Achievements:</Text>
                        <BulletList text={exp.achievements} />
                    </>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Education Section */}
        {education?.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { borderBottomColor: primaryColor }]}>Education</Text>
            {education.map((edu, i) => (
              <View key={i} style={styles.entry} wrap={false}>
                 <View style={styles.entryHeader}>
                    <Text style={styles.entryTitle}>{edu.degree} - {edu.institution}</Text>
                    <Text style={styles.entrySubtitle}>{edu.gradDate}</Text>
                 </View>
                 {edu.gpa && <Text style={styles.gpa}>GPA: {edu.gpa}</Text>}
              </View>
            ))}
          </View>
        )}

        {/* Skills Section */}
        {skills && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { borderBottomColor: primaryColor }]}>Skills</Text>
            {skills.technical && <Text><Text style={{ fontFamily: 'Helvetica-Bold' }}>Technical:</Text> {skills.technical}</Text>}
            {skills.soft && <Text style={{ marginTop: 5 }}><Text style={{ fontFamily: 'Helvetica-Bold' }}>Soft:</Text> {skills.soft}</Text>}
            {skills.languages && <Text style={{ marginTop: 5 }}><Text style={{ fontFamily: 'Helvetica-Bold' }}>Languages:</Text> {skills.languages}</Text>}
          </View>
        )}
      </Page>
    </Document>
  );
};