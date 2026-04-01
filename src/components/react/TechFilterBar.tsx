import { useState } from 'react';
import { TechBadge } from './TechBadge';
import type { TechCategory } from '@/lib/tech-categories';

interface TechFilterBarProps {
  categories: TechCategory[];
  selectedTechs: Set<string>;
  onToggleTech: (tech: string) => void;
  onClearAll: () => void;
  totalCount: number;
  filteredCount: number;
}

export function TechFilterBar({
  categories,
  selectedTechs,
  onToggleTech,
  onClearAll,
  totalCount,
  filteredCount,
}: TechFilterBarProps) {
  const isAllSelected = selectedTechs.size === 0;

  return (
    <div className="bg-[#FFFFFF] border border-[#E4E4E7] rounded-lg p-6">
      <div className="flex items-center gap-3 mb-3">
        <h3 className="text-[16px] font-semibold text-[#09090B]">技術スタック</h3>
        <span className="text-[12px] text-[#9CA3AF]">
          {filteredCount} / {totalCount}
        </span>
        <button
          type="button"
          onClick={onClearAll}
          className={`inline-block px-3 py-2 rounded text-[12px] border transition ${
            isAllSelected
              ? 'bg-[#000] text-white border-[#000]'
              : 'bg-[#FAFAFA] text-[#9CA3AF] border-[#E4E4E7] hover:bg-[#000] hover:text-white hover:border-[#000] cursor-pointer'
          }`}
        >
          すべて
        </button>
      </div>

      <div className="space-y-3">
        {categories.map((cat) => (
          <CategoryRow
            key={cat.label}
            category={cat}
            selectedTechs={selectedTechs}
            onToggleTech={onToggleTech}
          />
        ))}
      </div>
    </div>
  );
}

function CategoryRow({
  category,
  selectedTechs,
  onToggleTech,
}: {
  category: TechCategory;
  selectedTechs: Set<string>;
  onToggleTech: (tech: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="flex gap-2 flex-wrap items-center">
      <span className="text-[12px] text-[#9CA3AF] font-semibold whitespace-nowrap">
        {category.label}
      </span>
      {category.trending.map((tech) => (
        <TechBadge
          key={tech}
          tech={tech}
          selected={selectedTechs.has(tech)}
          onClick={() => onToggleTech(tech)}
        />
      ))}
      {category.rest.length > 0 && (
        <>
          {expanded && (
            <div className="flex gap-2 flex-wrap w-full pl-10">
              {category.rest.map((tech) => (
                <TechBadge
                  key={tech}
                  tech={tech}
                  selected={selectedTechs.has(tech)}
                  onClick={() => onToggleTech(tech)}
                />
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="inline-block px-3 py-2 rounded text-[12px] text-[#9CA3AF] hover:underline cursor-pointer"
          >
            {expanded ? '- 折りたたむ' : `+${category.rest.length} more`}
          </button>
        </>
      )}
    </div>
  );
}
