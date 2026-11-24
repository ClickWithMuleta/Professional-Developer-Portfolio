export const PROJECT_CATEGORIES = [
  { id: 'all', label: 'All Projects' },
  { id: 'featured', label: 'Featured Flagship' },
  { id: 'ml', label: 'AI & Machine Learning' },
  { id: 'fullstack', label: 'Full-Stack Systems' },
];

export const PROJECTS_DATA = [
  {
    id: 'smart-cashflow-tracker',
    title: 'Smart Cashflow Tracker',
    subtitle: 'AI-Powered Financial Intelligence Platform',
    category: 'AI & Financial Tech',
    filterCategories: ['all', 'featured', 'ml', 'fullstack'],
    isFeatured: true,
    shortDescription: 'AI-powered financial management application designed to help users monitor finances, forecast future spending, detect transaction anomalies, and receive personalized budget recommendations.',
    technologies: [
      'Django',
      'Django REST Framework',
      'React',
      'Python',
      'PostgreSQL',
      'Scikit-learn',
      'LightGBM',
      'Tailwind CSS',
    ],
    highlights: [
      'Automated spending forecasting & anomaly detection',
      'User behavior clustering with K-means',
      'Real-time financial notification engine',
    ],
    liveDemoUrl: 'https://moibirr.onrender.com/',
    githubUrl: 'https://github.com/ClickWithMuleta/cashf',
    metrics: [
      { label: 'ML Models', value: 'LightGBM + Random Forest' },
      { label: 'Database', value: 'PostgreSQL' },
      { label: 'Architecture', value: 'Decoupled REST API' },
    ],
  },
  {
    id: 'ehospital-harar',
    title: 'eHospital For Harar City',
    subtitle: 'University Final-Year Capstone Project',
    category: 'Healthcare & Telemedicine',
    filterCategories: ['all', 'ml', 'fullstack'],
    isFeatured: false,
    shortDescription: 'A centralized healthcare application developed for Harar City featuring secure patient management, an intelligent doctor recommendation system, telemedicine consultation, and integrated payment processing.',
    technologies: [
      'Django',
      'PostgreSQL',
      'Python',
      'Tailwind CSS',
      'TF-IDF',
      'Logistic Regression',
      'REST APIs',
    ],
    highlights: [
      'ML-powered doctor recommendation engine',
      'Telemedicine session integration',
      'Payment processing & medical records',
    ],
    liveDemoUrl: null, // Strictly null: no fake demo links per instructions
    githubUrl: 'https://github.com/ClickWithMuleta/EHS',
    metrics: [
      { label: 'Domain', value: 'Healthcare Portal' },
      { label: 'NLP/ML', value: 'TF-IDF + Logistic Reg.' },
      { label: 'Backend', value: 'Django + PostgreSQL' },
    ],
  },
  {
    id: 'accessories-management',
    title: 'Accessories Management System',
    subtitle: 'Addis Media Network Internship Project',
    category: 'Enterprise & Inventory',
    filterCategories: ['all', 'fullstack'],
    isFeatured: false,
    shortDescription: 'An enterprise inventory and materials management application engineered during an internship at Addis Media Network, digitizing accessory allocation, stock tracking, and departmental requisition workflows.',
    technologies: [
      'PHP',
      'MySQL',
      'Web Application Development',
      'Database Integration',
    ],
    highlights: [
      'Departmental material requisition workflows',
      'Stock level monitoring & inventory logs',
      'Relational database integration',
    ],
    liveDemoUrl: null, // Strictly null: no fake demo links per instructions
    githubUrl: 'https://github.com/ClickWithMuleta/Projects/tree/main/AMN_COMPANY',
    metrics: [
      { label: 'Role', value: 'Software Engineering Intern' },
      { label: 'Client', value: 'Addis Media Network' },
      { label: 'Database', value: 'MySQL Relational' },
    ],
  },
];
