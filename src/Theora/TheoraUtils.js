/**
 * Created with JetBrains WebStorm.
 * User: blakec
 * Date: 5/31/13
 * Time: 5:53 PM
 * To change this template use File | Settings | File Templates.
 */

var TheoraUtils =new function(){};

TheoraUtils.ilog = function (x) {

    var i = 0;
    while (x) {
        x = x >> 1;
        i++;
    }

    return i;
};