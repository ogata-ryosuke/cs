// Technology categorization for filter bar

export const langTags = new Set([
  'Java', 'JavaScript', 'TypeScript', 'Python', 'PHP', 'Go', 'Ruby', 'Kotlin',
  'C', 'C++', 'Objective-C', 'Perl', 'COBOL', 'Shell', 'PL/SQL', 'VBA',
  'Visual Basic 6', 'Visual Basic .NET', 'Android Java', 'Action Script',
  'CoffeeScript', 'HTML/CSS', 'BML', 'SASS',
]);

export const dbInfraTags = new Set([
  'MySQL', 'PostgreSQL', 'Oracle', 'SQLite', 'Access', 'DB2', 'HSQL',
  'Redis', 'Elasticsearch', 'Firestore', 'MongoDB', 'Realm', 'WikipediaDB',
  'AWS', 'AWS Batch', 'GCP', 'Firebase', 'Terraform', 'serverless',
  'nginx', 'Ansible', 'Vagrant', 'DRBD', 'Heartbeat', 'PaceMaker',
  'Logstash', 'Kibana', 'FileBeats', 'Docker', 'Net-LD',
  'WireShark', 'i-Filter', 'Kaspersky', 'Juniper',
]);

export const trendingLangs = ['TypeScript', 'Python', 'Go', 'Kotlin', 'Ruby', 'Java', 'JavaScript', 'PHP'];
export const trendingFw = ['React', 'Flutter', 'Next.js', 'FastAPI', 'Vue.js', 'Spring', 'Laravel', 'Ruby on Rails'];
export const trendingDbInfra = ['PostgreSQL', 'MySQL', 'AWS', 'GCP', 'Firebase', 'Redis', 'Elasticsearch', 'Terraform'];

// Trending tech list for per-row tag sorting
export const trendingTechs = [
  'TypeScript', 'React', 'Next.js', 'Python', 'FastAPI', 'Flutter',
  'PostgreSQL', 'Go', 'AWS', 'Firebase', 'GraphQL', 'Kotlin', 'Vue.js',
];

export interface TechCategory {
  label: string;
  trending: string[];
  rest: string[];
}

export function categorizeTechs(allTechs: Set<string>): TechCategory[] {
  const allLangs = [...allTechs].filter(t => langTags.has(t));
  const allDbInfra = [...allTechs].filter(t => dbInfraTags.has(t));
  const allFw = [...allTechs].filter(t => !langTags.has(t) && !dbInfraTags.has(t));

  function split(techs: string[], trending: string[]) {
    const trendingSet = new Set(trending);
    const trendingFiltered = trending.filter(t => techs.includes(t));
    const rest = techs.filter(t => !trendingSet.has(t)).sort();
    return { trending: trendingFiltered, rest };
  }

  const langs = split(allLangs, trendingLangs);
  const fws = split(allFw, trendingFw);
  const dbInfras = split(allDbInfra, trendingDbInfra);

  return [
    { label: '言語', ...langs },
    { label: 'FW・Lib', ...fws },
    { label: 'DB・Infra', ...dbInfras },
  ];
}
