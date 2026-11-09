declare module '*.png' {
  const source: string
  export default source
}

declare module '*.jpg' {
  const source: string
  export default source
}

declare module '*.webp' {
  const source: string
  export default source
}

declare module '*.css' {
  const content: Record<string, string>
  export default content
}
