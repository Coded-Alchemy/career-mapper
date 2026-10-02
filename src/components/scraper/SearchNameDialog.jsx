import { useEffect, useState } from 'react';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function SearchNameDialog({
  open, title, description, initialName = '', confirmLabel = 'Save', onClose, onSubmit,
}) {
  const [name, setName] = useState(initialName);

  useEffect(() => {
    if (open) setName(initialName);
  }, [open, initialName]);

  const submit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="jb-dialog jb-dialog sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <div className="jb-field">
          <Label htmlFor="search-name" className="jb-label">Search name</Label>
          <Input
            id="search-name"
            value={name}
            autoFocus
            placeholder="e.g. Boston Help Desk"
            className="jb-input jb-control"
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
          />
        </div>

        <DialogFooter>
          <button type="button" className="jb-btn" onClick={onClose}>Cancel</button>
          <button type="button" className="jb-btn jb-btn-primary" onClick={submit} disabled={!name.trim()}>
            {confirmLabel}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}