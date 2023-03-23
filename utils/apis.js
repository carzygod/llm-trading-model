const req = require("./requster");

async function rawReq(data){
  var options = {
    'method': 'GET',
    'url': 'https://api.jinse.cn/noah/v2/lives?limit='+data.limit+'&reading=false&source=web&flag=down&id='+data.id+'&category=0&grade='+data.grade,
    'headers': {
      'user-agent': ' Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36',
      'Content-Type': 'application/json'
    },
  };
  return req.doRequest(options);
}

async function gpt(data)
{
  var options = {
    'method': 'GET',
    'url': 'http://127.0.0.1:1907/role?role=trade&data='+encodeURIComponent(data),
    'headers': {
      'user-agent': ' Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36',
      'Content-Type': 'application/json'
    },
  };
  return req.doRequest(options);
}

module.exports = {
  rawReq,
  gpt
}
