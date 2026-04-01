import { useState, useMemo, useEffect } from 'react';
import { TechFilterBar } from './TechFilterBar';
import { ProjectTable } from './ProjectTable';
import { categorizeTechs } from '@/lib/tech-categories';
import type { Project } from '@/lib/types';

interface ProjectsSectionProps {
  projects: Project[];
}

export default function ProjectsSection({ projects }: ProjectsSectionProps) {
  // Sort by ID descending (newest first)
  const sortedProjects = useMemo(
    () => [...projects].sort((a, b) => b.id - a.id),
    [projects],
  );

  // All unique technologies
  const allTechs = useMemo(
    () => new Set(sortedProjects.flatMap(p => p.technologies)),
    [sortedProjects],
  );

  // Categorize for filter bar
  const categories = useMemo(() => categorizeTechs(allTechs), [allTechs]);

  // State
  const [selectedTechs, setSelectedTechs] = useState<Set<string>>(new Set());
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  // Filtered projects
  const filteredProjects = useMemo(() => {
    if (selectedTechs.size === 0) return sortedProjects;
    return sortedProjects.filter(p =>
      p.technologies.some(t => selectedTechs.has(t)),
    );
  }, [sortedProjects, selectedTechs]);

  // Collapse rows that are no longer visible after filtering
  useEffect(() => {
    setExpandedIds(prev => {
      const visibleIds = new Set(filteredProjects.map(p => p.id));
      const next = new Set([...prev].filter(id => visibleIds.has(id)));
      if (next.size === prev.size) return prev;
      return next;
    });
  }, [filteredProjects]);

  // Handlers
  const toggleTech = (tech: string) => {
    setSelectedTechs(prev => {
      const next = new Set(prev);
      if (next.has(tech)) next.delete(tech);
      else next.add(tech);
      return next;
    });
  };

  const clearAll = () => setSelectedTechs(new Set());

  const toggleRow = (id: number) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const allExpanded = filteredProjects.length > 0 && filteredProjects.every(p => expandedIds.has(p.id));

  const toggleAll = () => {
    if (allExpanded) {
      setExpandedIds(new Set());
    } else {
      setExpandedIds(new Set(filteredProjects.map(p => p.id)));
    }
  };

  return (
    <div className="space-y-6">
      <TechFilterBar
        categories={categories}
        selectedTechs={selectedTechs}
        onToggleTech={toggleTech}
        onClearAll={clearAll}
        totalCount={sortedProjects.length}
        filteredCount={filteredProjects.length}
      />

      <div className="flex justify-end">
        <button
          type="button"
          onClick={toggleAll}
          className="inline-flex items-center gap-2 px-3 py-2 rounded text-[12px] text-[#71717A] hover:text-[#09090B] hover:underline cursor-pointer"
        >
          {allExpanded ? 'すべて閉じる' : 'すべて開く'}
        </button>
      </div>

      <ProjectTable
        projects={filteredProjects}
        expandedIds={expandedIds}
        onToggle={toggleRow}
      />
    </div>
  );
}
