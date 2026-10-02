import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
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
    <div className="jb-saved">
      <span className="jb-eyebrow">Saved searches</span>

      <Select value={activeId || ''} onValueChange={onSelect}>
        <SelectTrigger className="jb-select jb-control" aria-label="Saved searches">
          <SelectValue placeholder="Select a search" />
        </SelectTrigger>
        <SelectContent className="jb-popover">
          {searches.map((s) => (
            <SelectItem key={s.id} value={s.id} className="jb-item">{searchLabel(s)}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="jb-actions">
        <button type="button" className="jb-btn" onClick={() => setDialog('new')}>
          <Plus className="h-3.5 w-3.5" /> New
        </button>
        <button type="button" className="jb-btn" onClick={() => setDialog('rename')} disabled={!active}>
          <Pencil className="h-3.5 w-3.5" /> Rename
        </button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button type="button" className="jb-btn" disabled={!active}>
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent className="jb-dialog jb-dialog">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete &ldquo;{active ? searchLabel(active) : ''}&rdquo;?</AlertDialogTitle>
              <AlertDialogDescription>
                This saved search and its criteria will be removed. Job listings already pulled in stay in the Results tab.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="jb-btn jb-btn">Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="jb-btn jb-btn jb-btn-danger"
                onClick={() => onDelete(activeId)}
              >
                Delete
              </AlertDialogAction>
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