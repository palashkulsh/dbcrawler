var Util = require('util');

var DataUtils = {
    splitArrayToMultipleArray: function (arr,splitSize){
	var splittedArray=[];
	var tempArr;
	for(start=0;start<arr.length;start+=splitSize){
	    tempArr=arr.slice(start,start+splitSize);
		splittedArray.push(tempArr);
	}
	return splittedArray;
    }
};
module.exports=DataUtils;

(function(){
    if(require.main==module){	
	console.log(DataUtils.splitArrayToMultipleArray([1,2,3,4,5,6,7,8,9,10],7))
    }
})();
