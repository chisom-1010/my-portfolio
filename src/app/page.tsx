// src/app/page.tsx
import { createClient } from "@/src/lib/supabase/server";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { Github, Globe } from "lucide-react";

// Define interfaces for my data (should match my Supabase schema)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  github_url: string | null;
  live_demo_url: string | null;
  image_urls: string[] | null;
  is_published: boolean;
  created_at: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface Skill {
  id: string;
  name: string;
  icon_url: string | null;
  created_at: string;
}

export default async function HomePage() {
  const supabase = await createClient();

  // Fetch published projects
  const { data: projects, error: projectsError } = await supabase
    .from("projects")
    .select("*")
    .eq("is_published", true) // Only fetch published projects for the public view
    .order("created_at", { ascending: false }); // Show newest projects first

  if (projectsError) {
    console.error("Error fetching projects:", projectsError);
  }

  // Fetch all skills
  const { data: skills, error: skillsError } = await supabase
    .from("skills")
    .select("*")
    .order("name", { ascending: true }); // Order skills alphabetically

  if (skillsError) {
    console.error("Error fetching skills:", skillsError);
  }

  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center py-16 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg shadow-xl">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-4 animate-fade-in-down">
          Hi, I&apos;m Obiajulu Chisom Chikamso
        </h1>
        <p className="text-xl md:text-2xl mb-8 max-w-2xl animate-fade-in-up">
          A passionate software developer building impactful web applications.
        </p>
        <div className="flex space-x-4 animate-fade-in-up delay-200">
          <Button
            asChild
            className="bg-white text-indigo-700 hover:bg-gray-100 transition-colors"
          >
            <Link href="#projects">View Projects</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="text-white border-white hover:bg-white hover:bg-opacity-20 transition-colors"
          >
            <Link href="#contact">Contact Me</Link>
          </Button>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-12 px-4">
        <h2 className="text-4xl font-bold text-center mb-10 text-gray-800 dark:text-white">
          My Projects
        </h2>
        {projects && projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <div
                key={project.id}
                className="border rounded-lg shadow-md overflow-hidden bg-white dark:bg-gray-800 transition-transform transform hover:scale-105 hover:shadow-xl"
              >
                {project.image_urls && project.image_urls.length > 0 && (
                  <div className="relative w-full h-48 bg-gray-200 dark:bg-gray-700">
                    <Image
                      src={project.image_urls[0]} // Display the first image
                      alt={project.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      style={{ objectFit: "cover" }}
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">
                    {project.title}
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                    {project.description}
                  </p>
                  {project.technologies && project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.technologies.map((tech, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full dark:bg-blue-900 dark:text-blue-200"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-3 mt-4">
                    {project.github_url && (
                      <Button asChild variant="outline" size="sm">
                        <Link
                          href={project.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1"
                        >
                          <Github className="h-4 w-4" /> GitHub
                        </Link>
                      </Button>
                    )}
                    {project.live_demo_url && (
                      <Button asChild variant="outline" size="sm">
                        <Link
                          href={project.live_demo_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1"
                        >
                          <Globe className="h-4 w-4" /> Live Demo
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">
            No published projects to display yet. Check back soon!
          </p>
        )}
      </section>

      {/* Skills Section */}
      <section
        id="skills"
        className="py-12 px-4 bg-gray-50 dark:bg-gray-900 rounded-lg shadow-inner"
      >
        <h2 className="text-4xl font-bold text-center mb-10 text-gray-800 dark:text-white">
          My Skills
        </h2>
        {skills && skills.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {skills.map((skill) => (
              <div
                key={skill.id}
                className="flex flex-col items-center justify-center p-4 rounded-lg bg-white dark:bg-gray-800 shadow-sm transition-transform transform hover:scale-105"
              >
                {skill.icon_url && (
                  <div className="relative w-16 h-16 mb-2 flex-shrink-0">
                    <Image
                      src={skill.icon_url}
                      alt={skill.name}
                      fill
                      sizes="64px"
                      style={{ objectFit: "contain" }}
                      className="object-contain"
                    />
                  </div>
                )}
                <p className="text-lg font-medium text-gray-900 dark:text-white text-center">
                  {skill.name}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">No skills to display yet.</p>
        )}
      </section>

      {/* Contact Section (Placeholder) */}
      <section id="contact" className="py-12 px-4 text-center">
        <h2 className="text-4xl font-bold mb-6 text-gray-800 dark:text-white">
          Get in Touch
        </h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
          Have a project in mind or just want to chat? Feel free to reach out!
        </p>
        <div className="flex flex-row gap-3 mx-16 items-center justify-center">
          <Button
            asChild
            size="lg"
            className="bg-green-600 hover:bg-green-700 text-white pr-4"
          >
            <Link href="mailto:obiajuluchisom1012@gmail.com">Email Me</Link>
          </Button>
          <Button
            asChild
            size="lg"
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Link href="mailto:obiajuluchisom1012@gmail.com">Email Me</Link>
          </Button>
          <Button
            asChild
            size="lg"
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Link href="mailto:obiajuluchisom1012@gmail.com">Email Me</Link>
          </Button>
        </div>

        {/* Add links to LinkedIn, Twitter, etc. */}
      </section>
    </div>
  );
}
