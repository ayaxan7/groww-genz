/** Re-mounts per navigation to give each page a subtle 250ms entrance. */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="animate-fade-in">{children}</div>;
}
