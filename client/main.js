if(Meteor.isClient){
    // client code goes here
}

if(Meteor.isServer){
    // server code goes here
}

Template.register.events({
    'submit form': function(event) {
        event.preventDefault();
        var username = $('[name=username]').val();
        var password = $('[name=password]').val();
        Accounts.createUser({
            username: username,
            password: password
        }, function(error) {
            if(error) {
                alert(error.reason);
            } else {
                Router.go('home');
            }
        });
        Router.go('home');
    }
});

Template.login.events({
    'submit form': function(event) {
        event.preventDefault();
        var username = $('[name=username]').val();
        var password = $('[name=password]').val();
        Meteor.loginWithPassword(username, password, function(error) {
            if(error) {
                alert(error.reason);
            } else {
                Router.go('home');
            }
        });
    }
});

Template.pageView.events({
    'click .publishpost': function(event) {
        Meteor.call("publishPost", this.id, function(error, accessToken) {
            if (error) {
                console.log(error.reason);
            } else {
                console.log(accessToken);
            }
        });
    }
});

Template.pages.created = function() {
    this.pages = new ReactiveVar([]);

    var self = this;
    Meteor.call("getPages", function(error, res) {
        if (error) {
            console.log(error.reason);
        } else {
            self.pages.set(res);
        }
    });
}

Template.pages.helpers({
    'page': function() {
        Template.instance().pages.get().forEach(function(item) {
            if (!Pages.findOne({name: item.name})) {
                Pages.insert({
                    name: item.name,
                    id: item.id
                });
            }
        });
        return Template.instance().pages.get();
    }
});

Template.navigation.events({
    'click .logout': function(event) {
        event.preventDefault();
        Meteor.logout();
        Router.go('login');
    },

    'click .fblogin': function(event) {
        Meteor.loginWithFacebook({
            requestPermissions: ['manage_pages', 'publish_pages', 'user_posts', 'user_status']
        }, function(error) {
            if (error)
                Session.set('errorMessage', error.reason || "Unknown error");
        });
        Router.go('pages');
    }
});

Router.configure({
    layoutTemplate: 'main'
});

Router.route('/register');

Router.route('/pages');

Router.route('/login');

Router.route('/', {
    name: 'home',
    template: 'home'
});

Router.route('/page/:id', {
    template: 'pageView',
    data: function() {
        var currentPage = String(this.params.id);
        return Pages.findOne({id: this.params.id});
    }
});
