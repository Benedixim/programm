const express = require('express')

const cookieParser = require("cookie-parser");
const sessions = require('express-session');
const http = require('http');
var parseUrl = require('body-parser');
const app = express()

var mysql = require('mysql');


let encodeUrl = parseUrl.urlencoded({ extended: false });

//session middleware
app.use(sessions({
  secret: "thisismysecrctekey",
  saveUninitialized:true,
  cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 24 hours
  resave: false
}));


app.use(cookieParser());

var con = mysql.createConnection({
  host: "localhost",
  user: "root", // my username
  password: "ANDREY&KOLES5", // my password
  database: "myform"
});



app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/', (req, res) =>{
res.render('index')
})


app.get('/aboutus', (req, res) =>{
  res.render('aboutus')
  })

  






const isAuth = (req, res, next) => {
  if(req.session.isAuth) {
    next()
  }
  else {
    res.redirect('/login')
  }
}

app.get('/sign-up', (req, res) =>{
  res.render('signup')
  })




  app.get('/allopinions', function(req, res){
    con.query(`SELECT * FROM films`, function(err, data) {
      if(err) return console.log(err);
      if (1){res.render("allopinions.hbs", {
        films: data
    });}
    else res.redirect('/access');
      
    });
  });   


app.post('/sign_up', encodeUrl, (req, res) => {
    var firstName = req.body.firstName;
    var lastName = req.body.lastName;
    var userName = req.body.userName;
    var password = req.body.password;
    var role = req.body.role;
    con.connect(function(err) {
      if (err){
          console.log(err);
      };
      // checking user already registered or no
      con.query(`SELECT * FROM users WHERE username = '${userName}' AND password  = '${password}'`, function(err, result){
          if(err){
              console.log(err);
          };
          if(Object.keys(result).length > 0){
            res.render('failReg');
          }else{
          //creating user page in userPage function
          function userPage(){
              // We create a session for the dashboard (user page) page and save the user data to this session:
              req.session.user = {
                  firstname: firstName,
                  lastname: lastName,
                  username: userName,
                  password: password,
                  role: role
              };

              res.send(`
              <!DOCTYPE html>
              <html lang="ru">
                <head>
                  <meta charset="UTF-8" />
                  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                  <link rel="stylesheet" href="css/style.css" />
                  <link rel="stylesheet" href="css/404.css" />
                  <link rel="preconnect" href="https://fonts.gstatic.com" />
                  <link
                    href="https://fonts.googleapis.com/css2?family=Open+Sans&display=swap"
                    rel="stylesheet"
                  />
                  <title>Try again!</title>
                </head>

                <body>
                <div id="blurry-filter"></div>
                <header>
                  <div class="header__content" >
                    <a href="/" class="header__logo">MovieApp</a>
                    <nav class="navigation">
                      <ul class="navigation__list navigation__list--inline">
                        <li class="navigation__item"><a href="/" class="navigation__link navigation__link--is-active">Home</a></li>
                        <li class="navigation__item"><a href="/aboutus" class="navigation__link">About Us</a></li>
                        <li class="navigation__item"><a href="/comments" class="navigation__link">Work</a></li>
                        <li class="navigation__item"><a href="/admin" class="navigation__link">Clients</a></li>
                        <li class="navigation__item"><a href="/allopinions" class="navigation__link">Discuss</a></li>
                      </ul>
                    </nav>
                    <form>
                      <input type="text" class="header__search" placeholder="Поиск" />
                    </form>
                    <nav class="navigation">
                      <ul class="navigation__list navigation__list--inline">
                        <li class="navigation__item"><a href="/login" class="navigation__link navigation__link--is-active">Login</a></li>
                        <li class="navigation__item"><form action="/logout" method="POST"><button><a class="navigation__link">Log out</a></button></form></li>
                      </ul>
                    </nav>
                  </div>
                </header>
                  
                  <h1>Успех</h1>
                  <div class="cloak__wrapper">
                          <div class="cloak__container">
                              <div class="cloak"></div>
                          </div>
                  </div>

                  <div class="info">
                  <h2>Успешная регистрация</h2>
                  <p>Приветствуем, ${req.session.user.firstname} ${req.session.user.lastname}</p>
                  </div>

                  <script src="js/app.js"></script>
                  <script src="js/rating.js"></script>
                </body>
              </html>
              `);
          }
              // inserting new user data
              var sql = `INSERT INTO users (firstname, lastname, username, password, role) VALUES ('${firstName}', '${lastName}', '${userName}', '${password}', '${role}')`;
              con.query(sql, function (err, result) {
                  if (err){
                      console.log(err);
                  }else{
                      // using userPage function for creating user page
                      userPage();
                  };
              });

      }

      });
  });


});


    
app.get('/login', (req, res) =>{
  res.render('login')
  })



