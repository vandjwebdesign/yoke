/**
 * @file
 * Contains client and server template+view routing configurations.
 */

//Route config below
Router.configure({
  layoutTemplate: 'base'
});
var OnBeforeActions = {
  loginRequired: function() {
    if (!Meteor.userId()) {
      this.render('landing');
    } else {
      this.next();
    }
  }
};
/** Filter for routes allowed without authentication */
Router.onBeforeAction(OnBeforeActions.loginRequired, {
  except: ['landing']
});

/** Home page route */
Router.route('/', function() {
  var user = Meteor.user();
  /* FIXME: Implement reactive join */
  // Generating user's feed below:
  var pkg = Yokes.find({
    user: Meteor.userId()
  }).fetch();
  Graph.find({
      user: Meteor.userId()
    })
    .fetch()
    .forEach(function(e) {
      var _yokes = Yokes.find({
        user: e.follows
      }).fetch();
      pkg.push.apply(pkg, _yokes);
    });
  var yokes = _.sortBy(pkg, function(o) {
    return o.createdAt;
  }).reverse();

  // Render w/ payload
  this.render('home', {
    data: {
      pageOwner: true,
      userContext: Meteor.userId(),
      username: user && user.profile.name,
      yokes: yokes
    }
  });
}, {
  name: 'home'
});

/** User page route */
Router.route('/users/:user_id', function() {

  var user = Meteor.users.findOne({
    _id: this.params.user_id
  });
  var yokes = Yokes.find({
    user: this.params.user_id
  }, {
    sort: {
      createdAt: -1
    }
  });
  var noYokes = yokes && yokes.count();
  this.render('home', {
    data: {
      pageOwner: false,
      userContext: this.params.user_id,
      username: user && user.profile.name,
      yokes: yokes,
      noYokes: (noYokes) ? false : true
    }
  });
}, {
  name: 'users',
  onBeforeAction: function() {
    if (!Meteor.users.findOne({
        _id: this.params.user_id
      })) {
      Router.go('/');
    } else {
      this.next();
    }
  }
});

/** Following users list */
Router.route('/following', function() {
  var pkg = new Array();
  Graph.find({
      user: Meteor.userId()
    })
    .fetch()
    .forEach(function(e) {
      // console.log(e);
      pkg.push(Meteor.users.findOne({
        _id: e.follows
      }));
    });
  this.render('userlist', {
    data: {
      title: "Following",
      users: pkg
    }
  });
});
/** Route displaying user's followers */
Router.route('/followers', function() {
  var pkg = new Array();
  Graph.find({
      follows: Meteor.userId()
    })
    .fetch()
    .forEach(function(e) {
      // console.log(e);
      pkg.push(Meteor.users.findOne({
        _id: e.user
      }));
    });
  this.render('userlist', {
    data: {
      title: "Followers",
      users: pkg
    }
  });
});