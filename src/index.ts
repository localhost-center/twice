import {promises as fs} from 'fs'
import readline from 'readline-sync'
  
function stringify(unicode: number) {
  return String.fromCharCode(unicode)
}

async function run(code: string) {
  const statements = code.trim().split(code.includes('~') ? '~' : '\n').map(line => line.trim())

  if(statements[0] !== 'JYP' || !statements.slice(-1)[0].startsWith('트와이스')) {
    throw new Error('Error: 에러발생')
  }
 
  const variables: number[] = []
  let pointer = 0

  const evaluate = async (x: string): Promise<number> => {
    let n = 0
    if(x.includes(' ')) return (await Promise.all(x.split(' ').map(evaluate))).reduce((a, b) => a * b)
    if(x.includes('지효?')) {
      const answer= readline.question();
      x = x.replace('지효?', '나연'.repeat(Number(answer)))
    }
    if(x.includes('사나')) n += variables[x.split('사나').length - 1]
    if(x.includes('나연')) n += x.split('나연').length - 1
    if(x.includes('쯔위')) n -= x.split('쯔위').length - 1
    return n
  }

  const execute = async (statement: string): Promise<number | undefined> => {
    if (statement.includes('정연') && statement.includes('미나')) { // IF GOTO
      const condition = await evaluate(statement.substring(2, statement.lastIndexOf('미나') + 1))
      if (condition === 0) {
        return execute(statement.substr(statement.lastIndexOf('미나') + 1))
      }
      return
    }
    
    if(statement.includes('모모')) {
      const variablePointer = statement.split('모모')[0].split('사나').length
      const setteeValue = await evaluate(statement.split('모모')[1])
      variables[variablePointer] = setteeValue
    }
  
    if (statement.includes('지효') && statement[statement.length - 1] === '!') {      
      process.stdout.write(String(await evaluate(statement.slice(1, -1))))
    }
  
    if (statement.includes('지효') && statement[statement.length - 1] === 'ㅋ') {
      if (statement === '지효ㅋ') process.stdout.write('\n')
      process.stdout.write(stringify(await evaluate(statement.slice(1, -1))))
    }
  
    if(statement.includes('채영')) {
      pointer = await evaluate(statement.split('채영')[1]) - 1
    }
  
    if (statement.indexOf('다현') === 0) {
      return evaluate(statement.split('다현')[1])
    }
  }
 
  while(!statements[pointer].startsWith('트와이스')) {    
    const statement = statements[pointer++]
    const evaluated = await execute(statement)
    if(evaluated) return evaluated
  }
}
 
async function bootstrap(path: string) {
  try {
    try {
      await fs.access(path)
    } catch(e) {
      throw new Error(`Error: ${path}가 트와이스냐?`)
    }

    await run((await fs.readFile(path, 'utf-8')))
  } catch(e) {
    process.stderr.write(`${e.message}\n`)
  }
}
 
if(process.argv[2]) bootstrap(process.argv[2])