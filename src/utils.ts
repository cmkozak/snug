export function getSyntax(filePath: string): 'typescript' | 'ecmascript' {
  return filePath.endsWith('.ts') || filePath.endsWith('.tsx') ? 'typescript' : 'ecmascript';
}
