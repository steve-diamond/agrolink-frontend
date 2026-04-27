type Params = { id: string };

interface PageProps {
  params: Params;
}

export default function Page({ params }: PageProps) {
  const { id } = params;
  return (
    <div>
      <h1>Input Details</h1>
      <p>ID: {id}</p>
    </div>
  );
}
