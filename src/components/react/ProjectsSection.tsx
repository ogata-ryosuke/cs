import { useState, useMemo } from 'react';
import { TechFilterBar } from './TechFilterBar';
import { ProjectCardList } from './ProjectCardList';
import { categorizeTechs } from '@/lib/tech-categories';
import type { Project } from '@/lib/types';

interface ProjectsSectionProps {
  projects: Project[];
}

export default function ProjectsSection({ projects }: ProjectsSectionProps) {
  const sortedProjects = useMemo(
    () => [...projects].sort((a, b) => b.id - a.id),
    [projects],
  );

  const allTechs = useMemo(
    () => new Set(sortedProjects.flatMap(p => p.technologies)),
    [sortedProjects],
  );

  const categories = useMemo(() => categorizeTechs(allTechs), [allTechs]);

  const [selectedTechs, setSelectedTechs] = useState<Set<string>>(new Set());

  const filteredProjects = useMemo(() => {
    if (selectedTechs.size === 0) return sortedProjects;
    return sortedProjects.filter(p =>
      [...selectedTechs].every(t => p.technologies.includes(t)),
    );
  }, [sortedProjects, selectedTechs]);

  const toggleTech = (tech: string) => {
    setSelectedTechs(prev => {
      const next = new Set(prev);
      if (next.has(tech)) next.delete(tech);
      else next.add(tech);
      return next;
    });
  };

  const clearAll = () => setSelectedTechs(new Set());

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
      <ProjectCardList projects={filteredProjects} />
    </div>
  );
}
