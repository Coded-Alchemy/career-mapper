export default function PagePlaceholder({ title, description, icon: Icon }) {
  return (
    <div className="mx-auto flex min-h-full max-w-3xl flex-col items-center justify-center px-6 py-20 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        {Icon ? <Icon className="h-8 w-8" /> : null}
      </div>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
      {description && (
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
      <p className="mt-6 text-xs font-medium uppercase tracking-wider text-muted-foreground/60">
        Coming soon
      </p>
    </div>
  );
}