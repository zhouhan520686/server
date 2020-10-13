---
title: "入门node-js服务器"
date: 2020-10-12
draft: false
tags: ["静态服务器", "动态服务器", " node-js", "HTTP headers"]
categories: ["http"]
author: "Aziz 庞之明"
---

## 前言

### 服务器的作用

1. 服务于网络操作系统，对页面和数据进行响应和处理
2. 满足用户要求，存储和管理资源：数据库、文件等等

node-js的安装移步至[官网](https://nodejs.org/)。下面涉及的知识点有：

1. 序列化文件格式
2. 静态服务器与动态服务器
3. HTTP响应头、Cookie、JSON

### 启动服务器
```sh
# 克隆项目
git clone https://github.com/Aziz-pang/nodejs-server.git

# 打开目录，使用 dev 开发，每次更新可自动重启服务器

node-dev static-server.js # 静态服务文件
node-dev server.js 8888  # 动态服务器
```

<br />

---

## 序列化文件格式

**参考：**
[维基百科](https://zh.wikipedia.org/wiki/%E5%BA%8F%E5%88%97%E5%8C%96#%E5%BA%8F%E5%88%97%E5%8C%96%E6%A0%BC%E5%BC%8F)

静态与动态服务器主要区别于是否读取数据库，若然在数据库中的资料处理中将数据转换成可取用格式的结构，也就是说把对象转化为可传输的字节序列过程称为序列化，反之则为反序列化。

以JSON与JS为例，`JSON.stringify()`对数据序列化，`JSON.parse()`对数据反序列化，其他的编程语言有不同的接口。翻译成人话：对数据进行重新排序来读写数据库，读取反序列化，写入序列化。

<br />  

## 理解静态服务器

**详细查看static-server.js文件**

需要使用json文件作为数据存储，`.json`文件的`Content—Type:applictaion/json`  

```js
JSON.parse()   //转换对象
JSON.stringify()    //转换字符串
```

读取与写入JSON的方法
```js
// 读取
fs.readFileSync('/db/data.json')
JSON.parse() 
// 存储
JSON.stringify() 
fs.writeFileSync('/db/data.json',data)
```

<br />

### HTTP 响应头设置

无论是异步或同步加载数据都需要设置**响应头(HTTP headers)**

数据也是包含HTML、css、js、JSON等等的文件类型，需要设置等应的文件类型，不然服务端会解析错误。

HTTP headers其中一项`Content-Type`用于指示资源的MIME类型。在请求中 (如POST或GET)，客户端告诉服务器实际发送的数据类型。

[详细的MIME类型](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Basics_of_HTTP/MIME_types)

媒体类型（通常称为 Multipurpose Internet Mail Extensions 或 MIME 类型 ）是一种标准，用来表示文档、文件或字节流的性质和格式。

<br />

### node-js服务端代码

**详细查看：serve.js 文件**

```js
const index = filePath.lastIndexOf('.')
const suffix = filePath.substring(index)
const fileTypes = {
  '.html':'text/html',
  '.css':'text/css',
  '.js':'application/javascript',
  '.json':'application/json',
  '.png':'image/png',
  '.jpg':'image/jpeg'
}
response.setHeader('content-Type',`${fileTypessuffix] || 'text/plain'};charset=utf-8`)
```
通过哈希表设置常用的文本类型，根据判断文件后缀设置`content-Type`。

但是单纯使用文件后缀来判断文件类型是不可靠的，不是所有的操作系统都认为后缀是有意义的，一旦设置错误的`content-type`，浏览器会解析错误，最好的方法是设置常用的文件类型，同时可以在请求文件添加查询参数。

最终方案如下
```js
let server = http.createServer(function (request, response) {

  let parsedUrl = url.parse(request.url, true)
  let path = parsedUrl.pathname
  let query = parsedUrl.query

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
  response.setHeader('content-Type', `${queryType || text/plain}; charset = utf - 8`)
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
```
噔噔。一个简易版的node-js服务器就可以顺利运行

<br />

---

## 动态服务器

动态服务器相对静态服务器增加了读写数据库的复杂程度，案例使用模拟用户注册登录的流程。**对用户输入没有限制的bug无法使用与生成环境。**

### Cookie
定义：服务器下发给浏览器的一段字符串，浏览器必须保存这个Cookie（除非用户删除）

前端可以通过`document.cookie`查看cookie，服务端可以通过`HttpOnly`禁止前端篡改cookie
```js
//服务端代码 httpOnly
response.setHeader('Set-Cookie', 'login=1;HttpOnly')
```

```js
const $registerFrom = $('#registerFrom')
$registerFrom.on('submit',(e)=>{
    e.preventDefault();
    const name = $registerFrom.find('input[name=name]').val()
    const password = $registerFrom.find('input[name=password]').val()
    console.log(name, password)
    $.ajax({
        method: 'POST',
        contentType: 'application/json',
        // 路径一字不差，服务端 path === '/singup'
        url: '/singup',
        data: JSON.stringify({name, password})
    }).then(()=>{
        alert('注册成功')
        // location.href='/signIndex.html'
    },()=>{})
})
```

### 保护用户隐私

防止用户篡改`User_id`，简单的有两种方法
1. 加密数据。漏洞在于：账号被挟持后，他人以该账号无限期的使用。可通过（JWT 解决）
2. 使用随机数，将信息传入服务器里，用户只要重新登录就会产生一个新的随机ID，返回给服务器，服务器根据数据库对应的随机数设别真实的 ID

服务器端产生一个`session.json`文件添加随机数，再通过`session.json`返回给浏览器`Cookie`中间增加一个环节令用户无法随意篡改ID数据

### 设计思路

1. 当用户注册的时，数据库添加用户ID和password
2. 同时session ID多创建一份映射用户真实ID的随机ID

```js
// 第73行代码处
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
```
3. session ID 通过Cookie传参
```js
// 第43行代码处
const random = Math.random()
session[random] = { user_id: user.id }
fs.writeFileSync('./session.json', JSON.stringify(session))
response.setHeader('Set-Cookie', `session_id=${random};HttpOnly`)
```
4. user_id 获取Cookie参数与session对比，取得真实的用户数据，允许用户登录
```js
[{"id":1,"name":"test","password":"123"}]   //user_id
{"0.924520168366378":{"user_id":1}}    // session_id
```

<br />

---

end.
