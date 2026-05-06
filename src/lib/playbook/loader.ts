import fs from 'fs'
import path from 'path'

export const getPlaybookRules = (): string => {
  try {
    const filePath = path.join(process.cwd(), 'src', 'lib', 'playbook', 'bcb-rules.md')
    const content = fs.readFileSync(filePath, 'utf-8')
    return content
  } catch {
    console.warn('Playbook file not found, returning empty ruleset.')
    return ''
  }
}
