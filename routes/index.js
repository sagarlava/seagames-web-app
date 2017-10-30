var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  if (req.session.authenticated)  {
    var user = req.session.user;
    res.render('index', { title: 'Express' , user:user});   
  }
    else{
        res.redirect("/users/signup");
    }
});

router.get('/reports', function(req, res, next) {
  if (req.session.authenticated)  {
//    var user = req.session.user;
    res.render('reports', { title: 'Express'});   
  }
    else{
        res.redirect("/users/signup");
    }
});

router.get('/logout', (req, res, next) => {
    req.session.destroy();
    res.redirect('/users/signup');
});


module.exports = router;