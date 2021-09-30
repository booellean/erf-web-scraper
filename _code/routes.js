const puppeteer = require('puppeteer');
const Discord = require("discord.js");

const routes = (app) => {
  
  app.get('/scraper', async (req, res) =>{
    res.setHeader('Content-type','text/html')
    let in_stock_url = [];

    let urls = process.env.URLS.split(',') || [];
    let check = process.env.CHECKS.split(',') || [];

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
        if(r){
          try{
            const client = new Discord.Client({ intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES] });

            client.login(process.env.BOT_TOKEN);
    
            client.on('ready', () => {
              client.channels.cache.get(process.env.CHANNEL_ID).send(r.join(', '));
            })
          }catch(e){
            console.log('bot couldn\'t send message')
          }
          html = `
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
                  `;

          for(var i=0; i<r.length; i++){
            html += `<li>
                        <a href="${in_stock_url[i] }" target="_blank">
                          ${ in_stock_url[i] }
                        </a>
                    </li>`;
          }

          html += `</ul>
              </body>
          `
          if(r.length > 0){
            html += `
            <script>
                    window.open("https://www.youtube.com/watch?v=4G6QDNC4jPs", "_blank")
            </script>
            `
          }else{
            html += `
            <script>
              setTimeout(function(){
                  location.reload();
              }, 6000)
            </script>`
          }

          html += `</html>`

          return res.send(html)
        }else{
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
                setTimeout(function(){
                    location.reload();
                }, 6000)
              </script>
          </html>
          `)
        }
      }).catch( err => {
        // console.log(err);
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
              setTimeout(function(){
                  location.reload();
              }, 6000)
            </script>
        </html>
        `)
      })

  })
}

module.exports = routes;