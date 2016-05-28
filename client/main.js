if(Meteor.isClient){
    // client code goes here
}

if(Meteor.isServer){
    // server code goes here
}

Template.todos.helpers({
    'todo': function() {
        return Todos.find({}, {sort: {createdAt: -1}});
    }
});

Template.addTodo.events({
    'submit form': function(event){
        event.preventDefault();
        var todoName = $('[name="todoName"]').val();
        Todos.insert({
            name: todoName,
            completed: false,
            createdAt: new Date()
        });
        $('[name="todoName"]').val('');
    }
});

Template.todoItem.events({
    'click .delete-todo': function(event){
        event.preventDefault();
        var documentId = this._id;
        var confirm = window.confirm("Delete this task?");
        if(confirm){
            Todos.remove({_id: documentId});
        }
    },

    'keyup [name=todoItem]': function(event){
        if(event.which == 13 || event.which == 27){
            $(event.target).blur();
        } else {
            var documentId = this._id;
            var todoItem = $(event.target).val();
            Todos.update({_id: documentId}, {$set: {name: todoItem}});
        }
    },

    'change [type=checkbox]': function() {
        var documentId = this._id;
        var isCompleted = this.completed;
        if(isCompleted){
            Todos.update({_id: documentId}, {$set: {completed: false}});
        } else {
            Todos.update({_id: documentId}, {$set: {completed: true}});
        }
    }

});

Template.todoItem.helpers({
    'checked': function() {
        var isCompleted = this.completed;
        if(isCompleted){
            return "checked";
        } else {
            return "";
        }
    }
});

Template.todosCount.helpers({
    'totalTodos': function(){
        return Todos.find().count();
    },

    'completedTodos': function(){
        return Todos.find({completed: true}).count();
    }
});

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

Template.navigation.events({
    'click .logout': function(event) {
        event.preventDefault();
        Meteor.logout();
        Router.go('login');
    }
});

Router.configure({
    layoutTemplate: 'main'
});

Router.route('/register');

Router.route('/login');

Router.route('/', {
    name: 'home',
    template: 'home'
});
