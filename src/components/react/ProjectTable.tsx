import { ProjectRow, ProjectCard } from './ProjectRow';
import { useMediaQuery } from '@/lib/hooks';
import type { Project } from '@/lib/types';

interface ProjectTableProps {
  projects: Project[];
  expandedIds: Set<number>;
  onToggle: (id: number) => void;
}

export function ProjectTable({ projects, expandedIds, onToggle }: ProjectTableProps) {
  const isMobile = useMediaQuery('(max-width: 767px)');

  if (isMobile) {
    return (
      <div className="space-y-3">
        {projects.map((project, i) => (
          <ProjectCard
            key={project.id}
            project={project}
            index={projects.length - i}
            isExpanded={expandedIds.has(project.id)}
            onToggle={() => onToggle(project.id)}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#E4E4E7] rounded-lg overflow-hidden">
      <table className="w-full table-fixed">
        <colgroup>
          <col className="w-[40px]" />           {/* chevron */}
          <col className="w-[40px] hidden lg:table-column" />  {/* No */}
          <col className="w-[130px]" />           {/* 期間 */}
          <col className="w-[60px] hidden lg:table-column" />  {/* 月数 */}
          <col />                                  {/* 案件名 - auto */}
          <col className="hidden md:table-column" style={{ width: '40%' }} /> {/* 技術スタック */}
          <col className="w-[50px] hidden lg:table-column" />  {/* 体制 */}
        </colgroup>
        <thead>
          <tr className="bg-[#F4F4F5] border-b border-[#E4E4E7]">
            <th className="px-3 py-3"></th>
            <th className="px-3 py-3 text-left text-[12px] font-semibold text-[#71717A] hidden lg:table-cell">No</th>
            <th className="px-3 py-3 text-left text-[12px] font-semibold text-[#71717A]">期間</th>
            <th className="px-3 py-3 text-right text-[12px] font-semibold text-[#71717A] whitespace-nowrap hidden lg:table-cell">月数</th>
            <th className="px-3 py-3 text-left text-[12px] font-semibold text-[#71717A]">案件名</th>
            <th className="px-3 py-3 text-left text-[12px] font-semibold text-[#71717A] hidden md:table-cell">技術スタック</th>
            <th className="px-3 py-3 text-left text-[12px] font-semibold text-[#71717A] hidden lg:table-cell">体制</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project, i) => (
            <ProjectRow
              key={project.id}
              project={project}
              index={projects.length - i}
              isExpanded={expandedIds.has(project.id)}
              onToggle={() => onToggle(project.id)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
