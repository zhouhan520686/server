let http = require('http')
let fs = require('fs')
let url = require('url')
let port = process.argv[2]

if (!port) {
  console.log('请指定端口号好不啦？\nnode server.js 8888 这样不会吗？')
  process.exit(1)
}

let server = http.createServer(function (request, response) {

  let parsedUrl = url.parse(request.url, true)
  let pathWithQuery = request.url;
  let queryString = "";
  if (pathWithQuery.indexOf("?") >= 0) {
    queryString = pathWithQuery.substring(pathWithQuery.indexOf("?"));
  }
  let path = parsedUrl.pathname
  let query = parsedUrl.query
  let method = request.method;

  const filePath = path === '/' ? '/index.html' : path
  const session = JSON.parse(fs.readFileSync('./session.json').toString())
  let userArray = JSON.parse(fs.readFileSync('./db/user.json'))
  let array = []
  
  /******** 从这里开始看，上面不要看 ************/

  if (filePath === '/signin' && method === 'POST') {
    request.on('data', chunk => {
      array.push(chunk)
    })
    request.on('end', () => {
      const string = Buffer.concat(array).toString()
      const obj = JSON.parse(string)
      const user = userArray.find(user => user.name === obj.name && user.password === obj.password)
      if (user === undefined) {
        response.statusCode = 400
        response.setHeader('Content-Type', 'application/json;charset=utf-8')
        response.end(`{"errorCode": 4001}`)
      } else {
        response.statusCode = 200
        const random = Math.random()
        session[random] = { user_id: user.id }
        fs.writeFileSync('./session.json', JSON.stringify(session))
        response.setHeader('Set-Cookie', `session_id=${random};HttpOnly`)
      }
      response.end()
    })
  } else if (filePath === '/index.html') {
    const cookie = request.headers['cookie']
    let sessionId
    try {
      sessionId = cookie.split(';').filter(s => s.indexOf('session_id=') >= 0)[0].split('=')[1]
    } catch (error) { }
    const indexHtml = fs.readFileSync("./public/index.html").toString()
    if (sessionId && session[sessionId]) {
      const userId = session[sessionId].user_id
      const user = userArray.find(user => user.id === userId)
      const string = indexHtml.replace('{{login}}', `${user.name} 欢迎回来！`)
      response.write(string)
    } else {
      const string = indexHtml.replace('{{login}}', '<span onclick="gosignUp()">注册</span>  <span onclick="gosignIn()" style="color:blue">登录</span>')
      response.write(string)
    }
    response.end()
  } else if (filePath === '/signup' && method === 'POST') {
    request.on('data', (chunk) => {
      array.push(chunk)
    })
    request.on('end', () => {
      const string = Buffer.concat(array).toString()
      const obj = JSON.parse(string)
      const user = userArray.find(user => user.name === obj.name)
      if (user === undefined) {
        const lastUser = userArray[userArray.length - 1]
        const newUser = {
          id: lastUser ? lastUser.id + 1 : 1,
          name: obj.name,
          password: obj.password
        }
        userArray.push(newUser)
        fs.writeFileSync('./db/user.json', JSON.stringify(userArray))
        const random = Math.random()
        session[random] = { user_id: newUser.id }
        fs.writeFileSync('./session.json', JSON.stringify(session))
        response.setHeader('Set-Cookie', `session_id=${random};HttpOnly`)
        response.end()
      } else {
        response.statusCode = 400
        response.setHeader('Content-Type', 'application/json;charset=utf-8')
        response.end(`{"errorCode": 4002}`)
      }
      response.end()
    })
  } else {
    response.statusCode = 200
    let queryType = query['content-type']
    if (queryType === undefined) {
      const index = filePath.lastIndexOf('.')
      const suffix = filePath.substring(index)
      const fileTypes = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.json': 'application/json',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.jpg': 'image/jpeg'
      }
      queryType = fileTypes[suffix] //识别文件后缀并匹配文件类型的哈希
    }
    // text/plain 代表文本文件默认值。即使未知的文本文件，但浏览器是可以直接展示的。
    response.setHeader('content-Type', `${queryType || text / plain}; charset = utf - 8`)
    console.log(`你的房间有人请求：${filePath} 类型：${queryType}`)
    let content
    try {
      content = fs.readFileSync(`./public${filePath}`)
    } catch (error) {
      content = '文件不存在'
      response.statusCode = 404
      response.setHeader('Content-Type', 'text/html;charset=utf-8')
    }
    response.write(content)
    response.end()
  }

  /******** 代码结束，下面不要看 ************/
  
})

server.listen(port);
console.log('监听 ' + port + ' 成功\n请用在空中转体720度然后用电饭煲打开 http://localhost:' + port)


