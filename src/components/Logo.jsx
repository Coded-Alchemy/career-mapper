export default function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
        <span className="font-mono text-xl font-semibold leading-none">⌘</span>
      </div>
      <span className="text-[15px] font-semibold tracking-tight text-foreground">
        Career Mapper
      </span>
    </div>
  );
}