app.post('/login', encodeUrl, (req, res)=>{
  var userName = req.body.userName;
  var password = req.body.password;

  con.connect(function(err) {
      if(err){
          console.log(err);
      };
//get user data from MySQL database
      con.query(`SELECT * FROM users WHERE username = '${userName}' AND password = '${password}'`, function (err, result) {
        if(err){
          console.log(err);
        };

// creating userPage function to create user page
        function userPage(){
          // We create a session for the dashboard (user page) page and save the user data to this session:
          req.session.user = {
              firstname: result[0].firstname, // get MySQL row data
              lastname: result[0].lastname, // get MySQL row dataa
              username: userName,
              password: password,
              role: result[0].role
          };

          req.session.isAuth = true;
          

          res.send(`
          <!DOCTYPE html>
          <html lang="ru">
            <head>
              <meta charset="UTF-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <link rel="stylesheet" href="css/style.css" />
              <link rel="stylesheet" href="css/404.css" />
              <link rel="preconnect" href="https://fonts.gstatic.com" />
              <link
                href="https://fonts.googleapis.com/css2?family=Open+Sans&display=swap"
                rel="stylesheet"
              />
              <title>Try again!</title>
            </head>

            <body>
            <div id="blurry-filter"></div>
            <header>
              <div class="header__content" >
                <a href="/" class="header__logo">MovieApp</a>
                <nav class="navigation">
                  <ul class="navigation__list navigation__list--inline">
                    <li class="navigation__item"><a href="/" class="navigation__link navigation__link--is-active">Home</a></li>
                    <li class="navigation__item"><a href="/aboutus" class="navigation__link">About Us</a></li>
                    <li class="navigation__item"><a href="/comments" class="navigation__link">Work</a></li>
                    <li class="navigation__item"><a href="/admin" class="navigation__link">Clients</a></li>
                    <li class="navigation__item"><a href="/allopinions" class="navigation__link">Discuss</a></li>
                  </ul>
                </nav>
                <form>
                  <input type="text" class="header__search" placeholder="Поиск" />
                </form>
                <nav class="navigation">
                  <ul class="navigation__list navigation__list--inline">
                    <li class="navigation__item"><a href="/login" class="navigation__link navigation__link--is-active">Login</a></li>
                    <li class="navigation__item"><form action="/logout" method="POST"><button><a class="navigation__link">Log out</a></button></form></li>
                  </ul>
                </nav>
              </div>
            </header>
              
              <h1>Успех</h1>
              <div class="cloak__wrapper">
                      <div class="cloak__container">
                          <div class="cloak"></div>
                      </div>
              </div>

              <div class="info">
              <h2>Успешный вход</h2>
              <p>Приветствуем, ${req.session.user.firstname} ${req.session.user.lastname}</p>
              </div>

              <script src="js/app.js"></script>
              <script src="js/rating.js"></script>
            </body>
          </html>
          `);
      }

      if(Object.keys(result).length > 0){
          userPage();
      }else{
          res.render('failLog');
      }

      });
  });
});

//комментарии

app.get('/comments', isAuth, function(req, res){
  con.query(`SELECT * FROM mycomments`, function(err, data) {
    if(err) return console.log(err);
    if (req.session.user.role == "ADMIN" || req.session.user.role == "MODERATOR"){res.render("comments.hbs", {
      comments: data
  });}
  else res.redirect('/access');
    
  });
});


