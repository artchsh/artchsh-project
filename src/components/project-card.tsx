import { motion as m } from 'framer-motion'
import { buttonBaseClass, cn } from '../lib/utils'
import { useState } from 'react'

interface ProjectCardProps {
	title: string
	description: string
	link: string
}

export default function ProjectCard(props: ProjectCardProps) {
	const [text, setText] = useState<string>('Go')

	function changeText() {
		setText(text => text != 'Go' ? 'Go' : '->')
	}

	return (
		<m.div animate={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: -10 }} className='p-4 border-2 border-white' >
			<div>
				<h1 className='text-2xl font-bold'>{props.title}</h1>
				<p>{props.description}</p>
			</div>
			<m.div className={cn(buttonBaseClass, 'mt-2 hover:text-right')} onHoverStart={changeText} onHoverEnd={changeText}>
				<a href={props.link}>{text}</a>
			</m.div>
		</m.div>
	)
}
