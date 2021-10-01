const puppeteer = require('puppeteer');
const Discord = require("discord.js");

const routes = (app) => {

  const in_stock_url = [];
  const urls = process.env.URLS.split(',') || [];
  const check = process.env.CHECKS.split(',') || [];
  let error = null;
  
  app.get('/scraper', async (req, res) =>{
    res.setHeader('Content-type','text/html')

    return res.send(`
      <!DOCTYPE html>
      <html lang="en">
          <head>
              <meta charset="utf-8"> 
              <style></style>
              <script></script>
          </head>
          <body>
              <img src="https://cdn.wayscript.com/static/img/logos/logo.png">
              <div>Hello World</div>
              <ul id="update">
              </ul>
          </body>
          <script>

          const handleData = (data) =>{
            window.open("https://youtu.be/4G6QDNC4jPs?t=33")

            let ul = document.getElementById("update");

            data.forEach( url => {
              window.open(url);
              let li = document.createElement('li');
              let a = document.createElement('a');
              a.setAttribute('href', url);
              a.setAttribute('target', '_blank');
              a.innerHTML = url;
              ul.appendChild(li);
              li.appendChild(a);
            })
          }

          const handleError = (error) => {
            let ul = document.getElementById("update");

            let li = document.createElement('li');
            li.innerHTML = error;
            ul.appendChild(li);
          }

          const initial_data = [${in_stock_url.map(url => '"'+url+'"').join(',')}];
          const initital_error = ${error};

          if(initital_error){
            handleError(initital_error);
          }

          if(initial_data && initial_data.length > 0){
            handleData(initial_data);
          }else{
            setTimeout( ()=>{
              window.location.reload(true); 
            },60000)
          }
          </script>
      </html>
    `)
  })

  const findItems = async () =>{
    console.log('starting...');
    return new Promise( async (resolve, reject) => {
      try{
          for(let i = 0; i < urls.length; i++) {
            let url = urls[i];
            try{
              const browser = await puppeteer.launch({
                args : [
                  '--no-sandbox', '--disable-setuid-sandbox'
                ]
              });

              let page = await browser.newPage();
              await page.goto(url, { waitUntil: 'load', timeout: 0 });
              let html = await page.content();
              html = html.toLowerCase();

              if(html && check.some( phrase => {
                if (html.includes(phrase)){
                  return true;
                }
              })){
                  console.log("Item in Stock, "+ url)
                  in_stock_url.push(url);
              }else{
                  console.log("Not in Stock, "+ url)
              }

              await browser.close()
            }catch(e){
              console.log('error')
              console.log(e);
            }
        }

        console.log('resolving');

        if(in_stock_url.length >0){
          resolve(in_stock_url)
        }else{
          resolve(false);
        }

      }catch(e){
        console.log(e)
        resolve(false)
      }
    })
      .then( r =>{
        console.log(new Date());
        if(r && r.length > 0){
          try{
            const client = new Discord.Client({ intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES] });

            client.login(process.env.BOT_TOKEN);
    
            client.on('ready', () => {
              client.channels.cache.get(process.env.CHANNEL_ID).send(r.join(', '));
            })
          }catch(e){
            console.log('bot couldn\'t send message')
          }
          in_stock_url = r;
        }else{
          findItems();
        }

      }).catch( err => {
        // console.log(err);
        error = err;

        findItems();
      })
  }

  findItems();
}

module.exports = routes;