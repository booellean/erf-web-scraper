const puppeteer = require('puppeteer');
const Discord = require("discord.js");

const routes = (app) => {

  const in_stock_url = [];
  const didSend = [];
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
              <style>
                h1, h2, h3, h4 {
                  text-align: center;
                }
                img {
                  display: block;
                  margin: 0 auto;
                }
              </style>
          </head>
          <body>
            <div style="max-width:50em;margin-left: auto;margin-right: auto;">
              <img src="/images/controller.png" style="max-width:15em" />
              <h1>Hello Scrapers!</h1>
              <h2>If there are any ps5 links, they will appear directly below this line. In the meantime, please make sure you're ready!</h2>
              <ul id="update">
              </ul>

              <hr>

              <h2>How to use this app</h2>
              <p>Please do not stop reading after you verify this section. For a best chance, read through all items.</p>
              <p>To use this scraper, leave this page open somewhere on your desktop. If you can, leave it open over night as well. This page will refresh every minute to deliver you updates</p>
              <p>If there are PS5s in stock, they will show up as links on this page.</p>
              <p>This page can also play a video (to alarm you) and open the links automatically if you allow it! For this feature, you need to enable pop ups for this site.  Please follow instructions in the link below to enable pop ups</p>
              <p><a href="https://support.google.com/chrome/answer/95472?hl=en&co=GENIE.Platform%3DDesktop" target="_blank">How to Enable Pop Ups</a></p>
              <p><strong>If you missed a drop</strong> on this page, please refresh. This page stops refreshing once there are links to the console</p>

              <h2>Setup your Accounts</h2>
              <p>This scraper checks 3 sites: The official <a href="https://www.playstation.com/en-us/" target="_blank">Playstation</a> site, <a href="https://www.target.com/" target="_blank">Target</a>, and <a href="https://www.bestbuy.com/" target="_blank">BestBuy</a>. BestBuy is your best bet.</p>
              <p>All sites require you to have an account, and you should have them set up and be logged in before using this scraper. Also, if you are logged in and have pop ups enabled, you will automatically be put in line for a PS5 when one's in stock!</p>

              <h2>Discord Integration</h2>
              <p>If you fork this app, you can also host it yourself and have it point to your personal discord. I haven't completed the instructions for this yet, so please wait on that.</p>

              <h2>Your Best Chances</h2>
              <p>Your best chance is to also be pre-emptive. PS5 drops are only 2 to 5 times a month per company right now. Keeping the app running constantly <em>and</em> being available all the time is a bit too much...</p>
              <p>To mitigate that, please check a drop guide and use your best judgement. Did one drop 1 week ago? You should probably be prepared for another</p>
              <p>I personally used this guide when developing this app, and it really helped!</p>
              <p><a href="https://www.cnet.com/tech/computing/ps5-restock-tracker-target-amazon-gamestop-playstation-direct/" target="_blank"></a></p>

            </div>
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

                  var in_stock_index = in_stock_url.indexOf(url);
                  
                  if(in_stock_index < 0){
                    in_stock_url.push(url);
                  }
              }else{
                  console.log("Not in Stock, "+ url)

                  var in_stock_index = in_stock_url.indexOf(url);
                  var didSend_index = didSend.indexOf(url);
                  
                  // Removing items that may already be there
                  if(in_stock_index > -1){
                    in_stock_url.splice(in_stock_index, 1)
                  }

                  if(didSend_index > -1){
                    didSend.splice(didSend_index, 1)
                  }
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

            r.forEach( url =>{
              if(!didSend.includes(url)){
                client.on('ready', () => {
                  client.channels.cache.get(process.env.CHANNEL_ID).send(url);
                })

                didSend.push(url);
              }
            })
          }catch(e){
            console.log('bot couldn\'t send message')
          }
          in_stock_url = r;
          findItems();
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