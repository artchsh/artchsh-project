import ProjectCard from "./components/project-card"


type projectsCards = {
  title: string
  description: string
  link: string
}[]

const projects: projectsCards = [
  {
    title: 'Web-Camera',
    description: 'Translate stream from your phone to Discord on PC!',
    link: '#'
  },
  {
    title: 'UnoOnline',
    description: 'Uno but with online players!',
    link: '#'
  },
  {
    title: 'WebCashApp',
    description: 'Ehm... Nothing',
    link: '#'
  }
]


function App() {
	return (
		<>
			<div className='flex flex-col items-center w-full h-full mt-3 md:mt-0 md:justify-center'>
				<span className='text-6xl font-bold'>artchsh</span>
				<div >
					<a href='./pages/projects.html'>Projects</a>
				</div>
        <div className="grid grid-cols-1 gap-2 mx-2 mt-5 md:mx-0 md:grid-cols-2">
          {projects.map(project => (
            <ProjectCard key={project.title} {...project} />
          ))}
        </div>
			</div>
		</>
	)
}

export default App
