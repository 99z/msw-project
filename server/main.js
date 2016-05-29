import { Meteor } from 'meteor/meteor';

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

        "getPages": function() {
            FBGraph.setAccessToken(Meteor.user().services.facebook.accessToken);
            var facebookUserId = Meteor.user().services.facebook.id;
            var getPagesSync = Meteor.wrapAsync(FBGraph.get);
            var result = getPagesSync(facebookUserId + "/accounts");

            return result.data;
        },

        "publishPost": function(pageID, postcontent) {
            var token_request = { fields: "access_token" };
            var getATSync = Meteor.wrapAsync(FBGraph.get);
            var pageAT = getATSync(pageID, token_request);

            console.log(pageAT.access_token);

            var args = { access_token: pageAT.access_token, message: postcontent};
            FBGraph.post(pageID + "/feed", args, function(err, res) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(res);
                }
            });
        }
    });

});
