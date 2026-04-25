import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { FolderGit2 } from "lucide-react";

// Server action or direct data fetch logic
async function getProjects() {
  try {
    const { data, error } = await supabase.from("projects").select("*");
    
    if (error) return { data: null, error: true };
    return { data, error: false };
  } catch (error) {
    return { data: null, error: true };
  }
}

export async function ProjectList() {
  const { data: projects, error: fetchFailed } = await getProjects();

  // Graceful Empty State rendering with Shadcn standard Cards if the fetch fails or is empty array.
  if (fetchFailed || !projects || projects.length === 0) {
    return (
      <div className="max-w-2xl mx-auto pt-8">
        <Card className="border-dashed border-2 shadow-sm bg-muted/20 text-center py-16">
          <CardHeader className="flex flex-col items-center pb-2">
            <div className="h-16 w-16 rounded-full bg-[#2398f7]/10 flex items-center justify-center mb-4">
              <FolderGit2 className="h-8 w-8 text-[#2398f7]" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">Projects Curating</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
              Projects are currently being curated. Check back soon!
            </p>
            <Button variant="outline" asChild className="px-8 shadow-sm text-[#2398f7] border-[#2398f7]/20 hover:bg-[#2398f7]/5">
              <Link href="/">Return to Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-4">
      {projects.map((project: any) => {
        // Formulate dynamic tags for tech stack Badges.
        const tags = Array.isArray(project.tags) 
          ? project.tags 
          : (typeof project.tags === "string" ? project.tags.split(",") : ["React", "TypeScript", "Next.js"]);

        return (
          <Card key={project.id} className="overflow-hidden flex flex-col group border-border hover:border-[#2398f7]/50 hover:shadow-xl hover:shadow-[#2398f7]/10 transition-all duration-300 bg-card">
            
            {/* Image Header Container */}
            <div className="relative h-56 w-full bg-muted/40 overflow-hidden border-b border-border transition-colors">
              {project.image_url ? (
                 <Image 
                   src={project.image_url} 
                   alt={project.title || "Project image"} 
                   fill 
                   className="object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out" 
                 />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-tr from-[#2398f7]/5 to-[#2398f7]/10 text-[#2398f7]/30 group-hover:scale-105 transition-transform duration-700 ease-in-out">
                  <FolderGit2 className="h-12 w-12" />
                </div>
              )}
            </div>
            
            {/* Card Content Data */}
            <CardHeader className="pb-4">
              <div className="flex flex-wrap gap-2 mb-3">
                {tags.slice(0, 3).map((tag: string, i: number) => (
                  <Badge key={i} variant="secondary" className="font-normal bg-[#2398f7]/10 hover:bg-[#2398f7]/20 text-[#2398f7] transition-colors border-none">
                    {tag.trim()}
                  </Badge>
                ))}
              </div>
              <CardTitle className="text-xl font-bold tracking-tight group-hover:text-[#2398f7] transition-colors">
                {project.title || "Untitled Project"}
              </CardTitle>
              <CardDescription className="line-clamp-2 text-base mt-2">
                {project.description || "No description provided."}
              </CardDescription>
            </CardHeader>
            
            {/* Interactivity Footer */}
            <CardFooter className="mt-auto pt-4 pb-6">
              <Button asChild className="w-full font-medium transition-all shadow-sm bg-[#2398f7] hover:bg-[#1a7cd4] text-white hover:shadow-md hover:shadow-[#2398f7]/20">
                <Link href={project.url || "#"}>
                  View Details
                </Link>
              </Button>
            </CardFooter>
            
          </Card>
        );
      })}
    </div>
  );
}
