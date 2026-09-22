import { PROJECT_CATEGORIES } from '@/lib/projectConstants';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function ProjectFilters({ filters, setFilters, technologies }) {
  return (
    <div className="flex flex-wrap gap-3">
      <Select
        value={filters.category}
        onValueChange={(v) => setFilters((f) => ({ ...f, category: v }))}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All categories</SelectItem>
          {PROJECT_CATEGORIES.map((c) => (
            <SelectItem key={c} value={c}>
              {c}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.tech}
        onValueChange={(v) => setFilters((f) => ({ ...f, tech: v }))}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Technology" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All technologies</SelectItem>
          {technologies.map((t) => (
            <SelectItem key={t} value={t}>
              {t}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}