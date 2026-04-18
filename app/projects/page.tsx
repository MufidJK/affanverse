import { ProjectList } from "../../components/project-list";

export default function ProjectsPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="space-y-4 mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-primary">Projects</h1>
        <p className="text-muted-foreground text-lg">
          A collection of my recent work and open source contributions.
        </p>
      </div>
      
      {/* Expects a ProjectList Server Component to fetch from Supabase */}
      <ProjectList />
    </div>
  );
}
