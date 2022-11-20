module.exports = (function(instanceConstructor){
    var instance;
    return {
        setInstance : function(value) {
            instance = value;
        },
        getInstance : function(){
            if(!instance) {  // check already exists
                instance = instanceConstructor();
            }
            return instance;
        }
    }
});
