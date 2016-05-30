/*
When a user submits the registration form, create + add them to DB and log in.
Sends the newly registered and logged in user to the home page.
 */
Template.register.events({
    'submit form': function(event) {
        event.preventDefault();
        var username = $('[name=username]').val();
        var password = $('[name=password]').val();
        Accounts.createUser({
            username: username,
            password: password
        });
        Router.go('home');
    }
});

/*
When a user submits the login form, logs them in to their account.
Prints an error reason to the console if an error occurs during login.
 */
Template.login.events({
    'submit form': function(event) {
        event.preventDefault();
        var username = $('[name=username]').val();
        var password = $('[name=password]').val();
        Meteor.loginWithPassword(username, password, function(error) {
            if (error) {
                alert(error.reason);
            } else {
                Router.go('home');
            }
        });
    }
});

/*
Allows the user to submit the new post form for a particular page they operate.
Calls the publishPost method on the server, which uses FBGraph API to make
the post.
Logs an error to the console if something went wrong.
Finally, replaces placeholder text with a confirmation message.
 */
Template.pageView.events({
    'submit .new-post': function(event) {
        event.preventDefault();
        var content = event.target.postcontent.value;
        Meteor.call("publishPost", this.id, content, function(error, accessToken) {
            if (error) {
                console.log(error.reason);
            }
        });
        $("#postArea").attr("placeholder", "Posted! Got more to say?").val("").focus().blur();
    }
});

/*
On template instantiation, call getPages method on server to request pages
the currently logged in user has permission to post as.
 */
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

/*
With the list of pages returned upon template instantiation, insert any pages
that are not already in the database to the Pages DB.
Return a list of the pages the user has access to post as for the DOM.
 */
Template.pages.helpers({
    'page': function() {
        Template.instance().pages.get().forEach(function(item) {
            if (!Pages.findOne({
                    name: item.name
                })) {
                Pages.insert({
                    name: item.name,
                    id: item.id
                });
            }
        });
        return Template.instance().pages.get();
    }
});

/*
Logs a user out upon clicking the logout link in the navbar.
Opens a Facebook OAuth login prompt upon clicking the FB Login link in navbar.
 */
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

/*
Below is basic router configuration.
 */
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
        return Pages.findOne({
            id: this.params.id
        });
    }
});
