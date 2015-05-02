exports.default = {
    taskmanager: function(api){
        return {
            //On/Off Switch
            active: true,
            //MongoDB Connection Details
            mongo: {
                host: '127.0.0.1',
                port: 27017,
                database: "ah-taskmanager-plugin",
                user: null,
                password: null

            }
        }
    }
}