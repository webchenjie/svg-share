declare module 'virtual:svg-icons-register' {
  const content: any
  export default content
}

declare module '*.svg?react' {
  import { FC, SVGProps } from 'react'
  const ReactComponent: FC<SVGProps<SVGSVGElement>>
  export default ReactComponent
}
