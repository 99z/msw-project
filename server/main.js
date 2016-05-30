import { Meteor } from 'meteor/meteor';

/*
Required configuration to hook the application into my FB testing app.
 */
ServiceConfiguration.configurations.upsert(
    {service: "facebook"},
    {
        $set: {
            appId: '1060987587326745',
            secret: '1f2189cff59a69083c7284a08a3a0d36'
        }
    }
);



Meteor.startup(() => {
    Meteor.methods({

        /*
        Saves the currently logged in user's access token for the FB graph API.
        Makes a synchronous call to the FB graph API to return a list of pages
        owned by the currently logged in user.
         */
        "getPages": function() {
            FBGraph.setAccessToken(Meteor.user().services.facebook.accessToken);
            var facebookUserId = Meteor.user().services.facebook.id;
            var getPagesSync = Meteor.wrapAsync(FBGraph.get);
            var result = getPagesSync(facebookUserId + "/accounts");

            return result.data;
        },

        /*
        Publishes a post with passed content to a page whose ID is also passed.
        Gets the access token for the page we want to post to, then posts.
        Logs an error to the console if there is one.
         */
        "publishPost": function(pageID, postcontent) {
            var token_request = { fields: "access_token" };
            var getATSync = Meteor.wrapAsync(FBGraph.get);
            var pageAT = getATSync(pageID, token_request);

            var args = { access_token: pageAT.access_token, message: postcontent};
            FBGraph.post(pageID + "/feed", args, function(err, res) {
                if (err) {
                    console.log(err);
                }
            });
        }
    });

});
