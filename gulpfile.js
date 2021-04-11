/*
 * @Description: 
 * @Author: 小羽
 * @LastEditors: 小羽
 * @Date: 2021-04-11 23:05:22
 * @LastEditTime: 2021-04-12 00:30:55
 */
const gulp = require("gulp")
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const printer = require('lighthouse/lighthouse-cli/printer');
const Reporter = require('lighthouse/lighthouse-core/report/report-generator');
const fs = require('fs-extra');
let chrome

// 开启chrome
async function launchChrome() {
  try {
      chrome = await chromeLauncher.launch({
          chromeFlags: [
              "--disable-gpu",
              "--no-sandbox",
              "--headless"
          ],
          enableExtensions: true,
          logLevel: "error"
      });
      return {
          port: chrome.port,
          chromeFlags: [
              "--headless"
          ],
          logLevel: "error"
      }
  } catch (e) {
      console.log("ENOW lighthouse error: launching Chrome ", e);
  }
}


// 启动lighthouse测试
async function lighthouseRunner(url, opt, config={extends: 'lighthouse:default'}) {
  try {
      return await lighthouse(url, opt, config);
  } catch (e) {
      console.log("ENOW lighthouse error: running lighthouse");
  }
}

// 获取当前页面的报告
function genReport(result) {
  return Reporter.generateReport(result.lhr, 'html');
}

// 每个页面的测试入口
async function run(url, timestamp, config) {
  let chromeOpt = await launchChrome();
  let result = await lighthouseRunner(url, chromeOpt, config);
  let report = genReport(result);
  // 保存报告
  await printer.write(report, 'html', `./cases/lighthouse-report@${timestamp}.html`);
  // 关闭chrome
  await chrome.kill();
  return
}

gulp.task("start",async function(cb){
  let taskList = [
    `https://juejin.cn/`,
    `https://juejin.cn/`,
    `https://juejin.cn/`,
  ]
  for(let item of taskList){
    let timestamp = Date.now();
    await run(item,timestamp)
  }
  cb()
})
