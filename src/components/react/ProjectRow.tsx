import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { trendingTechs } from '@/lib/tech-categories';
import type { Project } from '@/lib/types';

interface ProjectRowProps {
  project: Project;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}

export function ProjectRow({ project, index, isExpanded, onToggle }: ProjectRowProps) {
  const [techExpanded, setTechExpanded] = useState(false);

  const [startYear, startMonth] = project.period.start.split('/').map(Number);
  const [endYear, endMonth] = project.period.end
    ? project.period.end.split('/').map(Number)
    : [null, null];
  const monthsCount = endYear
    ? (endYear - startYear) * 12 + (endMonth! - startMonth + 1)
    : '進行中';

  // Sort techs: trending first
  const sortedTechs = [
    ...project.technologies.filter(t => trendingTechs.includes(t))
      .sort((a, b) => trendingTechs.indexOf(a) - trendingTechs.indexOf(b)),
    ...project.technologies.filter(t => !trendingTechs.includes(t)),
  ];
  const displayTechs = sortedTechs.slice(0, 4);
  const collapsedTechs = sortedTechs.slice(4);

  const descriptionItems = project.description?.split('\n').filter(Boolean) || [];
  const learningItems = project.learning?.split('\n').filter(Boolean) || [];
  const commentsItems = project.comments?.split('\n').filter(Boolean) || [];

  return (
    <>
      {/* Summary row */}
      <tr
        onClick={onToggle}
        className={cn(
          'hover:bg-[#F4F4F5] transition cursor-pointer',
          isExpanded && 'bg-[#EFF6FF]',
        )}
      >
        <td className="px-6 py-4 text-[14px] text-[#71717A] text-center">
          <ChevronRight
            className={cn('w-5 h-5 inline-block transition-transform', isExpanded && 'rotate-90')}
          />
        </td>
        <td className="px-6 py-4 text-[14px] text-[#71717A] hidden lg:table-cell">{index}</td>
        <td className="px-6 py-4 text-[14px] text-[#71717A] whitespace-nowrap">
          {project.period.start} ~ {project.period.end ?? '現在'}
        </td>
        <td className="px-6 py-4 text-[14px] text-[#71717A] text-right whitespace-nowrap hidden lg:table-cell">
          {monthsCount}ヶ月
        </td>
        <td className="px-6 py-4 text-[14px] text-[#09090B] font-medium whitespace-nowrap">
          <div>{project.name}</div>
          <div className="flex gap-2 mt-1">
            {project.contractType === '社員' && (
              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-600 border border-gray-200">社員</span>
            )}
            {project.contractType === 'SES' && (
              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-100 text-purple-700 border border-purple-200">SES</span>
            )}
            {project.contractType === '受託' && (
              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-green-100 text-green-700 border border-green-200">受託</span>
            )}
            {project.isLeader && (
              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-700 border border-blue-200">リーダー</span>
            )}
          </div>
        </td>
        <td className="px-6 py-4 text-[14px] text-[#71717A] hidden md:table-cell">
          <div className="flex gap-2 flex-wrap items-center">
            {displayTechs.map(tech => (
              <span key={tech} className="inline-block px-3 py-2 rounded bg-[#FAFAFA] text-[#9CA3AF] text-[11px] border border-[#E4E4E7]">
                {tech}
              </span>
            ))}
            {collapsedTechs.length > 0 && (
              <>
                {techExpanded && (
                  <span className="flex gap-2 flex-wrap">
                    {collapsedTechs.map(tech => (
                      <span key={tech} className="inline-block px-3 py-2 rounded bg-[#FAFAFA] text-[#9CA3AF] text-[11px] border border-[#E4E4E7]">
                        {tech}
                      </span>
                    ))}
                  </span>
                )}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setTechExpanded(!techExpanded); }}
                  className="inline-block px-3 py-2 rounded text-[#9CA3AF] text-[11px] hover:underline cursor-pointer"
                >
                  {techExpanded ? '- collapse' : `+${collapsedTechs.length} more`}
                </button>
              </>
            )}
          </div>
        </td>
        <td className="px-6 py-4 text-[14px] text-[#71717A] hidden lg:table-cell">{project.teamSize}人</td>
      </tr>

      {/* Detail row */}
      {isExpanded && (
        <tr>
          <td colSpan={7} className="px-6 py-4 bg-[#EFF6FF]">
            <div className="space-y-3">
              {descriptionItems.length > 0 && (
                <div>
                  <h4 className="text-[16px] font-semibold text-[#09090B] mb-2">担当業務</h4>
                  <ul className="list-disc list-inside text-[14px] text-[#71717A] leading-relaxed space-y-1">
                    {descriptionItems.map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                </div>
              )}
              {learningItems.length > 0 && (
                <div>
                  <h4 className="text-[16px] font-semibold text-[#09090B] mb-2">業務で得た知見</h4>
                  <ul className="list-disc list-inside text-[14px] text-[#71717A] leading-relaxed space-y-1">
                    {learningItems.map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                </div>
              )}
              {commentsItems.length > 0 && (
                <div>
                  <h4 className="text-[16px] font-semibold text-[#09090B] mb-2">コメント</h4>
                  <ul className="list-disc list-inside text-[14px] text-[#71717A] leading-relaxed space-y-1">
                    {commentsItems.map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                </div>
              )}
              <div>
                <h4 className="text-[16px] font-semibold text-[#09090B] mb-2">使用技術</h4>
                <div className="flex gap-2 flex-wrap">
                  {sortedTechs.map(tech => (
                    <span key={tech} className="inline-block px-3 py-2 rounded bg-[#FAFAFA] text-[#9CA3AF] text-[11px] border border-[#E4E4E7]">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// Mobile card layout
export function ProjectCard({ project, index, isExpanded, onToggle }: ProjectRowProps) {
  const [startYear, startMonth] = project.period.start.split('/').map(Number);
  const [endYear, endMonth] = project.period.end
    ? project.period.end.split('/').map(Number)
    : [null, null];
  const monthsCount = endYear
    ? (endYear - startYear) * 12 + (endMonth! - startMonth + 1)
    : '進行中';

  const sortedTechs = [
    ...project.technologies.filter(t => trendingTechs.includes(t))
      .sort((a, b) => trendingTechs.indexOf(a) - trendingTechs.indexOf(b)),
    ...project.technologies.filter(t => !trendingTechs.includes(t)),
  ];

  const descriptionItems = project.description?.split('\n').filter(Boolean) || [];
  const learningItems = project.learning?.split('\n').filter(Boolean) || [];
  const commentsItems = project.comments?.split('\n').filter(Boolean) || [];

  return (
    <div
      className={cn(
        'border border-[#E4E4E7] rounded-lg overflow-hidden transition',
        isExpanded ? 'bg-[#EFF6FF]' : 'bg-white',
      )}
    >
      <div onClick={onToggle} className="p-4 cursor-pointer">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="text-[14px] font-medium text-[#09090B] truncate">{project.name}</div>
            <div className="flex gap-1 mt-1">
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
          </div>
          <ChevronRight className={cn('w-5 h-5 text-[#71717A] transition-transform flex-shrink-0', isExpanded && 'rotate-90')} />
        </div>
        <div className="flex items-center gap-3 mt-2 text-[12px] text-[#71717A]">
          <span>{project.period.start} ~ {project.period.end ?? '現在'}</span>
          <span>{monthsCount}ヶ月</span>
          <span>{project.teamSize}人</span>
        </div>
        <div className="flex gap-1 flex-wrap mt-2">
          {sortedTechs.slice(0, 3).map(tech => (
            <span key={tech} className="inline-block px-2 py-0.5 rounded bg-[#FAFAFA] text-[#9CA3AF] text-[10px] border border-[#E4E4E7]">
              {tech}
            </span>
          ))}
          {sortedTechs.length > 3 && (
            <span className="text-[10px] text-[#9CA3AF]">+{sortedTechs.length - 3}</span>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-[#E4E4E7]">
          {descriptionItems.length > 0 && (
            <div className="pt-3">
              <h4 className="text-[14px] font-semibold text-[#09090B] mb-1">担当業務</h4>
              <ul className="list-disc list-inside text-[13px] text-[#71717A] leading-relaxed space-y-0.5">
                {descriptionItems.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </div>
          )}
          {learningItems.length > 0 && (
            <div>
              <h4 className="text-[14px] font-semibold text-[#09090B] mb-1">業務で得た知見</h4>
              <ul className="list-disc list-inside text-[13px] text-[#71717A] leading-relaxed space-y-0.5">
                {learningItems.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </div>
          )}
          {commentsItems.length > 0 && (
            <div>
              <h4 className="text-[14px] font-semibold text-[#09090B] mb-1">コメント</h4>
              <ul className="list-disc list-inside text-[13px] text-[#71717A] leading-relaxed space-y-0.5">
                {commentsItems.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </div>
          )}
          <div>
            <h4 className="text-[14px] font-semibold text-[#09090B] mb-1">使用技術</h4>
            <div className="flex gap-1 flex-wrap">
              {sortedTechs.map(tech => (
                <span key={tech} className="inline-block px-2 py-0.5 rounded bg-[#FAFAFA] text-[#9CA3AF] text-[10px] border border-[#E4E4E7]">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
