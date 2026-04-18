import { supabase } from "@/lib/supabase";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export async function ProjectList() {
  // Fetch projects from Supabase
  // We use `any` casting temporarily until database types are formally synchronized.
  const { data, error } = await supabase.from("projects").select("*");

  if (error && error.code !== "42P01") { // 42P01 is "relation does not exist"
    console.error("Supabase fetch error:", error);
  }

  const projects = data || []; // fallback to empty array if no data or relation doesn't exist

  if (projects.length === 0) {
    return (
      <div className="text-center py-20 border rounded-2xl bg-muted/30">
        <p className="text-muted-foreground text-lg mb-4">No projects found yet.</p>
        <p className="text-sm text-foreground/60 max-w-[400px] mx-auto">
          Create a "projects" table in Supabase to start displaying items here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project: any) => (
        <Card key={project.id} className="overflow-hidden flex flex-col group border-primary/10 hover:border-primary/40 transition-colors duration-300">
          <div className="relative h-48 w-full bg-muted overflow-hidden">
            {project.image_url ? (
               <Image 
                 src={project.image_url} 
                 alt={project.title || "Project image"} 
                 fill 
                 className="object-cover group-hover:scale-105 transition-transform duration-500" 
               />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-primary/5 text-primary/30">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
              </div>
            )}
          </div>
          <CardHeader>
            <CardTitle className="text-xl font-bold tracking-tight">{project.title || "Untitled Project"}</CardTitle>
            <CardDescription className="line-clamp-2">{project.description || "No description provided."}</CardDescription>
          </CardHeader>
          <CardFooter className="mt-auto pt-6 pb-6">
            <Button variant="outline" size="sm" asChild className="w-full hover:bg-primary hover:text-primary-foreground transition-all">
              <Link href={project.url || "#"}>
                View Details
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
