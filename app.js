const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
var exec = require("child_process").exec;
const os = require("os");
const { createProxyMiddleware } = require("http-proxy-middleware");
var request = require("request");

app.get("/", (req, res) => {
  // let cmdStr = `
  // if (( $(ps -ef | grep web | grep -v grep | wc -l) > 0 )); then
  //              echo "web正在运行！"
  //      else
  //              echo "web未运行！调起web中..."
  //              nohup ./web -c ./config.yaml >/dev/null 2>&1 &
  //              echo "调起web成功！"
  // fi
  // `
  // exec(cmdStr, function (err, stdout, stderr) {
  //     if (err) {
  //         res.send("error：" + err);
  //     } else {
  //         res.send("命令行执行结果：" + stdout);
  //     }
  // });
  res.send("hello wolrd");
});

app.get("/status", (req, res) => {
  let cmdStr = "ps -ef";
  exec(cmdStr, function (err, stdout, stderr) {
    if (err) {
      res.send("命令行执行错误：" + err);
    } else {
      res.send("命令行执行结果：" + stdout);
    }
  });
});

app.get("/start", (req, res) => {
  let cmdStr = "./web -c ./config.yaml >/dev/null 2>&1 &";
  exec(cmdStr, function (err, stdout, stderr) {
    if (err) {
      res.send("命令行执行错误：" + err);
    } else {
      res.send("命令行执行结果：" + "启动成功!");
    }
  });
});

app.get("/info", (req, res) => {
  let cmdStr = "cat /etc/*release | grep -E ^NAME";
  exec(cmdStr, function (err, stdout, stderr) {
    if (err) {
      res.send("命令行执行错误：" + err);
    } else {
      res.send(
        "命令行执行结果：\n" +
          "Linux System:" +
          stdout +
          "\nRAM:" +
          os.totalmem() / 1000 / 1000 + "MB"
      );
    }
  });
});

app.use(
  "/api",
  createProxyMiddleware({
    target: "http://127.0.0.1:8080/", // 需要跨域处理的请求地址
    changeOrigin: true, // 默认false，是否需要改变原始主机头为目标URL
    ws: true, // 是否代理websockets
    pathRewrite: {
      // 请求中去除/api
      "^/api": "/qwe",
    },
    onProxyReq: function onProxyReq(proxyReq, req, res) {
      // 我就打个log康康
      console.log(
        "-->  ",
        req.method,
        req.baseUrl,
        "->",
        proxyReq.host + proxyReq.path
      );
    },
  })
);

/* keepalive  begin */
function keepalive() {
  // 1.请求主页，保持唤醒
  let render_app_url = "https://oneone1999-twotwo2000.onrender.com","https://oneone2001-twotwo2000.onrender.com"
  request(render_app_url, function (error, response, body) {
    if (!error) {
      console.log("主页发包成功！");
      console.log("响应报文:", body);
    } else console.log("请求错误: " + error);
  });

  // 2.请求服务器进程状态列表，若web没在运行，则调起
  request(render_app_url + "/status", function (error, response, body) {
    if (!error) {
      if (body.indexOf("./web -c ./config.yaml") != -1) {
        console.log("web正在运行");
      } else {
        console.log("web未运行,发请求调起");
        request(render_app_url + "/start", function (err, resp, body) {
          if (!err) console.log("调起web成功:" + body);
          else console.log("请求错误:" + err);
        });
      }
    } else console.log("请求错误: " + error);
  });
}
setInterval(keepalive, 9 * 1000);
/* keepalive  end */

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
