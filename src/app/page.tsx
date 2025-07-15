/** eslint-disable @next/next/no-img-element */
/** eslint-disable @typescript-eslint/no-unused-vars */
// src/app/page.tsx
import { createClient } from "@/src/lib/supabase/server";
import Link from "next/link";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface Project {
  id: string;
  created_at: string;
  title: string;
  description: string;
  technologies: string[];
  github_url?: string;
  live_demo_url?: string;
  image_urls?: string[];
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface Skill {
  id: string;
  created_at: string;
  name: string;
  icon_url?: string;
  category?: string;
}

export default async function IndexPage() {
  const supabase = await createClient();

  // Fetch projects
  const { data: projects, error: projectsError } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false }); // Order by newest first

  if (projectsError) {
    console.error("Error fetching projects:", projectsError);
  }

  // Fetch skills
  const { data: skills, error: skillsError } = await supabase
    .from("skills")
    .select("*")
    .order("name", { ascending: true }); // Order skills alphabetically

  if (skillsError) {
    console.error("Error fetching skills:", skillsError);
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-20 items-center">
      <div className="flex flex-col gap-16 items-center">
        <h1 className="text-4xl lg:text-5xl !leading-tight mx-auto max-w-xl text-center">
          Obiajulu Chisom Chikamso: Full-Stack Developer
        </h1>
        <p className="text-lg text-center max-w-2xl">
          Welcome to my dynamic portfolio. Here you&aposll find my projects,
          skills, and learn more about my journey in computer science.
        </p>

        {/* Projects Section */}
        <section id="projects" className="w-full max-w-4xl p-4">
          <h2 className="text-3xl font-bold mb-6 text-center">My Projects</h2>
          {projects && projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="border rounded-lg p-4 flex flex-col gap-2 shadow-md"
                >
                  {project.image_urls && project.image_urls.length > 0 && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={project.image_urls[0]} // Display first image
                      alt={project.title}
                      className="w-full h-48 object-cover rounded-md mb-2"
                    />
                  )}
                  <h3 className="text-xl font-semibold">{project.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {project.description}
                  </p>
                  {project.technologies && project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-2 text-xs">
                      {project.technologies.map((tech, index) => (
                        <span
                          key={index}
                          className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2 mt-auto pt-2">
                    {project.github_url && (
                      <Link
                        href={project.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline text-sm"
                      >
                        GitHub
                      </Link>
                    )}
                    {project.live_demo_url && (
                      <Link
                        href={project.live_demo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-500 hover:underline text-sm"
                      >
                        Live Demo
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">
              No projects added yet. Check back soon!
            </p>
          )}
        </section>

        {/* Skills Section */}
        <section id="skills" className="w-full max-w-4xl p-4">
          <h2 className="text-3xl font-bold mb-6 text-center">My Skills</h2>
          {skills && skills.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {skills.map((skill) => (
                <div
                  key={skill.id}
                  className="border rounded-lg p-4 flex flex-col items-center gap-2 shadow-sm"
                >
                  {skill.icon_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={skill.icon_url}
                      alt={skill.name}
                      className="w-10 h-10 mb-2"
                    />
                  )}
                  <h3 className="text-lg font-semibold">{skill.name}</h3>
                  {skill.category && (
                    <p className="text-sm text-gray-500">{skill.category}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">No skills added yet.</p>
          )}
        </section>
      </div>
    </div>
  );
}
