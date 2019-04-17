var DMM = require('../data-model-mapper');

var dtToObject = function (date, time) {
  var obj = new Date();
  var d = date.split('');
  var t = time.split('');
  obj.setFullYear(d[0] + d[1] + d[2] + d[3]);
  obj.setMonth(Number(d[4] + d[5]) - 1);
  obj.setDate(d[6] + d[7]);
  obj.setHours(t[0] + t[1]);
  obj.setMinutes(t[2] + t[3]);
  obj.setSeconds(t[4] + t[5]);
  return obj;
};

var dateObjToDateTime = function (dateObj) {
  var zerofill = function (num) {
    return num < 10 ? '0' + String(num) : String(num);
  };
  return [
    String(dateObj.getFullYear()) + zerofill(dateObj.getMonth() + 1) + zerofill(dateObj.getDate()),
    zerofill(dateObj.getHours()) + zerofill(dateObj.getMinutes()) + zerofill(dateObj.getSeconds())
  ];
};

var concatName = function (firstName, lastName) {
  return firstName + ' ' + lastName;
};

var splitName = function (name) {
  return name.split(' ');
};

var conf = [
  {dest: 'id', src: 'ID'},
  {dest: 'accountCreation', src: ['DATE', 'TIME'], map: dtToObject, revert: dateObjToDateTime},
  {dest: 'employeeName', src: ['FIRST_NAME', 'LAST_NAME'], map: concatName, revert: splitName}
];

var obj = {
  DATE: '20160512',
  TIME: '140000',
  FIRST_NAME: 'John',
  LAST_NAME: 'Doe',
  ID: '000210290'
};

console.log(obj);
var m = new DMM(conf);

var mapped = m.map(obj);
console.log(mapped);

var reverted = m.revert(mapped);
console.log(reverted);

var new_obj = {
  DATE: '20160512',
  TIME: '140000',
  FIRST_NAME: 'John',
  LAST_NAME: 'Doe'
  //ID missing
};

console.log(new_obj);

var new_mapped = m.map_existing_keys(new_obj);
console.log(new_mapped);

var new_reverted = m.revert_existing_keys(new_mapped);
console.log(new_reverted);
