var ncp = require('ncp').ncp;
const fs = require('fs');

ncp.limit = 16;

ncp("./src", "./build", {
    filter: (source) => {
        if (fs.lstatSync(source).isDirectory()) {
            return true;
        } else {
            return source.match(/.*html/) != null;
        }
    }
}, function (err) {
    if (err) {
        return console.error(err);
    }
    console.log('done!');
});