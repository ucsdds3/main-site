import { lazy, Suspense, useRef } from 'react'
import Page from '../../../Components/Page/Page.tsx'
import Landing from './Landing.tsx'
const About = lazy(() => {
  return import('../../../Components/About.tsx')
})
const Archive = lazy(() => {
  return import('./Archive.tsx')
})
const Gallery = lazy(() => {
  return import('../../../Components/Gallery.tsx')
})

import projects from '../../../Assets/Data/projects.json'
import ShowCase from './Showcase'

const Projects = () => {
  const scrollRef = useRef<HTMLDivElement>(null!)

  return (
    <Page scrollRef={scrollRef}>
      <Landing />
      <div ref={scrollRef}>
        <Suspense>
          <About {...projects.about} />
          <ShowCase />
          <Archive />
          <Gallery images={projects.images} />
        </Suspense>
      </div>
    </Page>
  )
}

export default Projects
