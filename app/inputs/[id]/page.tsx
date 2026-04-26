import type { PageProps } from 'next';

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return (
    <div>
      <h1>Input Details</h1>
      <p>ID: {id}</p>
    </div>
  );
}
