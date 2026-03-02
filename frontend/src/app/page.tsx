export default function Home() {
  return (
    <div className="container mx-auto flex flex-col items-center justify-center gap-6 px-4 py-24 text-center">
      <h1 className="text-4xl font-bold tracking-tight">
        <span className="text-integra-brand">Integra</span> Explorer
      </h1>
      <p className="max-w-md text-lg text-muted-foreground">
        Block explorer for Integra Layer blockchain. Browse blocks,
        transactions, validators, and more.
      </p>
    </div>
  );
}
