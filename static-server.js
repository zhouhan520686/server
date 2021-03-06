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

  /******** 从这里开始看，上面不要看 ************/

  response.statusCode = 200
  const filePath = path === '/' ? '/index.html' : path
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
  }
  response.write(content)
  response.end()


})
/******** 代码结束，下面不要看 ************/

server.listen(port);
console.log('监听 ' + port + ' 成功\n请用在空中转体720度然后用电饭煲打开 http://localhost:' + port)