app.post("/deleteCom/:idmycomments", function(req, res){
          
  const idmycomments = req.params.idmycomments;
  con.query(`DELETE FROM mycomments WHERE idmycomments=?`, [idmycomments], function(err, data) {
    if(err) return console.log(err);
    res.redirect('/comments');
  });
});


app.get('/editCom/:idmycomments', isAuth, function(req, res){
  const idmycomments = req.params.idmycomments;
  con.query('SELECT * FROM mycomments WHERE idmycomments=?', [idmycomments], function(err, data) {
    if(err) return console.log(err);
     res.render("editComments.hbs", {
      idmycomment: data[0]
    });
  });
});


app.post("/editCom", encodeUrl, function (req, res) {
         
  if(!req.body) return res.sendStatus(400);
  const username = req.body.username;
  const film = req.body.film;
  const rating = req.body.rating;
  const review = req.body.review;
  const sendDate = req.body.sendDate;
  const id = req.body.id;
  console.log(id, username, film, rating, review, sendDate)
  con.query(`UPDATE mycomments SET iduser=?, rating=?, review=?, namefilm=? WHERE idmycomments=?`, [username, rating, review, film, id], function(err, data) {
    if(err) return console.log(err);
    res.redirect('/comments');
  });
});







// работа с пользователями

app.get('/admin', isAuth, function(req, res){
    con.query(`SELECT * FROM users`, function(err, data) {
      if(err) return console.log(err);
      if (req.session.user.role == "ADMIN"){res.render("usertable.hbs", {
        users: data
    });}
    else res.redirect('/access');
      
    });
});

app.get('/access', function(req, res){
  res.render('access');
});

// возвращаем форму для добавления данных
app.get('/create', isAuth, function(req, res){
    res.render('create');
});
// получаем отправленные данные и добавляем их в БД 
app.post("/create", encodeUrl, function (req, res) {
         
    if(!req.body) return res.sendStatus(400);
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const userName = req.body.userName;
    const password = req.body.password;
    const role = req.body.role;

    con.query(`INSERT INTO users (firstName, lastName, userName, password, role) VALUES (?,?,?,?,?)`, [firstName, lastName, userName, password, role], function(err, data) {
      if(err) return console.log(err);
      res.redirect('/admin');
    });
});
 
// получем id редактируемого пользователя, получаем его из бд и отправлям с формой редактирования
app.get('/edit/:id', isAuth, function(req, res){
  const id = req.params.id;
  con.query('SELECT * FROM users WHERE id=?', [id], function(err, data) {
    if(err) return console.log(err);
     res.render("edit.hbs", {
        user: data[0]
    });
  });
});
// получаем отредактированные данные и отправляем их в БД
app.post("/edit", encodeUrl, function (req, res) {
         
  if(!req.body) return res.sendStatus(400);
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const password = req.body.password;
  const userName = req.body.userName;
  const role = req.body.role;
  const id = req.body.id;
  console.log(id, firstName, lastName, userName, password)
  con.query(`UPDATE users SET firstName=?, lastName=?, password=?, userName=?, role=? WHERE id=?`, [firstName, lastName, password, userName, role, id], function(err, data) {
    if(err) return console.log(err);
    res.redirect('/admin');
  });
});
 
// получаем id удаляемого пользователя и удаляем его из бд
app.post("/delete/:id", function(req, res){
          
  const id = req.params.id;
  con.query(`DELETE FROM users WHERE id=?`, [id], function(err, data) {
    if(err) return console.log(err);
    res.redirect('/admin');
  });
});




// opinion

app.get('/opinion/:name',function(req, res){
  const name = req.params.name;
  con.query('SELECT * FROM films WHERE name=?', [name], function(err, data) {
    if(err) return console.log(err);
    con.query('SELECT * FROM mycomments WHERE namefilm=?', [name], function(err, mydata) {
      if(err) return console.log(err);
      res.render("opinion.hbs", {
        mycomments: mydata,
        film: data[0]
        });
      });  
    
  });

});

