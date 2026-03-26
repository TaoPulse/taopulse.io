export default function EmbedLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: "nav, footer { display: none !important; } main { min-height: 0 !important; }",
        }}
      />
      {children}
    </>
  );
}
