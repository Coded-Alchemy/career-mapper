import { Check, HelpCircle, Users, Code2, ListChecks, MessagesSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion';

function CardShell({ icon: Icon, title, accent, children }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-3 flex items-center gap-2">
        <Icon className={`h-4 w-4 ${accent || 'text-primary'}`} />
        <h4 className="text-sm font-semibold text-foreground">{title}</h4>
      </div>
      {children}
    </div>
  );
}

export default function PrepResult({ prep, onTogglePrep }) {
  const checked = new Set(prep.checked_prep || []);
  const likely = prep.likely_questions || [];
  const behavioral = prep.behavioral_questions || [];
  const technical = prep.technical_questions || [];
  const plan = prep.prep_plan || [];
  const ask = prep.questions_to_ask || [];

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <h3 className="text-lg font-semibold text-foreground">{prep.role_title}</h3>
          <span className="text-sm text-muted-foreground">at {prep.company}</span>
        </div>
        <p className="text-sm text-muted-foreground">{prep.role_summary}</p>
      </div>

      {likely.length > 0 && (
        <CardShell icon={HelpCircle} title="Likely Questions">
          <Accordion type="multiple" className="w-full">
            {likely.map((q, i) => (
              <AccordionItem key={i} value={`q-${i}`} className="border-border">
                <AccordionTrigger className="text-sm font-medium text-foreground hover:no-underline">
                  {q.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Strong answer includes: </span>
                  {q.answer_focus}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardShell>
      )}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {behavioral.length > 0 && (
          <CardShell icon={Users} title="Behavioral Questions" accent="text-warning">
            <div className="space-y-3">
              {behavioral.map((q, i) => (
                <div key={i} className="rounded-lg border border-border bg-background/40 p-3">
                  <div className="text-sm font-medium text-foreground">{q.question}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">STAR hint: </span>
                    {q.hint}
                  </div>
                </div>
              ))}
            </div>
          </CardShell>
        )}

        {technical.length > 0 && (
          <CardShell icon={Code2} title="Technical Questions" accent="text-primary">
            <div className="space-y-3">
              {technical.map((q, i) => (
                <div key={i} className="rounded-lg border border-border bg-background/40 p-3">
                  <div className="text-sm font-medium text-foreground">{q.question}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">Key points: </span>
                    {q.key_points}
                  </div>
                </div>
              ))}
            </div>
          </CardShell>
        )}
      </div>

      {plan.length > 0 && (
        <CardShell icon={ListChecks} title="Prep Plan" accent="text-success">
          <div className="space-y-2">
            {plan.map((item, i) => {
              const isChecked = checked.has(item);
              return (
                <div key={i} className="flex items-start gap-2.5 rounded-lg border border-border bg-background/40 p-3">
                  <button
                    onClick={() => onTogglePrep(item)}
                    className={cn(
                      'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors',
                      isChecked ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:border-primary'
                    )}
                  >
                    {isChecked && <Check className="h-3.5 w-3.5" />}
                  </button>
                  <span className={cn('text-sm text-foreground', isChecked && 'text-muted-foreground line-through')}>
                    {item}
                  </span>
                </div>
              );
            })}
          </div>
        </CardShell>
      )}

      {ask.length > 0 && (
        <CardShell icon={MessagesSquare} title="Questions to Ask the Interviewer" accent="text-primary">
          <ul className="space-y-2">
            {ask.map((q, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
                <span>{q}</span>
              </li>
            ))}
          </ul>
        </CardShell>
      )}
    </div>
  );
}