app.post('/logout', (req, res) => {
  req.session.destroy((err) =>{
    if(err) throw err;
    res.redirect('/');
  })
})




app.post("/opinion/:name",  encodeUrl, function(req, res){
  if(!req.body) return res.sendStatus(400);
 // const commentName = req.body.commentName;
 const namelink = req.params.name;

  const commentBody = req.body.commentBody;
  const commentRate = req.body.resRating;
  const commentFilm  = req.body.filmName;

  const commentNazva = req.body.filmNazva;

  const commentName = req.body.commentName;


 
  const story = req.body.story;
  var st = Number(story);
  const actor = req.body.actor;
  var ac = Number(actor);
  const music = req.body.music;
  var m = Number(music);
  const graphic = req.body.graphic;
  var g = Number(graphic);
  const final = req.body.final;
  var f = Number(final);
  

  const commentRate2 = (st + ac + m + g + f) / 5;

 // console.log(story,actor )

 // console.log(st, ac, m, g, f);

  console.log("comment:",commentBody, commentNazva);

  console.log(commentFilm, commentRate2, commentBody, commentName);

  con.query(`INSERT INTO mycomments (iduser, idfilm, rating, review, namefilm) VALUES (?,?,?,?,?)`, [  commentName,   commentFilm, commentRate2, commentBody, commentNazva ], function(err, data) {

    if(err) return console.log(err);
    //res.redirect('/admin');
  });


  
 
  con.query(`UPDATE films SET amount=amount+${commentRate2}, number_people=number_people+1 WHERE name='${commentNazva}'`, function(err, kdata) {
    if(err) return console.log(err);
  
  });

  res.redirect('/opinion/' + namelink);
  

  //хз может работает

  // con.query('SELECT * FROM mycomments WHERE idfilm=?', [commentFilm], function(err, mydata) {
  //   if(err) return console.log(err);
  //   res.render("opinion.hbs", {
  //     mycomments: mydata
  //     });
  //   });  
  


      
    //   data.forEach(function(item){
    //     console.log(item.send_date, item.iduser, item.review);
    //     out += `<p class="text-right small"><em>${item.send_date}</em></p>`;
    //     out += `<p class="alert alert-primary" role="alert">${item.iduser}</p>`;
    //     out += `<p class="alert alert-success" role="alert">${item.review}</p>`;
    // });

});


app.post("/", encodeUrl, function (req, res) {
         
  if(!req.body) return res.sendStatus(400);

  const name = req.body.name;
  const image = req.body.image;
  const year = req.body.year;
  const genre = req.body.genre;
  const duration = req.body.duration;
  const link = req.body.link;
  const description = req.body.description;

  //console.log(name, year, genre, duration, link, description, image);


      con.query (`SELECT * from films WHERE name=?`, [name], function(err, data) {
        if(!data.length)           con.query(`INSERT INTO films (name, year, genre, duration, link, description, image, amount, number_people) VALUES (?,?,?,?,?,?,?,?,?)`, [name, year, genre, duration, link, description, image, 0, 0]);
         
        });
                
      //$res = mysql_query($query, $MyConnection);
      // if (rows.length > 0){console.log("много");}
      //   else{
      //     con.query(`INSERT INTO films (name, year, genre, duration, link, description, image, amount, number_people) VALUES (?,?,?,?,?,?,?,?,?)`, [name, year, genre, duration, link, description, image, 0, 0], function(err, data) {
      //       if(err) return console.log(err);
      //       });

      //}
      // if(mysql_num_rows($res)==0){
      //   $query = "INSERT INTO goods (id, itemName, price, cnt) VALUES ({$itemID}, '{$newItemName}', {$newItemPrice}, {$newItemCount});";
      // }
      // else{
      //   $query = "UPDATE goods SET itemName='{$newItemName}', price={$newItemPrice}, cnt={$newItemCount} WHERE id={$itemID}";
      // }
      // $res = mysql_query($query, $MyConnection);

 

});




app.get("*", (req,res) =>{
  res.render('404')
});


const PORT = 3001

app.listen(PORT, () => {
console.log('Server started: http://localhost:&{POST}')
})