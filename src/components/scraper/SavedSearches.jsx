import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import SearchNameDialog from '@/components/scraper/SearchNameDialog';

export const searchLabel = (s) =>
  s.name || (s.job_titles || []).slice(0, 2).join(', ') || 'Untitled search';

export default function SavedSearches({ searches, activeId, onSelect, onCreate, onRename, onDelete }) {
  const [dialog, setDialog] = useState(null);
  const active = searches.find((s) => s.id === activeId);

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-3">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Saved searches
      </span>

      <Select value={activeId || ''} onValueChange={onSelect}>
        <SelectTrigger className="h-9 w-full sm:w-[240px]">
          <SelectValue placeholder="Select a search" />
        </SelectTrigger>
        <SelectContent>
          {searches.map((s) => (
            <SelectItem key={s.id} value={s.id}>{searchLabel(s)}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="ml-auto flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => setDialog('new')}>
          <Plus className="h-4 w-4" /> New
        </Button>
        <Button variant="outline" size="sm" onClick={() => setDialog('rename')} disabled={!active}>
          <Pencil className="h-4 w-4" /> Rename
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" disabled={!active}>
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete &ldquo;{active ? searchLabel(active) : ''}&rdquo;?</AlertDialogTitle>
              <AlertDialogDescription>
                This saved search and its criteria will be removed. Job listings already pulled in stay in the Results tab.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => onDelete(activeId)}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <SearchNameDialog
        open={dialog === 'new'}
        title="Name this search"
        description="Save it so you can switch back to these criteria any time."
        initialName={`Search ${searches.length + 1}`}
        confirmLabel="Create"
        onClose={() => setDialog(null)}
        onSubmit={(name) => { onCreate(name); setDialog(null); }}
      />

      <SearchNameDialog
        open={dialog === 'rename'}
        title="Rename search"
        initialName={active?.name || ''}
        confirmLabel="Save"
        onClose={() => setDialog(null)}
        onSubmit={(name) => { onRename(name); setDialog(null); }}
      />
    </div>
  );
}