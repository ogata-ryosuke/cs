import { trendingTechs } from '@/lib/tech-categories';
import type { Project } from '@/lib/types';

interface ProjectCardListProps {
  projects: Project[];
}

function sortTechs(technologies: string[]) {
  return [
    ...technologies.filter(t => trendingTechs.includes(t))
      .sort((a, b) => trendingTechs.indexOf(a) - trendingTechs.indexOf(b)),
    ...technologies.filter(t => !trendingTechs.includes(t)),
  ];
}

export function ProjectCardList({ projects }: ProjectCardListProps) {
  if (projects.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[320px] bg-white border border-[#E4E4E7] rounded-lg">
        <p className="text-[14px] text-[#9CA3AF]">該当する案件がありません</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const [startYear, startMonth] = project.period.start.split('/').map(Number);
  const [endYear, endMonth] = project.period.end
    ? project.period.end.split('/').map(Number)
    : [null, null];
  const monthsCount = endYear
    ? (endYear! - startYear) * 12 + (endMonth! - startMonth + 1)
    : '進行中';

  const techs = sortTechs([
    ...project.languages,
    ...project.databases,
    ...project.frameworks,
  ]);
  const descItems = project.description?.split('\n').filter(Boolean) || [];
  const learnItems = project.learning?.split('\n').filter(Boolean) || [];
  const commentItems = project.comments?.split('\n').filter(Boolean) || [];

  return (
    <div className="bg-white border border-[#E4E4E7] rounded-lg overflow-hidden print-card">
      {/* Header */}
      <div className="px-5 py-3 bg-[#F4F4F5] border-b border-[#E4E4E7] flex flex-wrap items-center gap-x-4 gap-y-1">
        <span className="text-[12px] text-[#71717A]">No.{project.id}</span>
        <span className="text-[14px] font-semibold text-[#09090B]">{project.name}</span>
        <span className="text-[12px] text-[#71717A]">
          {project.period.start} ~ {project.period.end ?? '現在'}
        </span>
        <span className="text-[12px] text-[#71717A]">{monthsCount}ヶ月</span>
        <span className="flex-1"></span>
        <span className="text-[12px] text-[#71717A]">開発メンバー{project.teamSize}名</span>
        {project.contractType === '社員' && (
          <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-600 border border-gray-200">社員</span>
        )}
        {project.contractType === 'SES' && (
          <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-100 text-purple-700 border border-purple-200">SES</span>
        )}
        {project.contractType === '受託' && (
          <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-green-100 text-green-700 border border-green-200">受託</span>
        )}
        {project.isLeader && (
          <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-700 border border-blue-200">リーダー</span>
        )}
      </div>

      {/* Body */}
      <div className="px-5 py-4 space-y-3">
        {descItems.length > 0 && (
          <div>
            <h4 className="text-[14px] font-semibold text-[#09090B] mb-1">担当業務</h4>
            <ul className="list-disc list-inside text-[13px] text-[#52525B] leading-relaxed space-y-0.5">
              {descItems.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </div>
        )}
        {learnItems.length > 0 && (
          <div>
            <h4 className="text-[14px] font-semibold text-[#09090B] mb-1">業務で得た知見</h4>
            <ul className="list-disc list-inside text-[13px] text-[#52525B] leading-relaxed space-y-0.5">
              {learnItems.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </div>
        )}
        {commentItems.length > 0 && (
          <div>
            <h4 className="text-[14px] font-semibold text-[#09090B] mb-1">コメント</h4>
            <ul className="list-disc list-inside text-[13px] text-[#52525B] leading-relaxed space-y-0.5">
              {commentItems.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </div>
        )}
        <div>
          <h4 className="text-[14px] font-semibold text-[#09090B] mb-1">使用技術</h4>
          <div className="flex gap-1 flex-wrap">
            {techs.map(tech => (
              <span key={tech} className="inline-block px-2 py-0.5 rounded bg-[#FAFAFA] text-[#71717A] text-[10px] border border-[#E4E4E7]">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
