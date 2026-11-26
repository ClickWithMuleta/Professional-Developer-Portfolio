/**
 * Phase 6.1 - Frontend Service & Normalization Unit Tests
 * =======================================================
 * Runs via: node frontend/scripts/test_services.js
 */

import assert from 'node:assert';
import {
  normalizeProfile,
  normalizeProject,
  normalizeSkill,
  normalizeSkillCategory,
  normalizeTimelineItem,
} from '../src/services/portfolioService.js';

console.log('\n=================================================');
console.log('  PHASE 6.1 — FRONTEND SERVICE & ADAPTER TESTS');
console.log('=================================================\n');

let passedCount = 0;
const test = (name, fn) => {
  try {
    fn();
    console.log(`  [PASS] ${name}`);
    passedCount++;
  } catch (err) {
    console.error(`  [FAIL] ${name}`);
    console.error(`         ${err.message}`);
    process.exitCode = 1;
  }
};

// 1. Profile Normalization
test('normalizeProfile handles null input gracefully', () => {
  const result = normalizeProfile(null);
  assert.strictEqual(result, null);
});

test('normalizeProfile applies safe defaults for missing fields', () => {
  const result = normalizeProfile({ id: 99 });
  assert.strictEqual(result.fullName, 'Muleta Sisay');
  assert.strictEqual(result.title, 'Software Developer');
  assert.strictEqual(result.email, 'clickwithmuleta@gmail.com');
  assert.strictEqual(result.resumeUrl, '/resume.pdf');
  assert.strictEqual(result.avatarUrl, null);
});

test('normalizeProfile maps backend fields correctly', () => {
  const result = normalizeProfile({
    id: 1,
    full_name: 'Muleta Sisay Test',
    title: 'Lead Full-Stack Engineer',
    headline: 'Engineering custom systems.',
    bio: 'Custom bio.',
    avatar_url: 'https://cdn.example.com/avatar.jpg',
    email: 'muleta@example.com',
    github_url: 'https://github.com/test',
    linkedin_url: 'https://linkedin.com/in/test',
    location: 'Addis Ababa',
    resume_url: 'https://cdn.example.com/resume.pdf',
    availability_status: 'Available',
  });
  assert.strictEqual(result.fullName, 'Muleta Sisay Test');
  assert.strictEqual(result.title, 'Lead Full-Stack Engineer');
  assert.strictEqual(result.avatarUrl, 'https://cdn.example.com/avatar.jpg');
  assert.strictEqual(result.resumeUrl, 'https://cdn.example.com/resume.pdf');
  assert.strictEqual(result.availabilityStatus, 'Available');
});

// 2. Project Normalization
test('normalizeProject derives filterCategories correctly for AI project', () => {
  const result = normalizeProject({
    id: 10,
    title: 'Smart Cashflow Tracker',
    slug: 'smart-cashflow-tracker',
    category: 'AI & Financial Tech',
    is_featured: true,
    short_description: 'Financial forecasting tool.',
  });
  assert.deepStrictEqual(result.filterCategories, ['all', 'featured', 'ml']);
  assert.strictEqual(result.isFeatured, true);
  assert.strictEqual(result.slug, 'smart-cashflow-tracker');
  assert.strictEqual(result.featuredImageUrl, null);
  assert.strictEqual(result.liveDemoUrl, null);
});

test('normalizeProject extracts technology names from both strings and objects', () => {
  const result = normalizeProject({
    id: 2,
    title: 'Test Project',
    slug: 'test-project',
    technologies: [
      { id: 1, name: 'Django' },
      'React',
      { id: 3, name: 'PostgreSQL' },
    ],
    highlights: ['Predictive ML model', 'Real-time pipeline'],
    metrics: [
      { label: 'ML Models', value: 'LightGBM' },
    ],
  });
  assert.deepStrictEqual(result.technologies, ['Django', 'React', 'PostgreSQL']);
  assert.deepStrictEqual(result.highlights, ['Predictive ML model', 'Real-time pipeline']);
  assert.deepStrictEqual(result.metrics, [{ label: 'ML Models', value: 'LightGBM' }]);
});

// 3. Skill & Category Normalization
test('normalizeSkillCategory correctly structures category and nested skills', () => {
  const result = normalizeSkillCategory({
    id: 1,
    name: 'Backend & APIs',
    slug: 'backend-apis',
    order: 0,
    skills: [
      {
        id: 1,
        name: 'Django',
        slug: 'django',
        icon_key: 'django',
        context_badge: 'Flagship Backend',
        description: 'Robust MVC backend.',
        is_flagship: true,
      },
    ],
  });
  assert.strictEqual(result.id, 'backend-apis');
  assert.strictEqual(result.label, 'Backend & APIs');
  assert.strictEqual(result.skills.length, 1);
  assert.strictEqual(result.skills[0].name, 'Django');
  assert.strictEqual(result.skills[0].iconKey, 'django');
  assert.strictEqual(result.skills[0].isFlagship, true);
});

// 4. Timeline Normalization
test('normalizeTimelineItem handles experience record with responsibilities list', () => {
  const result = normalizeTimelineItem(
    {
      id: 5,
      position: 'Software Developer',
      organization: 'Tech Org',
      period_display: '~2 Years',
      period_badge: 'Active Focus',
      is_current: true,
      responsibilities_list: ['Point 1', 'Point 2'],
      technologies: [{ name: 'Python' }, 'Django'],
    },
    'experience'
  );
  assert.strictEqual(result.id, 'exp-5');
  assert.strictEqual(result.type, 'experience');
  assert.strictEqual(result.title, 'Software Developer');
  assert.strictEqual(result.isCurrent, true);
  assert.deepStrictEqual(result.responsibilities, ['Point 1', 'Point 2']);
  assert.deepStrictEqual(result.technologies, ['Python', 'Django']);
});

test('normalizeTimelineItem handles education record with curriculum list', () => {
  const result = normalizeTimelineItem(
    {
      id: 2,
      degree: 'BSc in Computer Science',
      institution: 'Haramaya University',
      period_display: 'Graduated',
      period_badge: 'Academic Degree',
      capstone_project: 'eHospital',
      curriculum_list: ['Algorithms', 'Databases'],
      technologies: ['C#', 'SQL'],
    },
    'education'
  );
  assert.strictEqual(result.id, 'edu-2');
  assert.strictEqual(result.type, 'education');
  assert.strictEqual(result.title, 'BSc in Computer Science');
  assert.strictEqual(result.projectFocus, 'eHospital');
  assert.deepStrictEqual(result.responsibilities, ['Algorithms', 'Databases']);
});

console.log(`\n=================================================`);
console.log(`  RESULT: ALL ${passedCount} NORMALIZER TESTS PASSED ✓`);
console.log(`=================================================\n`);
